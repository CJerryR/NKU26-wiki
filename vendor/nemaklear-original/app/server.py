"""Local-only UI adapter for the bundled ODE, calibration and Eco report code."""
import argparse
from collections import OrderedDict
import csv
import html
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import importlib.util
import json
import math
import mimetypes
from pathlib import Path
import threading
from urllib.parse import urlsplit, parse_qs, unquote
import uuid

import numpy as np
import bridge
from src.modeling.economic.eco_model_pkg.economics import evaluate
from src.modeling.economic.eco_model_pkg.reporting import build_diagnostic_report, format_html_report, _english_report, _net_benefit_curve_svg

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT/'public'
CALIBRATION, META = bridge.load_calibration(bridge.DEFAULT_MODEL)
ECO = bridge.load_model(bridge.DEFAULT_ECO)
MATRIX = json.loads((ROOT/'data/matrix.json').read_text())
ROWS = {r['sample_id']: r for r in MATRIX['rows']}
spec = importlib.util.spec_from_file_location('bundled_core', ROOT/'vendor/literature_core.py')
core = importlib.util.module_from_spec(spec)
spec.loader.exec_module(core)
LOCK = threading.Lock()
RESULTS = OrderedDict()


def number(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        raise ValueError('请输入有限的数值。')
    return float(value)


def simulate(sample):
    curves, signals = {}, []
    for ch in ('3', '18'):
        model = core.LiteratureCoreModel(ROOT/f'data/channel{ch}.json', ROOT/'data/core-source.json')
        adapter = model.parameters['calibration_adapter']
        end = adapter['read_time_h']*3600
        stimulus = (adapter['S3_weight']*sample['ascr3_nM'] + adapter['S18_weight']*sample['ascr18_nM'])/adapter['ligand_reference_nM']
        times = np.linspace(0, end, 161)
        trajectory = model.solve(stimulus, times)
        blank_curve = model.solve(0., times).y[-1]
        blank = float(blank_curve[-1])
        signals.append(float(.048*(trajectory.y[-1, -1]-blank)))
        curves[ch] = dict(hours=(trajectory.t/3600).tolist(), fus3=trajectory.y[3].tolist(),
                          pigment=trajectory.y[-1].tolist(), pigment_blank=blank_curve.tolist(),
                          pigment_net=(trajectory.y[-1]-blank_curve).tolist(),
                          effective_L=stimulus, blank_A480=.048*blank)
    return signals, curves


def classify_demo(prediction):
    """Separate grade from calibration coverage in this simulated UI only.

    The frozen strict classifier remains unchanged and is returned alongside this
    display policy. Invalid measurements, negative estimates and unsupported
    Eco densities still block reports. Calibration-boundary estimates may be
    shown only as explicitly conditional simulation scenarios.
    """
    reasons = list(prediction['reasons'])
    hard = [r for r in reasons if r != 'outside_density_calibration']
    result = dict(status='blocked', point_grade=None, possible_grades=[],
                  grade_uncertain=None, physical_interval=None, reasons=hard,
                  calibration_warnings=[], conditional_demo=False)
    if hard:
        return result
    if prediction['density_unit'] != ECO.density_unit:
        result['reasons'].append('unit_mismatch')
        return result
    point = prediction['density']
    low, high = prediction['prediction_interval_95']
    low = max(0., low)
    if not 0 <= point <= ECO.max_density or high > ECO.max_density:
        result['reasons'].append('outside_eco_domain')
        return result
    cal_low, cal_high = prediction['calibration_density_range']
    warnings = []
    if 'outside_density_calibration' in reasons:
        warnings.append('outside_density_calibration')
    if low < cal_low or high > cal_high:
        warnings.append('interval_outside_calibration')
    bands = {bridge.choose_treatment(d, ECO)[0] for d in [low, point, high]}
    uncertain = len(bands) > 1
    result.update(status='conditional' if warnings else 'uncertain' if uncertain else 'classified',
                  point_grade=bridge.choose_treatment(point, ECO)[0],
                  possible_grades=[b for b in ('低', '中', '高') if b in bands],
                  grade_uncertain=uncertain, physical_interval=[low, high],
                  interval_truncated_at_zero=prediction['prediction_interval_95'][0] < 0,
                  calibration_warnings=warnings, conditional_demo=bool(warnings))
    return result


def calculate(payload):
    mode = payload.get('mode')
    curves, sample = None, None
    if mode == 'simulation':
        sample = ROWS.get(payload.get('sample_id'))
        if sample is None:
            raise ValueError('请选择已保存的模拟样本。')
        signals, curves = simulate(sample)
    elif mode == 'manual':
        values = payload.get('signals')
        if not isinstance(values, list) or len(values) != 2:
            raise ValueError('需要同一样本的两路吸光度。')
        signals = [number(v) for v in values]
        if payload.get('signal_type') == 'raw':
            blanks = payload.get('blanks')
            if not isinstance(blanks, list) or len(blanks) != 2:
                raise ValueError('原始读数需要两个匹配空白。')
            signals = [v-number(b) for v, b in zip(signals, blanks)]
        elif payload.get('signal_type') != 'corrected':
            raise ValueError('请注明是否已扣除空白。')
    else:
        raise ValueError('请选择模拟或手动输入模式。')
    saturated = payload.get('saturated', False)
    if not isinstance(saturated, bool):
        raise ValueError('饱和标记必须为布尔值。')
    prediction = bridge.predict(CALIBRATION, signals, protocol_id=CALIBRATION.protocol_id, saturated=saturated)
    strict_risk = bridge.classify_prediction(prediction, ECO)
    risk = classify_demo(prediction)
    scenarios = []
    if risk['status'] != 'blocked':
        low, high = risk['physical_interval']
        candidates = [(prediction['density'], '点估计'), (low, '区间下端'), (high, '区间上端')]
        for threshold in (ECO.middle_from_density, ECO.high_from_density):
            if low < threshold <= high:
                candidates.extend([(math.nextafter(threshold, -math.inf), f'阈值 {threshold:g} 下侧'),
                                   (threshold, f'阈值 {threshold:g} 起点')])
        seen = set()
        for density, label in candidates:
            if density in seen:
                continue
            seen.add(density)
            scenarios.append(dict(density=density, label=label, grade=bridge.choose_treatment(density, ECO)[0]))
    result = dict(mode=mode, corrected_signals=signals, prediction=prediction, risk=risk, strict_risk=strict_risk, ui_policy_version=4,
                  sample=sample, curves=curves, scenarios=scenarios, evidence_status='simulated',
                  protocol_id=CALIBRATION.protocol_id,
                  interpretation='模拟校准模型；形式预测区间不具有已验证的真实样本95%覆盖率。',
                  curve_interpretation='当前所选模拟样本的正向ODE计算' if curves else '手动颜色未经过ODE反演；参考图仅用于解释模型')
    return result


def bootstrap():
    with (ROOT/'data/endpoints.csv').open() as source:
        paired = list(csv.DictReader(source))
    samples = []
    for sample in ROWS.values():
        item = dict(sample)
        item['signals'] = [float(next(r for r in paired if r['sample_id'] == sample['sample_id'] and r['channel'] == ch)['ode_A480_blank_corrected']) for ch in ('3', '18')]
        samples.append(item)
    return dict(ui_policy_version=4, samples=samples, protocol_id=CALIBRATION.protocol_id,
                thresholds=[ECO.middle_from_density, ECO.high_from_density],
                scenario=f'{ECO.country} · {ECO.crop}', model_version='v4 / ODE r04 / Dual r01')


def eco_view(result, index, language='zh-CN'):
    """Native-page data, using the exact same Eco calculations as the old report."""
    if result['risk']['status'] == 'blocked' or index < 0:
        raise ValueError('此预测不可生成报告。')
    scenario = result['scenarios'][index]
    report = build_diagnostic_report(ECO, evaluate(scenario['density'], ECO))
    if language == 'en':
        report = _english_report(report)
    svg = _net_benefit_curve_svg(report, language=language)
    # Presentation only: preserve curve points, threshold breaks and marker positions.
    for original, replacement in {
        '#176744':'#6e4fb8', '#b76518':'#bb7914', '#e8f5ed':'#f3eef8',
        '#fff4d6':'#faf0da', '#fbe9e5':'#f3edf1', '#dbe4de':'#e5dce8',
        '#617269':'#7b7280',
    }.items():
        svg = svg.replace(original, replacement)
    return dict(report=report, curve_svg=svg, language=language,
                context=dict(scenario=scenario, prediction_density=result['prediction']['density'],
                             physical_interval=result['risk']['physical_interval'],
                             conditional_demo=result['risk']['conditional_demo'],
                             grade_uncertain=result['risk']['grade_uncertain'],
                             evidence_status=result['evidence_status']))


class Handler(BaseHTTPRequestHandler):
    def send(self, code, content, content_type='application/json; charset=utf-8'):
        if isinstance(content, (dict, list)):
            content = json.dumps(content, ensure_ascii=False, allow_nan=False).encode()
        elif isinstance(content, str):
            content = content.encode()
        self.send_response(code)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(content)

    def do_POST(self):
        if self.path != '/api/predict':
            return self.send(404, {'error': '不存在的接口'})
        origin = self.headers.get('Origin')
        if origin and origin != f'http://{self.headers.get("Host")}':
            return self.send(403, {'error': '只接受本地页面的请求'})
        try:
            size = int(self.headers.get('Content-Length', '0'))
            if not 0 < size <= 16384:
                raise ValueError('输入大小无效')
            payload = json.loads(self.rfile.read(size))
            if not isinstance(payload, dict):
                raise ValueError('输入需要为对象')
            result = calculate(payload)
            token = uuid.uuid4().hex
            result['id'] = token
            with LOCK:
                RESULTS[token] = result
                if len(RESULTS) > 32:
                    RESULTS.popitem(last=False)
            self.send(200, result)
        except (ValueError, TypeError, KeyError) as exc:
            self.send(400, {'error': str(exc)})

    def do_GET(self):
        url = urlsplit(self.path)
        if url.path == '/api/bootstrap':
            return self.send(200, bootstrap())
        if url.path.startswith('/api/eco/'):
            try:
                _, _, _, token, index = url.path.split('/')
                with LOCK:
                    result = RESULTS[token]
                language = 'en' if parse_qs(url.query).get('lang') == ['en'] else 'zh-CN'
                return self.send(200, eco_view(result, int(index), language))
            except (KeyError, ValueError, IndexError):
                return self.send(404, {'error': '报告已过期或此预测不可生成报告，请重新计算。'})
        if url.path.startswith('/report/'):
            try:
                _, _, token, index = url.path.split('/')
                with LOCK:
                    result = RESULTS[token]
                idx = int(index)
                if idx < 0:
                    raise ValueError('invalid index')
                scenario = result['scenarios'][idx]
                language = 'en' if parse_qs(url.query).get('lang') == ['en'] else 'zh-CN'
                report = build_diagnostic_report(ECO, evaluate(scenario['density'], ECO))
                page = format_html_report(report, language=language)
                low, high = result['risk']['physical_interval']
                text = (f'SIMULATED CALIBRATION · Estimated density {result["prediction"]["density"]:.2f}; formal interval {low:.2f}–{high:.2f} J2/100 cm³. This report evaluates ONE conditional density scenario, not a benefit confidence interval.'
                        if language == 'en' else
                        f'模拟校准演示｜双通道估计 {result["prediction"]["density"]:.2f}，形式区间 {low:.2f}–{high:.2f} J2/100 cm³。当前报告查看“{scenario["label"]}”这一条件情景；收益不是置信区间。')
                if result['risk']['conditional_demo']:
                    text += (' Calibration density coverage exceeded: conditional simulation only.' if language == 'en' else ' 密度或区间超过校准范围，仅供模拟情景展示。')
                banner = '<aside style="padding:18px 6%;background:#fff3d6;color:#5e461b;font:15px/1.6 sans-serif;border-bottom:1px solid #e7d6af">'+html.escape(text)+'</aside>'
                page = page.replace('<body>', '<body>'+banner, 1)
                return self.send(200, page, 'text/html; charset=utf-8')
            except (KeyError, ValueError, IndexError):
                return self.send(404, {'error': '报告已过期或此预测不可生成报告，请重新计算。'})
        path = (PUBLIC/unquote(url.path.lstrip('/') or 'index.html')).resolve()
        if not path.is_relative_to(PUBLIC.resolve()) or not path.is_file():
            return self.send(404, {'error': '文件不存在'})
        mime = mimetypes.guess_type(path)[0] or 'application/octet-stream'
        self.send(200, path.read_bytes(), mime)


def main():
    parser = argparse.ArgumentParser(description='Local two-channel ODE → density → Eco demo')
    parser.add_argument('--port', type=int, default=8765)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    print(f'Local demo: http://127.0.0.1:{server.server_port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
