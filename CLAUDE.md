# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shopify theme for **GEDORE Ibérica**, storefront `www.gedore.es`, built on Dawn v15.4.1 with B2B customizations.

Both `a69b0a-8d.myshopify.com` and `gedore-iberica.myshopify.com` resolve to this store (301 → `www.gedore.es`). The Admin API reports `a69b0a-8d.myshopify.com` as the canonical `myshopifyDomain` — prefer it for CLI and API calls.

**App status (7-ago-2026):** BSS Commerce (B2B Suite Lock & Login) y SparkLayer están desinstaladas, y el código de ambas se ha retirado del tema. La única app con app embed es Fontify. Ojo: `sections/main-b2b-login.liquid` (página `/pages/b2b-login`) es boilerplate de origen SparkLayer pero funciona con formularios nativos de Shopify — se mantiene a propósito.

**El tema publicado es la fuente de la verdad.** Se edita desde el admin de Shopify, así que el repo se desincroniza. Haz `shopify theme pull` antes de trabajar y nunca hagas `push` sin haber sincronizado.

## Development Commands

```bash
# Local development (requires Shopify CLI)
shopify theme dev

# Push changes to store
shopify theme push

# Pull current theme from store
shopify theme pull
```

**Git workflow**: branch from `main`, work on feature branches (`codex/[feature-name]`), open PRs targeting `main`.

## Architecture

### Shopify Structure Constraints
Shopify enforces a flat directory structure — **no subdirectories** are allowed inside `snippets/`, `assets/`, `sections/`, `layout/`, `templates/`, or `locales/`. Use filename prefixes instead.

### Custom Code Conventions
All customizations follow strict naming prefixes to distinguish them from Dawn base code:

| Type | Location | Prefix |
|------|----------|--------|
| Liquid snippets | `snippets/` | `custom-` or `gedore-` |
| JavaScript | `assets/` | `custom-` |
| CSS | `assets/` | `custom-` |

### How Custom Features Are Integrated

Custom logic lives in snippets, which are rendered from `sections/main-product.liquid`. Direct logic edits to `main-product.liquid` are avoided — only `{% render %}` calls are added there, wrapped in delimiter comments:

```liquid
{% comment %} CUSTOM START: stock by location {% endcomment %}
{% render 'custom-stock-by-location', product: product %}
{% comment %} CUSTOM END: stock by location {% endcomment %}
```

### Custom Features Currently Implemented

- **`custom-variant-title`** — Displays variant title from `custom.variant_title` metafield instead of default option values. JS: `custom-variant-title.js`
- **`custom-product-vendor-sku`** — Vendor brand and SKU badge. Parses `SKU (MPN)` format, extracting only the SKU part. CSS: `custom-product-meta.css`
- **`custom-product-identifiers`** — MPN (from `mm-google-shopping` metafield), EAN (barcode), and stock per warehouse. JS: `custom-product-identifiers.js`
- **`custom-stock-by-location`** — Vitoria warehouse (via `store_availabilities`) and Germany warehouse (via `stock.alemania` metafield). JS: `custom-stock-by-location.js`
- **`custom-product-dimensions-accordion`** — Dimensions accordion using `longitud_mm`, `anchura_mm`, `altura_mm` metafields. JS: `custom-product-dimensions.js`

### JavaScript Pattern

Custom JS files parse embedded JSON from Liquid (pattern: `[FeatureName]Data-{sectionId}`) and update the DOM on variant selection via the Dawn PubSub `variantChange` event:

```js
document.addEventListener('variant:change', handler); // or PubSub subscribe
```

## Rules (from AGENTS.md)

1. Do not modify the base Dawn theme structure.
2. Avoid direct logic edits to `sections/main-product.liquid` — only add/move `{% render %}` calls.
3. All custom logic goes in snippets with `custom-` or `gedore-` prefix.
4. Do not alter section `schema` blocks unless explicitly instructed.
5. Do not remove existing blocks or settings.
6. Preserve app block compatibility. As of 2026-08-07 the only app embed in the theme is Fontify.
7. Do not rewrite complete Dawn files without necessity.
