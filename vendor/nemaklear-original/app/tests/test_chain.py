import sys
from pathlib import Path
import unittest
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import server

class ChainTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.demo = server.calculate({'mode':'simulation','sample_id':'SIM-V4-T40-B80'})
        cls.signals = cls.demo['corrected_signals']

    def test_frozen_ode_matches_saved_endpoint(self):
        saved = next(s for s in server.bootstrap()['samples'] if s['sample_id']=='SIM-V4-T40-B80')
        np.testing.assert_allclose(self.signals,saved['signals'],rtol=1e-7)
        self.assertAlmostEqual(self.demo['prediction']['density'],40.87226175231629,places=4)
        self.assertEqual(self.demo['risk']['possible_grades'],['中'])
        self.assertEqual(len(self.demo['curves']['3']['hours']),161)

    def test_manual_and_raw_match_without_fake_trajectory(self):
        manual=server.calculate({'mode':'manual','signal_type':'corrected','signals':self.signals})
        raw=server.calculate({'mode':'manual','signal_type':'raw','signals':[x+.024 for x in self.signals],'blanks':[.024,.024]})
        self.assertIsNone(manual['curves'])
        self.assertAlmostEqual(manual['prediction']['density'],raw['prediction']['density'],places=9)

    def test_bad_or_saturated_reading_blocks_eco(self):
        for signals,sat in [([-.1,-.1],False),(self.signals,True)]:
            r=server.calculate({'mode':'manual','signal_type':'corrected','signals':signals,'saturated':sat})
            self.assertEqual(r['risk']['status'],'blocked')
            self.assertEqual(r['scenarios'],[])

    def test_uncertain_interval_includes_both_grades(self):
        r=server.calculate({'mode':'manual','signal_type':'corrected','signals':[0.,0.]})
        self.assertEqual(r['risk']['status'],'uncertain')
        self.assertEqual(r['risk']['possible_grades'],['低','中'])
        self.assertEqual(set(s['grade'] for s in r['scenarios']),{'低','中'})

    def test_screenshot_low_density_keeps_grade_and_uncertainty(self):
        saved = next(s for s in server.bootstrap()['samples'] if s['sample_id']=='SIM-V4-T0-B200')
        result=server.calculate({'mode':'manual','signal_type':'corrected','signals':saved['signals']})
        self.assertEqual(result['risk']['point_grade'],'低')
        self.assertEqual(result['risk']['possible_grades'],['低','中'])
        self.assertEqual(result['risk']['physical_interval'][0],0.)
        self.assertLess(result['prediction']['prediction_interval_95'][0],0.)

    def test_screenshot_above_calibration_is_conditional_not_validated(self):
        saved = next(s for s in server.bootstrap()['samples'] if s['sample_id']=='SIM-V4-T120-B80')
        result=server.calculate({'mode':'manual','signal_type':'corrected','signals':saved['signals']})
        self.assertEqual(result['strict_risk']['status'],'blocked')
        self.assertFalse(result['prediction']['within_calibration_range'])
        self.assertEqual(result['risk']['status'],'conditional')
        self.assertTrue(result['risk']['conditional_demo'])
        self.assertEqual(result['risk']['point_grade'],'高')
        self.assertEqual(result['risk']['possible_grades'],['高'])
        self.assertGreater(len(result['scenarios']),0)

    def test_interval_only_exceedance_also_marked_conditional(self):
        saved = next(s for s in server.bootstrap()['samples'] if s['sample_id']=='SIM-V4-T120-B200')
        result=server.calculate({'mode':'manual','signal_type':'corrected','signals':saved['signals']})
        self.assertTrue(result['prediction']['within_calibration_range'])
        self.assertEqual(result['strict_risk']['status'],'blocked')
        self.assertEqual(result['risk']['status'],'conditional')
        self.assertIn('interval_outside_calibration',result['risk']['calibration_warnings'])

    def test_native_eco_matches_original_numbers_and_translation(self):
        original=server.build_diagnostic_report(server.ECO, server.evaluate(self.demo['prediction']['density'],server.ECO))
        native=server.eco_view(self.demo,0)
        english=server.eco_view(self.demo,0,'en')
        for field in ('program_net_benefit_vs_no_control','detection_net_benefit_vs_uniform','yield_loss_fraction','net_income_with_test_per_ha'):
            self.assertEqual(native['report']['diagnosis'][field],original['diagnosis'][field])
            self.assertEqual(english['report']['diagnosis'][field],original['diagnosis'][field])
        self.assertIn('Net benefit',english['curve_svg'])
        self.assertIn('#6e4fb8',native['curve_svg'])
        self.assertEqual(native['report']['net_benefit_curve'],original['net_benefit_curve'])

    def test_native_eco_uses_selected_scenario_and_keeps_boundary_context(self):
        saved=next(s for s in server.bootstrap()['samples'] if s['sample_id']=='SIM-V4-T120-B80')
        result=server.calculate({'mode':'manual','signal_type':'corrected','signals':saved['signals']})
        view=server.eco_view(result,1)
        self.assertEqual(view['report']['input']['density'],result['scenarios'][1]['density'])
        self.assertTrue(view['context']['conditional_demo'])
        with self.assertRaises(ValueError): server.eco_view(result,-1)

    def test_native_eco_cannot_bypass_blocked_reading(self):
        result=server.calculate({'mode':'manual','signal_type':'corrected','signals':self.signals,'saturated':True})
        with self.assertRaises(ValueError): server.eco_view(result,0)

    def test_net_pigment_uses_time_matched_blank(self):
        for ch, signal in zip(('3','18'), self.signals):
            curve=self.demo['curves'][ch]
            np.testing.assert_allclose(curve['pigment_net'],np.array(curve['pigment'])-np.array(curve['pigment_blank']))
            self.assertAlmostEqual(curve['pigment_net'][-1]*.048,signal,places=12)
            self.assertEqual(curve['pigment_net'][0],0.)
        _, blank=server.simulate(server.ROWS['SIM-V4-T0-B0'])
        for ch in ('3','18'):
            np.testing.assert_allclose(blank[ch]['pigment_net'],0.,atol=1e-12)

    def test_reject_nonfinite_and_bad_input(self):
        for value in [float('nan'),float('inf'),True,None]:
            with self.assertRaises(ValueError):
                server.calculate({'mode':'manual','signal_type':'corrected','signals':[value,0.]})

if __name__=='__main__': unittest.main()
