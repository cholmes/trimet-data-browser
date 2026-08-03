// Map configuration for the TriMet Data Browser.
//
// Basemaps come from TriMet's own tile server at https://tiles.trimet.org/, so the
// browser's cartography matches the agency's other maps. The full style list is at
// https://tiles.trimet.org/styles.json — only the three below are offered here.
//
// Upstream keys basemaps by celestial body and picks a list from a catalog's
// `ssys:targets`. A transit catalog is only ever going to be Earth, so that
// indirection is gone and configureBasemap() ignores its argument.

const TILES = 'https://tiles.trimet.org/styles';

const BASEMAPS = [
  {
    url: `${TILES}/trimet-3d/style.json`,
    title: 'TriMet 3D',
  },
  {
    url: `${TILES}/trimet-dark-3d/style.json`,
    title: 'TriMet Dark 3D',
  },
  {
    url: `${TILES}/trimet-satellite/style.json`,
    title: 'TriMet Satellite',
  },
];

// The TriMet district spans roughly [-123.15, 45.26] to [-122.28, 45.66]. These
// constraints frame it on load and stop the map drifting out of the region: the
// bounds sit about a degree beyond the widest useful view, and minZoom keeps the
// district filling the viewport rather than shrinking into a world map.
//
// maxBounds must stay comfortably wider than what minZoom renders, or MapLibre
// ends up fighting its own constraints.
export const MAP_CONSTRAINTS = {
  center: [-122.7154, 45.4565],
  zoom: 9,
  minZoom: 7.5,
  maxZoom: 18,
  maxBounds: [[-124.2, 44.4], [-120.3, 46.4]],
};

export default function configureBasemap() {
  return BASEMAPS;
}
