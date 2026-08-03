import { describe, it, expect } from 'vitest'
import getRoutes from '../../src/router/index.js'

// Builds the props object the browse route hands to Browse.vue for a given
// vue-router location. `matched` is irrelevant to the props function, so a
// minimal route object is enough.
function browseProps(config, params) {
  const routes = getRoutes(config)
  const browse = routes.find(r => r.name === 'browse')
  return browse.props({ params })
}

describe('router', () => {
  describe('browse route props', () => {
    // vue-router omits an optional repeatable param entirely when it matches
    // nothing, so the root path "/" arrives with params = {} rather than
    // { pathMatch: [] }. This only surfaces on single-catalog deployments: when
    // catalogUrl is null, "/" is claimed by the select route instead.
    it('yields an empty path at the root when pathMatch is absent', () => {
      const config = { catalogUrl: 'https://example.com/catalog.json', allowExternalAccess: false }
      expect(browseProps(config, {})).toEqual({ path: '' })
    })

    it('yields an empty path at the root even when external access is allowed', () => {
      const config = { catalogUrl: 'https://example.com/catalog.json', allowExternalAccess: true }
      expect(browseProps(config, {})).toEqual({ path: '' })
    })

    it('joins a multi-segment pathMatch', () => {
      const config = { catalogUrl: 'https://example.com/catalog.json', allowExternalAccess: false }
      expect(browseProps(config, { pathMatch: ['routes', 'collection.json'] }))
        .toEqual({ path: 'routes/collection.json' })
    })

    it('handles an empty pathMatch array', () => {
      const config = { catalogUrl: 'https://example.com/catalog.json', allowExternalAccess: false }
      expect(browseProps(config, { pathMatch: [] })).toEqual({ path: '' })
    })

    it('prefixes external paths with a slash when external access is allowed', () => {
      const config = { catalogUrl: null, allowExternalAccess: true }
      expect(browseProps(config, { pathMatch: ['external', 'example.com', 'catalog.json'] }))
        .toEqual({ path: '/external/example.com/catalog.json' })
    })

    it('leaves external paths alone when external access is disallowed', () => {
      const config = { catalogUrl: 'https://example.com/catalog.json', allowExternalAccess: false }
      expect(browseProps(config, { pathMatch: ['external', 'example.com', 'catalog.json'] }))
        .toEqual({ path: 'external/example.com/catalog.json' })
    })
  })
})
