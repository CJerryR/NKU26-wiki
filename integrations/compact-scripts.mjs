import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

// Only transform the output. Keep authoring sources and vendor licenses intact.
export default function compactScripts() {
  return {
    name: 'nku-compact-scripts',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = path.join(fileURLToPath(dir), 'js');
        let before = 0, after = 0;
        for (const name of await fs.readdir(root)) {
          if (!name.endsWith('.js') || name.endsWith('.min.js')) continue;
          const file = path.join(root, name);
          const input = await fs.readFile(file, 'utf8');
          const output = await transform(input, {
            loader: 'js', minify: true, legalComments: 'inline',
            // Preserve classic-script globals and existing script execution order.
            target: 'es2020',
          });
          before += Buffer.byteLength(input);
          after += Buffer.byteLength(output.code);
          await fs.writeFile(file, output.code);
        }
        logger.info(`Homepage/search scripts: ${before} → ${after} bytes (before compression)`);
      },
    },
  };
}
