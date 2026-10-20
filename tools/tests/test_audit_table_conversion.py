import importlib.util
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / 'audit-content-rules.py'
SPEC = importlib.util.spec_from_file_location('audit_content_rules', SCRIPT)
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)


def table_cell(text, formatting=None):
    return [{'text': text, 'format': formatting or []}]


class RawTableConversionTests(unittest.TestCase):
    def setUp(self):
        self.old = {'blocks': [{
            '_template': 'text',
            'body': '<div><table><tr><th>Term</th><th>Value</th></tr>'
                    '<tr><td><em>alpha</em></td><td>2 μL</td></tr></table></div>',
        }]}
        self.new = {'blocks': [{
            '_template': 'datatable',
            'csv': 'Term,Value\nalpha,2 μL\n',
            'sourceCellRuns': [
                [table_cell('Term', ['b']), table_cell('Value', ['b'])],
                [table_cell('alpha', ['i']), table_cell('2 μL')],
            ],
        }]}

    def test_conversion_requires_every_cell_to_match_and_runs_to_cover_csv(self):
        allowed, failures, changes = AUDIT.verified_raw_table_conversions(self.old, self.new)
        self.assertEqual(failures, [])
        self.assertEqual(changes, [])
        self.assertEqual([key for key, _ in allowed], ['csv', 'sourceCellRuns'])

        changed = {'blocks': [dict(self.new['blocks'][0], csv='Term,Value\nalpha,3 μL\n')]}
        _, failures, _ = AUDIT.verified_raw_table_conversions(self.old, changed)
        self.assertIn('block 0: datatable CSV cells differ from the original HTML table (outside approved spelling fixes)', failures)

        changed_runs = {'blocks': [dict(self.new['blocks'][0], sourceCellRuns=[
            [table_cell('Term', ['b']), table_cell('Value', ['b'])],
            [table_cell('beta', ['i']), table_cell('2 μL')],
        ])]}
        _, failures, _ = AUDIT.verified_raw_table_conversions(self.old, changed_runs)
        self.assertTrue(any('sourceCellRuns text differs' in item for item in failures))

    def test_preexisting_datatable_is_never_exempted(self):
        old = {'blocks': [dict(self.new['blocks'][0])]}
        allowed, failures, changes = AUDIT.verified_raw_table_conversions(old, self.new)
        self.assertEqual(allowed, [])
        self.assertEqual(failures, [])
        self.assertEqual(changes, [])

    def test_only_explicit_fixed_spelling_is_allowed_and_reported(self):
        self.old['blocks'][0]['body'] = '<table><tr><td>Lyophilization</td></tr></table>'
        self.new['blocks'][0] = {
            '_template': 'datatable', 'csv': 'freeze-drying\n',
            'sourceCellRuns': [[table_cell('freeze-drying')]],
        }
        _, failures, changes = AUDIT.verified_raw_table_conversions(self.old, self.new)
        self.assertTrue(failures, 'case-sensitive unrelated wording must not be normalized')
        self.old['blocks'][0]['body'] = '<table><tr><td>lyophilization</td></tr></table>'
        _, failures, changes = AUDIT.verified_raw_table_conversions(self.old, self.new)
        self.assertEqual(failures, [])
        self.assertEqual(changes, [{'block': 0, 'row': 1, 'cell': 1,
                                   'page': '', 'kind': 'copy-standardization',
                                   'before': 'lyophilization', 'after': 'freeze-drying'}])

    def test_katex_annotation_is_retained_as_an_explicit_run_latex_value(self):
        self.old['blocks'][0]['body'] = (
            '<table><tr><th><span class="katex"><span class="katex-mathml">'
            '<math><semantics><mrow/><annotation encoding="application/x-tex">G_{18}'
            '</annotation></semantics></math></span><span class="katex-html">G18</span>'
            '</span></th></tr></table>'
        )
        self.new['blocks'][0] = {
            '_template': 'datatable', 'csv': 'G_{18}\n',
            'sourceCellRuns': [[[{'text': 'G_{18}', 'format': [], 'latex': 'G_{18}'}]]],
        }
        allowed, failures, _ = AUDIT.verified_raw_table_conversions(self.old, self.new)
        self.assertEqual(failures, [])
        self.assertEqual(len(allowed), 2)
        self.new['blocks'][0]['sourceCellRuns'][0][0][0]['latex'] = 'G_{3}'
        _, failures, _ = AUDIT.verified_raw_table_conversions(self.old, self.new)
        self.assertTrue(any('LaTeX differs' in item for item in failures))

    def test_citation_token_remapping_is_page_scoped_and_documented(self):
        old = {'blocks': [{'_template': 'text', 'body': '<table><tr><td>Source [1,2]</td></tr></table>'}]}
        new = {'blocks': [{
            '_template': 'datatable', 'csv': '"Source [3, 4]"\n',
            'sourceCellRuns': [[table_cell('Source [3, 4]')]],
        }]}
        allowed, failures, changes = AUDIT.verified_raw_table_conversions(old, new, 'model-ode')
        self.assertEqual(failures, [])
        self.assertEqual(len(allowed), 2)
        self.assertEqual(changes[0]['kind'], 'citation-renumbering')
        self.assertEqual(changes[0]['before'], 'Source [1,2]')
        self.assertEqual(changes[0]['after'], 'Source [3, 4]')

    def test_raw_html_image_conversion_exempts_only_the_same_src_and_image_count(self):
        url='https://static.igem.wiki/teams/6303/wiki/example.png'
        old={'blocks':[{'_template':'text','body':f'<figure><img src="{url}" alt="Source"><figcaption>Figure 1.</figcaption></figure>'}]}
        new={'blocks':[{'_template':'image','src':url,'alt':'Source','body':'Figure 1.'}]}
        allowed,failures,matches=AUDIT.verified_raw_image_conversions(old,new)
        self.assertEqual(failures,[])
        self.assertEqual(allowed,[('src',f'"{url}"')])
        self.assertEqual(matches,[{'block':0,'src':url}])
        new['blocks'][0]['src']=url.replace('.png','.jpg')
        allowed,failures,_=AUDIT.verified_raw_image_conversions(old,new)
        self.assertEqual(allowed,[])
        self.assertTrue(any('no matching baseline raw HTML image' in item for item in failures))


if __name__ == '__main__':
    unittest.main()
