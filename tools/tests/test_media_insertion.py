import runpy
import unittest
from pathlib import Path

check_text = runpy.run_path(str(Path(__file__).resolve().parents[1] / 'audit_wiki_content.py'))['check_text']


class MediaInsertionInstructions(unittest.TestCase):
    def test_editorial_instructions_fail_audit(self):
        for source in (
            'Figure 1. Substrates（ insert image “Fig3.1.1”）',
            '<strong> Insert video </strong><strong>“Video3.2.1”</strong>',
            'Insert <b>an image</b> here',
            'insert figure here',
        ):
            with self.subTest(source=source):
                failures = []
                check_text('caption', source, failures)
                self.assertIn('caption: media insertion instruction', failures)

    def test_scientific_copy_and_clean_captions_pass(self):
        for source in (
            'This part is designed to insert sTF into yeast.',
            '<figcaption>Video 1. Observation of test strip resuscitation over 113 h.</figcaption>',
            'Figure 4. Photograph of the vacuum filtration spotting device.',
        ):
            failures = []
            check_text('caption', source, failures)
            self.assertEqual(failures, [])
