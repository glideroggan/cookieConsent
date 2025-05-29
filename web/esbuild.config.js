// esbuild configuration with proper post-build optimization
import { build } from 'esbuild';
import { transform } from 'lightningcss';
import fs from 'fs';

// CSS minification plugin
const cssMinifyPlugin = {
  name: 'css-minify',
  setup(build) {
    build.onLoad({ filter: /\.ts$/ }, async (args) => {
      const content = await fs.promises.readFile(args.path, 'utf8');
      
      // Check if this file contains CSS (looking for /*css*/ template literals)
      if (content.includes('/*css*/')) {
        // Extract and minify CSS while keeping source readable
        const optimizedContent = content.replace(
          /\/\*css\*\/`([^`]+)`/g,
          (match, css) => {
            try {
              const result = transform({
                code: Buffer.from(css),
                minify: true,
                targets: {
                  chrome: 80,
                  firefox: 80,
                  safari: 13,
                  edge: 80,
                }
              });
              return `/*css*/\`${result.code.toString()}\``;
            } catch (e) {
              console.warn('CSS minification failed, using original:', e.message);
              return match;
            }
          }
        );
        
        return {
          contents: optimizedContent,
          loader: 'ts',
        };
      }
    });
  },
};

const baseConfig = {
  bundle: true,
  minify: true,
  treeShaking: true,
  target: 'es2020',
  drop: ['console', 'debugger'], // Remove console statements
  pure: ['console.log', 'console.warn'], // Mark as pure functions
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  keepNames: false, // Allow name mangling
  legalComments: 'none', // Remove all comments
  charset: 'utf8',
  write: true,
  plugins: [cssMinifyPlugin],
};

// ESM build
const esmResult = await build({
  ...baseConfig,
  entryPoints: ['src/index.ts'],
  outfile: 'dist/cookie-consent.esm.js',
  format: 'esm',
});

// UMD build
const umdResult = await build({
  ...baseConfig,
  entryPoints: ['src/index.ts'],
  outfile: 'dist/cookie-consent.js',
  format: 'iife',
  globalName: 'CookieConsent',
});

// Display file sizes
const esmSize = (fs.statSync('dist/cookie-consent.esm.js').size / 1024).toFixed(2);
const umdSize = (fs.statSync('dist/cookie-consent.js').size / 1024).toFixed(2);

console.log(`Build complete!`);
console.log(`ESM: ${esmSize} KB`);
console.log(`UMD: ${umdSize} KB`);
