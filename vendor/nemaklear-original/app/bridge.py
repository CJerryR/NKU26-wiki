"""Load the saved dual-channel calibration and classify density with Eco rules."""
import argparse
import json
from pathlib import Path
import sys

import numpy as np

ROOT = Path(__file__).resolve().parent
LIBRARY = ROOT/'vendor'
sys.path.insert(0, str(LIBRARY))
from src.modeling.dual_channel.calibration import Calibration, predict
from src.modeling.economic.eco_model_pkg.config import load_model
from src.modeling.economic.eco_model_pkg.economics import choose_treatment

DEFAULT_MODEL = ROOT/'data/calibration.json'
DEFAULT_ECO = ROOT/'data/eco.json'


def load_calibration(path):
    data = json.loads(Path(path).read_text())
    if data['density_unit'] != 'J2/100 cm^3 soil':
        raise ValueError('校准模型密度单位必须是 J2/100 cm^3 soil')
    model = Calibration(
        np.asarray(data['coefficients'], dtype=float), np.asarray(data['covariance'], dtype=float),
        data['residual_variance'], data['df'], np.asarray(data['hull_equations'], dtype=float),
        tuple(data['calibration_density_range']), data['protocol_id'], data['evidence_status'],
        data['reference_basis'], data['condition_number'])
    return model, data


def classify_prediction(prediction, eco):
    """Apply Eco's grade function after the existing prediction/domain checks."""
    result = dict(status='blocked', point_grade=None, possible_grades=[], grade_uncertain=None,
                  physical_interval=None, reasons=list(prediction['reasons']))
    if not prediction['within_calibration_range']:
        return result
    if prediction['density_unit'] != eco.density_unit:
        result['reasons'].append('unit_mismatch')
        return result
    low, high = prediction['prediction_interval_95']
    low = max(0., low)
    cal_low, cal_high = prediction['calibration_density_range']
    if low < cal_low or high > min(cal_high, eco.max_density):
        result['reasons'].append('interval_outside_supported_density_range')
        return result
    values = [low, high, prediction['density']]
    values.extend(t for t in (eco.middle_from_density, eco.high_from_density) if low <= t <= high)
    bands = {choose_treatment(value, eco)[0] for value in values}
    uncertain = len(bands) > 1
    result.update(status='uncertain' if uncertain else 'classified',
                  point_grade=choose_treatment(prediction['density'], eco)[0],
                  possible_grades=[band for band in ('低', '中', '高') if band in bands],
                  grade_uncertain=uncertain, physical_interval=[low, high],
                  interval_truncated_at_zero=prediction['prediction_interval_95'][0] < 0)
    return result


def main():
    parser = argparse.ArgumentParser(description='两路空白校正A480 → Mi密度 → Eco风险等级（当前为模拟校准）')
    parser.add_argument('x3', type=float, help='通道3空白校正后的A480')
    parser.add_argument('x18', type=float, help='通道18空白校正后的A480')
    parser.add_argument('--protocol-id', required=True, help='读数对应的测量协议，须与校准版本一致')
    parser.add_argument('--model', type=Path, default=DEFAULT_MODEL)
    parser.add_argument('--eco-config', type=Path, default=DEFAULT_ECO)
    parser.add_argument('--saturated', action='store_true', help='上游读色质控标记为饱和')
    parser.add_argument('--qc-failed', action='store_true', help='上游质控未通过')
    parser.add_argument('--output', type=Path, help='可选JSON输出文件，须尚不存在')
    args = parser.parse_args()
    try:
        model, metadata = load_calibration(args.model)
        eco = load_model(args.eco_config)
        prediction = predict(model, [args.x3, args.x18], protocol_id=args.protocol_id,
                             saturated=args.saturated, qc_pass=not args.qc_failed)
        result = dict(density=prediction['density'], density_unit=prediction['density_unit'],
                      formal_prediction_interval_95=prediction['prediction_interval_95'],
                      risk=classify_prediction(prediction, eco),
                      evidence_status=prediction['evidence_status'],
                      interval_interpretation=metadata['interval_interpretation'],
                      protocol_id_used=args.protocol_id, calibration_protocol_id=model.protocol_id,
                      input_convention=metadata['input_unit'],
                      eco_scenario=dict(country=eco.country, crop=eco.crop, nematode=eco.nematode),
                      thresholds=dict(middle_from=eco.middle_from_density, high_from=eco.high_from_density),
                      calibration_file=str(args.model.resolve()), eco_config_file=str(args.eco_config.resolve()))
        content = json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False)+'\n'
        if args.output:
            with args.output.open('x') as f:
                f.write(content)
        print(content, end='')
    except (OSError, ValueError, KeyError, TypeError) as exc:
        parser.error(str(exc))


if __name__ == '__main__':
    main()
