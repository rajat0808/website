# Saresa React page

Edit `SaresaPage.jsx` for page content and interactions. `template.html` holds the document metadata and analytics. The existing site stylesheet and images are reused without modification.

From this directory, run:

```sh
npm ci
npm run build
```

The build generates `../saresa.html` and `../assets/saresa-react.js`. Include both generated files when deploying. The existing Python site packager includes them automatically; no Node server or CDN is needed in production. Rebuild after changing React source or the template, before packaging the site.

The HTML is rendered from React at build time and hydrated in the browser, preserving immediately visible content and the existing `/saresa` and `/saresa.html` routes. Only this page loads React. Menu, brand dropdown, and WhatsApp widget state are owned by React, with listeners and timers cleaned up by effects.

Basanti: edit BasantiPage.jsx and BasantiCatalog.jsx. The build reuses the Saresa layout template and shared header, slider and footer, generating basanti.html, basanti-catalog.html and assets/basanti-react.js. The six-image hero includes a View More+ link on each slide; the About section also has an Explore all Products button linking to the catalog. If npm cannot write its cache, run node saresa-react/build.mjs from the site root.

