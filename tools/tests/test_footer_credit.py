import importlib.util
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("audit_wiki", ROOT / "tools/audit_wiki_content.py")
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class FooterCreditTests(unittest.TestCase):
    def test_original_uncredited_artwork_is_rejected(self):
        self.assertTrue(audit.has_uncredited_seal('<img src="/img/nankai-seal.gif" />'))

    def test_shared_footer_credits_the_restored_artwork(self):
        for path in ("src/components/site/SiteFooter.astro",):
            source = (ROOT / path).read_text()
            with self.subTest(path=path):
                self.assertFalse(audit.has_uncredited_seal(source))
                self.assertTrue(audit.has_uncredited_seal(source.replace('Nankai University emblem', 'Emblem')))
                self.assertTrue(audit.has_uncredited_seal(source.replace('Institutional marks are excluded from CC BY 4.0.', '')))
                self.assertTrue(audit.has_uncredited_seal(source.replace('data-institutional-credit=', 'hidden data-institutional-credit=')))

    def test_footer_without_seal_needs_no_credit(self):
        self.assertFalse(audit.has_uncredited_seal('<footer>Team Wiki</footer>'))


if __name__ == "__main__":
    unittest.main()
