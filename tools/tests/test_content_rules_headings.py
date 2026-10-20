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
    def test_approved_model_module_names_use_fixed_sentence_case(self):
        examples = (
            ("#model-section-1", "Molecular docking: identifying receptor variants for differential recognition"),
            ("#model-section-2", "Molecular dynamics: exploring receptor–ligand behavior in a membrane"),
            ("#model-section-3", "ODE and dual-channel model: linking color readouts to nematode density"),
            ("#model-section-4", "Economic benefit: assessing when detection informs treatment"),
        )
        for anchor, label in examples:
            with self.subTest(label=label):
                self.assertFalse(audit.heading_sentence_case_violation("model", label, anchor, 2, rules.sentence_case))

    def test_model_subtitles_still_require_sentence_case(self):
        label = "Molecular docking: Identifying Receptor Variants"
        self.assertTrue(audit.heading_sentence_case_violation("model", label, "#model-section-1", 2, rules.sentence_case))

    def test_wrong_module_casing_is_not_exempt(self):
        label = "Molecular Docking: identifying receptor variants"
        self.assertTrue(audit.heading_sentence_case_violation("model", label, "#model-section-1", 2, rules.sentence_case))


    def test_new_fixed_model_names_are_required(self):
        for label in (
            "Molecular Docking: identifying receptor variants",
            "ODE & Dual-Channel Modeling: linking color readouts to density",
        ):
            self.assertTrue(audit.heading_sentence_case_violation("model", label, "#model-section-1", 2, rules.sentence_case))

    def test_other_title_case_headings_are_still_rejected(self):
        label = "Genetic Engineering: identifying receptor variants"
        self.assertTrue(audit.heading_sentence_case_violation("engineering", label, "#section-1", 2, rules.sentence_case))

    def test_wrong_model_anchor_or_level_does_not_trigger_exception(self):
        label = "Molecular Docking: identifying receptor variants"
        self.assertTrue(audit.heading_sentence_case_violation("model", label, "#other-section", 2, rules.sentence_case))
        self.assertTrue(audit.heading_sentence_case_violation("model", label, "#model-section-1", 3, rules.sentence_case))

    def test_required_engineering_goal_prefixes_keep_source_casing(self):
        examples = (
            ("#engineering-goal-1-building-the-biosensor", "Goal 1: Building the biosensor"),
            ("#engineering-goal-2-making-the-readout-informative", "Goal 2: Making the readout informative"),
            ("#engineering-goal-3-engineering-a-usable-test-format", "Goal 3: Engineering a usable test format"),
            ("#engineering-goal-4-refining-the-project-for-agricultural-use", "Goal 4: Refining the project for agricultural use"),
        )
        for anchor, label in examples:
            with self.subTest(label=label):
                self.assertFalse(audit.heading_sentence_case_violation("engineering", label, anchor, 2, rules.sentence_case))

    def test_engineering_goal_suffix_still_requires_sentence_case(self):
        label = "Goal 1: Building the Biosensor"
        self.assertTrue(audit.heading_sentence_case_violation(
            "engineering", label, "#engineering-goal-1-building-the-biosensor", 2, rules.sentence_case
        ))

    def test_engineering_goal_exception_does_not_apply_to_other_headings(self):
        self.assertTrue(audit.heading_sentence_case_violation(
            "engineering", "Goal 1: Building the biosensor", "#other-goal", 2, rules.sentence_case
        ))
        self.assertTrue(audit.heading_sentence_case_violation(
            "description", "Goal 1: Building the biosensor", "#engineering-goal-1-building-the-biosensor", 2, rules.sentence_case
        ))
        self.assertTrue(audit.heading_sentence_case_violation(
            "engineering", "Goal 1: Building the biosensor", "#engineering-goal-1-building-the-biosensor", 3, rules.sentence_case
        ))


if __name__ == "__main__":
    unittest.main()
