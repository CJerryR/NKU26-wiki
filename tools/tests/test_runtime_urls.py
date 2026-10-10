import runpy
import unittest
from pathlib import Path

audit = runpy.run_path(str(Path(__file__).resolve().parents[1] / 'audit_wiki_content.py'))

class RuntimeUrls(unittest.TestCase):
    def test_official_resources(self):
        for url in ('https://static.igem.wiki/teams/6303/image.avif', 'https://video.igem.org/videos/embed/example', '//static.igem.wiki/font.woff2'):
            with self.subTest(url=url):
                self.assertFalse(audit['has_external_runtime'](f'![Image]({url})'))
                self.assertFalse(audit['has_external_runtime'](f'<img src="{url}">'))
    def test_external_and_lookalike_hosts(self):
        for url in ('https://example.org/image.png', 'https://igem.org.evil.example/image.png', 'https://evil-igem.org/image.png', '//example.org/image.png', 'https://user:secret@static.igem.wiki/image.png'):
            with self.subTest(url=url):
                self.assertTrue(audit['has_external_runtime'](f'![Image]({url})'))
                self.assertTrue(audit['has_external_runtime'](f'<iframe src="{url}"></iframe>'))
    def test_citation_links(self):
        self.assertFalse(audit['has_external_runtime']('[Paper](https://doi.org/example)'))
        self.assertFalse(audit['has_external_runtime']('<a href="https://github.com/example">Source</a>'))

if __name__ == '__main__':
    unittest.main()
