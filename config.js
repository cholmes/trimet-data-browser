export default {
    // The TriMet catalog on Source Cooperative. Override with SB_catalogUrl to
    // point at a local copy while developing — see AGENTS.md.
    catalogUrl: "https://data.source.coop/cholmes/trimet/catalog.json",
    catalogTitle: "TriMet Data Browser",
    // TriMetHeader draws the wordmark itself, so there is no logo to resolve.
    catalogImage: null,
    // This browser serves one catalog; it is not a general STAC viewer.
    allowExternalAccess: false,
    allowedDomains: ["data.source.coop"],
    detectLocaleFromBrowser: true,
    storeLocale: true,
    locale: "en",
    fallbackLocale: "en",
    // The catalog is English-only, so the language chooser has nothing to offer.
    supportedLocales: [
        "en"
    ],
    apiCatalogPriority: null,
    useTileLayerAsFallback: false,
    displayGeoTiffByDefault: false,
    displayPreview: true,
    displayOverview: true,
    displayOverviewsForChildren: false,
    buildTileUrlTemplate: null,
    getMapSourceOptions: null,
    // Overridden at build time by the Pages deploy; "/" keeps dev at the root.
    pathPrefix: "/",
    historyMode: "hash",
    cardViewMode: "cards",
    cardViewSort: "asc",
    showKeywordsInItemCards: false,
    showKeywordsInCatalogCards: false,
    showThumbnailsAsAssets: false,
    searchResultsPerPage: null,
    itemsPerPage: null,
    collectionsPerPage: null,
    maxEntriesPerPage: 1000,
    defaultThumbnailSize: null,
    crossOriginMedia: null,
    requestHeaders: {},
    requestQueryParameters: {},
    socialSharing: ['email', 'bsky', 'mastodon', 'x'],
    preprocessSTAC: null,
    authConfig: null,
    crs: {},
    // Where the data comes from, then where the data and this site live.
    footerLinks: [
        { label: "TriMet", url: "https://trimet.org/" },
        { label: "TriMet GIS Data", url: "https://developer.trimet.org/gis/" },
        { label: "Catalog on Source Cooperative", url: "https://source.coop/cholmes/trimet" },
        { label: "Source code on GitHub", url: "https://github.com/cholmes/trimet-data-browser" }
    ]
};
