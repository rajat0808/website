import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

const directory = fileURLToPath(new URL('.', import.meta.url));
const root = new URL('../', import.meta.url);
await mkdir(new URL('.build/', import.meta.url), { recursive: true });
const common = { absWorkingDir: directory, bundle: true, jsx: 'automatic', logLevel: 'info' };
await build({
  ...common,
  entryPoints: ['client.jsx'],
  outfile: '../assets/saresa-react.js',
  minify: true,
  format: 'iife',
  target: ['es2020'],
  legalComments: 'inline',
  define: { 'process.env.NODE_ENV': '"production"' },
});
await build({
  ...common,
  entryPoints: ['SaresaPage.jsx'],
  outfile: '.build/page.mjs',
  platform: 'node',
  format: 'esm',
  packages: 'external',
});
const { default: SaresaPage } = await import('./.build/page.mjs');
const markup = renderToString(createElement(SaresaPage));
await build({
  ...common,
  entryPoints: ['SaresaCatalog.jsx'],
  outfile: '.build/catalog.mjs',
  platform: 'node',
  format: 'esm',
  packages: 'external',
});
const { default: SaresaCatalog } = await import('./.build/catalog.mjs');
const catalogMarkup = renderToString(createElement(SaresaCatalog));
await build({ ...common, entryPoints: ['BasantiCatalog.jsx'], outfile: '.build/basanti-catalog.mjs', platform: 'node', format: 'esm', packages: 'external' });
const { default: BasantiCatalog } = await import('./.build/basanti-catalog.mjs');
const basantiCatalogMarkup = renderToString(createElement(BasantiCatalog));
const bundle = await readFile(new URL('assets/saresa-react.js', root));
const hash = createHash('sha256').update(bundle).digest('hex').slice(0, 12);
const stylesheet = await readFile(new URL('style.css', root));
const cssHash = createHash('sha256').update(stylesheet).digest('hex').slice(0, 12);
await writeFile(new URL('saresa-page.css', root), stylesheet);
const template = await readFile(new URL('template.html', import.meta.url), 'utf8');
await writeFile(new URL('saresa.html', root), template.replace('{{APP}}', markup).replace('{{HASH}}', hash).replace('{{CSS_HASH}}', cssHash));
const catalogTemplate = await readFile(new URL('catalog-template.html', import.meta.url), 'utf8');
await writeFile(new URL('saresa-catalog.html', root), catalogTemplate.replace('{{APP}}', catalogMarkup).replace('{{CSS_HASH}}', cssHash));
const basantiCatalogTemplate = catalogTemplate.replaceAll('Saresa', 'Basanti').replaceAll('saresa-catalog-root', 'basanti-catalog-root').replaceAll('brand-page--saresa', 'brand-page--basanti');
await writeFile(new URL('basanti-catalog.html', root), basantiCatalogTemplate.replace('{{APP}}', basantiCatalogMarkup).replace('{{CSS_HASH}}', cssHash));
await build({
  ...common,
  entryPoints: ['EventsPage.jsx'],
  outfile: '.build/events.mjs',
  platform: 'node',
  format: 'esm',
  packages: 'external',
});
const { default: EventsPage } = await import('./.build/events.mjs');
const eventsContent = await readFile(new URL('events-content.html', import.meta.url), 'utf8');
const eventsMarkup = renderToString(createElement(EventsPage, { content: eventsContent }));
const eventsTemplate = await readFile(new URL('events-template.html', import.meta.url), 'utf8');
await writeFile(new URL('events.html', root), eventsTemplate.replace('{{APP}}', eventsMarkup).replace('{{CSS_HASH}}', cssHash));
await build({
  ...common,
  entryPoints: ['IndexPage.jsx'],
  outfile: '.build/index.mjs',
  platform: 'node',
  format: 'esm',
  packages: 'external',
});
const { default: IndexPage } = await import('./.build/index.mjs');
const indexContent = await readFile(new URL('index-content.html', import.meta.url), 'utf8');
const indexMarkup = renderToString(createElement(IndexPage, { content: indexContent }));
const indexTemplate = await readFile(new URL('index-template.html', import.meta.url), 'utf8');
await writeFile(new URL('index.html', root), indexTemplate.replace('{{APP}}', indexMarkup).replaceAll('{{CSS_HASH}}', cssHash));
await build({
  ...common,
  entryPoints: ['BrandPage.jsx'],
  outfile: '.build/brand.mjs',
  platform: 'node',
  format: 'esm',
  packages: 'external',
});
const { default: BrandPage } = await import('./.build/brand.mjs');
const brandContent = await readFile(new URL('brand-content.html', import.meta.url), 'utf8');
const brandMarkup = renderToString(createElement(BrandPage, { content: brandContent }));
const brandTemplate = await readFile(new URL('brand-template.html', import.meta.url), 'utf8');
await writeFile(new URL('brand.html', root), brandTemplate.replace('{{APP}}', brandMarkup));
console.log('Built index.html, brand.html, saresa.html, saresa-catalog.html, events.html, saresa-page.css and assets/saresa-react.js');

// Basanti shares the Saresa layout while keeping its own content and hydration entry.
await build({ ...common, entryPoints: ['basanti-client.jsx'], outfile: '../assets/basanti-react.js', minify: true, format: 'iife', target: ['es2020'], define: { 'process.env.NODE_ENV': '"production"' } });
await build({ ...common, entryPoints: ['BasantiPage.jsx'], outfile: '.build/basanti.mjs', platform: 'node', format: 'esm', packages: 'external' });
const { default: BasantiPage } = await import('./.build/basanti.mjs');
const basantiHash = createHash('sha256').update(await readFile(new URL('assets/basanti-react.js', root))).digest('hex').slice(0, 12);
const basantiTemplate = template
  .replaceAll('Saresa', 'Basanti')
  .replace('Premium designer sarees and ethnic wear.', 'Contemporary ethnic wear, occasion wear and accessories.')
  .replaceAll('saresa-root', 'basanti-root')
  .replace('assets/saresa-react.js', 'assets/basanti-react.js');
await writeFile(new URL('basanti.html', root), basantiTemplate.replace('{{APP}}', renderToString(createElement(BasantiPage))).replace('{{HASH}}', basantiHash).replace('{{CSS_HASH}}', cssHash));
console.log('Built basanti.html, basanti-catalog.html and assets/basanti-react.js');
