# TriMet Data Browser — Agent Notes

A TriMet-branded fork of [portolan-browser](https://github.com/portolan-sdi/portolan-browser), which
is itself a fork of [STAC Browser](https://github.com/radiantearth/stac-browser). It serves one
catalog: the TriMet geospatial data mirror at `data.source.coop/cholmes/trimet`.

This repo is personal, not part of the Portolan org. The portolan-ops norms — the PR body contract,
VOICE.md, the issue templates — do not apply here. What follows does.

## Where the Customization Lives

Everything that makes this a TriMet browser rather than a generic one sits in six places. Change
these; leave the rest of the tree matching upstream so `git pull upstream main` stays cheap.

| File | Owns |
| --- | --- |
| `basemaps.config.js` | The three TriMet basemaps and `MAP_CONSTRAINTS` (bounds, zoom limits, home view) |
| `StacMapLayer._addLayerBelowLabels` | Where data sits in the basemap stack (see Layer Order) |
| `src/components/TriMetHeader.vue` | The blue bar, wordmark, stripes, MENU button |
| `src/theme/variables.scss` | The palette and fonts, as Sass variables |
| `src/theme/custom.scss` | Component-level styling, referencing those variables |
| `config.js` | Catalog URL, title, locales, footer links |
| `index.html` | Favicon, font link, meta tags |

Brand values have exactly one home: `$tm-blue`, `$tm-orange`, `$tm-green` in `variables.scss`. Do not
paste hex literals into components — that is the mistake this fork inherited from its parent and
cleaned up.

## Brand Facts

Sampled from TriMet's own header, not guessed:

- Blue `#214B88` — header bar
- Orange `#C04F2E` — diagonal stripes
- Green `#4E8227` — MENU button
- Source Sans Pro (300/400/600/700), the same family trimet.org loads

The wordmark is rebuilt in markup — `TRI` + the swirl mark + `MET` — because TriMet publishes no
usable SVG. The swirl in `public/trimet-swirl.png` came from the catalog's `_assets/`.

## Local Development

The catalog lives at `https://data.source.coop/cholmes/trimet/catalog.json`. To work against a local
copy instead:

```sh
npx serve ~/repos/portolan-catalog-trimet/catalog --cors -l 8081
SB_catalogUrl=http://localhost:8081/catalog.json pnpm start
```

Any `SB_*` environment variable overrides the matching key in `config.js`.

## Layer Order

The map stack is deliberate: **basemap ground, then 3D buildings, then the data, then all labels.**

Upstream simply appends data layers on top, which put route lines through the middle of PORTLAND and
every street name. Every data layer now goes in through `StacMapLayer._addLayerBelowLabels`, which
anchors it before the basemap's first symbol layer. A collection style's *own* symbol layers are the
exception and stay on top — those are the data's labels.

The buildings need their own step. In TriMet's styles `building-3d` sits *between* the road labels
and the place labels, so inserting data below the first symbol layer alone would bury the routes
behind building footprints at street zoom. `_sinkBasemapExtrusions` moves any basemap
`fill-extrusion` layer beneath our lowest data layer. It is idempotent, so it can run on every
insert.

All of this has to be re-established on every basemap switch, since `readdAfterStyleChange` tears the
data layers down and rebuilds them against a fresh basemap. `tests/unit/layerOrder.spec.js` covers
the ordering rules; `verify-trimet.mjs` asserts the stack holds after each switch.

## Verification

`verify-trimet.mjs` is this fork's real test. It drives a browser against the live
catalog and tiles.trimet.org and asserts the things this fork actually promises: the exact
brand colours, the wordmark, the three basemaps and that each one switches, the metro
bounds clamping both pan and zoom, and that a collection's data renders over the basemap.

```sh
node_modules/.bin/vite --port 8080 --strictPort &
node verify-trimet.mjs          # 28 checks, screenshots in ./verify-out
```

`tests/unit` (320 tests) still applies and runs in CI.

`tests/e2e` does not. That suite is inherited and asserts the upstream product — a
data-source picker at `/`, `/external/` routing, an API-backed search page — none of which
this fork has. Its workflow is manual-only for that reason. The files are left untouched so
merges from upstream stay clean; do not "fix" them to pass against this configuration.

Note that MapLibre only renders when the page is actually visible. Automation that drives a
backgrounded tab will show an inert map with no style loaded and no tile requests, which
looks exactly like a broken basemap. Verify maps through this script, not a hidden tab.

## Upstream

`upstream` points at portolan-sdi/portolan-browser. Pull improvements with `git pull upstream main`.
Conflicts will concentrate in the six files above, which is why they are kept small and separate.

`gh` commands default to `origin` (this repo). That is deliberate — do not add a fork relationship.

## Working Rules

Verify before claiming. This is a visual project: a change to the header or a basemap is not done
until it has been loaded in a browser and looked at. Screenshots beat assertions.

Never fabricate a tile URL, a style name, or a hex value. Every one in this repo was fetched or
sampled. If you need a new one, go get it.

The catalog is the source of truth for what data exists. Read it; do not infer collection names.
