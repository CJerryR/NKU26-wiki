// Stage pages use official Uploads URLs. Do not publish unused local media.
import fs from 'node:fs/promises';
import path from 'node:path';
async function prune(dir) {
  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) await prune(file);
    else if (/\.(?:png|jpe?g|gif|webp|avif|svg|woff2?|ttf|otf|pdf|mp4|webm|mp3|wav|pdb|csv)$/i.test(item.name)) await fs.unlink(file);
  }
}
// The public component catalogue is empty; its standalone demo viewers are unused.
await fs.rm('public/widgets', { recursive: true, force: true });
await prune('public');
console.log('Stage output: local media removed; required images and fonts use official Uploads.');
