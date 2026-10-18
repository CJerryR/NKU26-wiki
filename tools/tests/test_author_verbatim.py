import hashlib
import json
from pathlib import Path
import runpy
import tempfile
import unittest

audit = runpy.run_path(str(Path(__file__).resolve().parents[1] / 'audit_wiki_content.py'))

class AuthorVerbatim(unittest.TestCase):
    def test_unregistered_claim_is_still_an_error(self):
        errors = []
        audit['check_text']('page', 'Our device is field-ready.', errors)
        self.assertIn('page: unsupported field readiness', errors)

    def test_exact_author_quote_is_a_review_blocker_but_new_claim_is_an_error(self):
        fragment = '<p>Author calls this field-ready.</p>'
        errors, blockers = [], []
        audit['check_text']('page', fragment + '\nA second device is validated in soil.', errors, [fragment], blockers)
        self.assertEqual(errors, ['page: unsupported field readiness'])
        self.assertEqual(len(blockers), 1)
        self.assertIn('scientific review required', blockers[0])

    def test_changed_excerpt_or_record_is_rejected(self):
        fragment = '<p>Author calls this field-ready.</p>'
        record = {'page': 'results', 'fragment': fragment, 'fragment_sha256': hashlib.sha256(fragment.encode()).hexdigest(),
                  'source_file_sha256': 'a' * 64, 'user_authorized_preservation': True, 'scientific_review_approved': False}
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder); (root / 'content').mkdir()
            path = root / 'content/author-verbatim-review.json'; path.write_text(json.dumps([record]))
            errors = []
            self.assertEqual(audit['author_review_fragments'](root, 'results', fragment, errors), [fragment])
            self.assertEqual(errors, [])
            self.assertEqual(audit['author_review_fragments'](root, 'results', fragment.replace('Author', 'Editor'), errors), [])
            self.assertTrue(errors)
            record['scientific_review_approved'] = True; path.write_text(json.dumps([record])); errors.clear()
            self.assertEqual(audit['author_review_fragments'](root, 'results', fragment, errors), [])
            self.assertTrue(errors)

    def test_source_preservation_does_not_allow_forbidden_placeholders(self):
        fragment = '<p>TODO field-ready.</p>'; errors, blockers = [], []
        audit['check_text']('page', fragment, errors, [fragment], blockers)
        self.assertIn('page: draft marker', errors)

if __name__ == '__main__':
    unittest.main()
