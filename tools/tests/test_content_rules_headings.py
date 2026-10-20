import importlib.util
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("content_rules_audit", ROOT / "tools/audit-content-rules.py")
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)

rules_spec = importlib.util.spec_from_file_location("content_rules", ROOT / "tools/apply-rules-wet.py")
rules = importlib.util.module_from_spec(rules_spec)
rules_spec.loader.exec_module(rules)


class ContentRulesHeadingTests(unittest.TestCase):
    def test_approved_model_module_names_keep_exact_project_casing(self):
        examples = (
            ("#model-section-1", "Molecular Docking | identifying receptor variants for differential recognition"),
            ("#model-section-2", "Molecular Dynamics | exploring receptor–ligand behavior in a membrane"),
            ("#model-section-3", "ODE & dual-channel sensing | linking color readouts to nematode density"),
            ("#model-section-4", "Economic Benefit | assessing when detection informs treatment"),
        )
        for anchor, label in examples:
            with self.subTest(label=label):
                self.assertFalse(audit.heading_sentence_case_violation("model", label, anchor, 2, rules.sentence_case))

    def test_model_subtitles_still_require_sentence_case(self):
        label = "Molecular Docking | Identifying Receptor Variants"
        self.assertTrue(audit.heading_sentence_case_violation("model", label, "#model-section-1", 2, rules.sentence_case))

    def test_wrong_module_casing_is_not_exempt(self):
        label = "Molecular docking | identifying receptor variants"
        self.assertTrue(audit.heading_sentence_case_violation("model", label, "#model-section-1", 2, rules.sentence_case))

    def test_other_title_case_headings_are_still_rejected(self):
        label = "Genetic Engineering | identifying receptor variants"
        self.assertTrue(audit.heading_sentence_case_violation("engineering", label, "#section-1", 2, rules.sentence_case))

    def test_wrong_model_anchor_or_level_does_not_trigger_exception(self):
        label = "Molecular Docking | identifying receptor variants"
        self.assertTrue(audit.heading_sentence_case_violation("model", label, "#other-section", 2, rules.sentence_case))
        self.assertTrue(audit.heading_sentence_case_violation("model", label, "#model-section-1", 3, rules.sentence_case))


if __name__ == "__main__":
    unittest.main()
