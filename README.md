# TriMet Data Browser

A browser for TriMet's published geospatial data, in TriMet's own colours and on TriMet's own maps.

**<https://cholmes.github.io/trimet-data-browser/>**

TriMet publishes eight geospatial datasets at [developer.trimet.org/gis](https://developer.trimet.org/gis/)
as Shapefile and KML. The [TriMet catalog](https://source.coop/cholmes/trimet) republishes them as
GeoParquet and PMTiles with styles that reproduce TriMet's cartography. This is the front door to
that catalog: browse the district boundary, routes, rail lines, stops, route stops, rail stops,
transit centers and park and rides, preview the data, and read every field's description without
downloading anything.

Unofficial, and not affiliated with TriMet.

## What Makes This Different From STAC Browser

This is a fork of [portolan-browser](https://github.com/portolan-sdi/portolan-browser), itself a
fork of [STAC Browser](https://github.com/radiantearth/stac-browser). Four things changed:

- **Basemaps** come from [tiles.trimet.org](https://tiles.trimet.org/) — TriMet 3D, TriMet Dark 3D
  and TriMet Satellite, and nothing else.
- **The map is bounded** to the Portland metro area, so it cannot drift to the middle of the ocean.
- **The header** is TriMet's: the wordmark, the diagonal stripes, and the palette sampled from
  TriMet's own site.
- **One catalog.** There is no data-source picker; the browser only ever shows TriMet data.

## Develop

Requires Node.js and pnpm.

```sh
pnpm install
pnpm start                     # http://localhost:8080, reads the live catalog
```

To work against a local copy of the catalog instead:

```sh
npx serve ../portolan-catalog-trimet/catalog --cors -l 8081
SB_catalogUrl=http://localhost:8081/catalog.json pnpm start
```

Any `SB_*` environment variable overrides the matching key in `config.js`.

## Test

```sh
pnpm run test:unit             # 310 unit tests
pnpm run lint

node_modules/.bin/vite --port 8080 --strictPort &
node verify-trimet.mjs         # 22 end-to-end checks against live data
```

`verify-trimet.mjs` is the one that matters for this fork: it asserts the brand colours, the three
basemaps and that each switches, the bounds clamping, and that collection data renders over the
basemap. `tests/e2e` is inherited from upstream, tests a product shape this fork no longer has, and
is manual-only — see [AGENTS.md](AGENTS.md).

## Deploy

Pushing to `main` builds and publishes to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Configure

The customization surface is six files, listed in [AGENTS.md](AGENTS.md). Upstream's full
configuration reference lives in [`docs/`](docs/) and still applies to everything this fork did
not change.

## License

ISC, inherited from STAC Browser. The TriMet name, wordmark and marks belong to TriMet. The
underlying data is published by TriMet under [its own terms](https://trimet.org/terms.htm).
