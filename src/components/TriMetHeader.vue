<template>
  <div class="tm-header">
    <div class="tm-bar">
      <router-link to="/" class="tm-brand" :title="catalogTitle">
        <span class="tm-word">TRI</span>
        <img :src="swirl" alt="" class="tm-swirl" aria-hidden="true">
        <span class="tm-word">MET</span>
        <span class="visually-hidden">{{ catalogTitle }}</span>
      </router-link>

      <div class="tm-stripes" aria-hidden="true">
        <i /><i /><i />
      </div>

      <nav class="tm-actions">
        <router-link v-if="canSearch" :to="searchLink" class="tm-link" :class="{ active: isSearchPage }">
          <b-icon-search /><span class="tm-link-label">{{ $t('search.title') }}</span>
        </router-link>

        <button v-if="canAuthenticate" type="button" class="tm-link" :title="authTitle" @click="$emit('logInOut')">
          <component :is="authIcon" /><span class="tm-link-label">{{ authLabel }}</span>
        </button>

        <LanguageChooser
          v-if="locales.length > 1"
          class="tm-lang"
          :data="data" :currentLocale="currentLocale" :locales="locales"
          @set-locale="locale => $emit('setLocale', locale)"
        />

        <button
          v-if="!isServerSelector" type="button" class="tm-menu"
          :aria-expanded="menuOpen ? 'true' : 'false'" :title="$t('browse')"
          @click="$emit('toggleSidebar')"
        >
          <b-icon-list /><span class="tm-menu-label">{{ $t('browse') }}</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import BIconList from '~icons/bi/list';
import BIconSearch from '~icons/bi/search';

export default {
  name: 'TriMetHeader',
  components: {
    BIconList,
    BIconSearch,
    LanguageChooser: defineAsyncComponent(() => import('./LanguageChooser.vue'))
  },
  props: {
    catalogTitle: {
      type: String,
      default: ''
    },
    canSearch: {
      type: Boolean,
      default: false
    },
    isSearchPage: {
      type: Boolean,
      default: false
    },
    searchLink: {
      type: [String, Object],
      default: '/search'
    },
    isServerSelector: {
      type: Boolean,
      default: false
    },
    canAuthenticate: {
      type: Boolean,
      default: false
    },
    authIcon: {
      type: [String, Object, Function],
      default: null
    },
    authLabel: {
      type: String,
      default: ''
    },
    authTitle: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default: null
    },
    currentLocale: {
      type: String,
      default: 'en'
    },
    locales: {
      type: Array,
      default: () => []
    },
    menuOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggleSidebar', 'logInOut', 'setLocale'],
  computed: {
    swirl() {
      return `${import.meta.env.BASE_URL}trimet-swirl.png`;
    }
  }
};
</script>

<style lang="scss">
@import 'bootstrap/scss/mixins';
@import "../theme/variables.scss";

.tm-header {
  // The header lives inside a max-width b-container but the bar reads as full
  // bleed, so it breaks out to the viewport edges and re-pads itself. The
  // parent clips overflow (see page.scss) so this cannot induce a horizontal
  // scrollbar, which would otherwise feed back into the 50vw term.
  margin-inline: calc(50% - 50vw);
  background-color: $tm-blue;
}

.tm-bar {
  display: flex;
  align-items: stretch;
  height: $tm-header-height;
  padding-left: $block-margin;
  margin-inline: auto;

  @include media-breakpoint-up(xxxl) {
    max-width: 75vw;
  }
}

.tm-brand {
  display: flex;
  align-items: center;
  gap: 0.08em;
  flex-shrink: 0;
  color: white;
  text-decoration: none;
  // A logotype, so it keeps its own face while body copy follows
  // developer.trimet.org into Trebuchet.
  font-family: $tm-wordmark-font;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1;

  &:hover,
  &:focus {
    color: white;
    text-decoration: none;
  }

  @include media-breakpoint-down(sm) {
    font-size: 1.3rem;
  }
}

.tm-swirl {
  height: 1.15em;
  width: 1.15em;
  // The mark sits fractionally low against the caps without this nudge.
  margin: 0 0.02em -0.06em;
}

// Three skewed bars echoing the diagonal motif on TriMet's own header. Purely
// decorative, so they yield their space on narrow screens.
.tm-stripes {
  display: flex;
  gap: 0.55rem;
  align-items: stretch;
  margin-left: 1.75rem;
  flex-shrink: 0;

  i {
    display: block;
    width: 0.85rem;
    background-color: $tm-orange;
    transform: skewX(-20deg);
  }

  @include media-breakpoint-down(lg) {
    display: none;
  }
}

.tm-actions {
  display: flex;
  align-items: stretch;
  gap: 0.25rem;
  margin-left: auto;
}

// Header links are flat white text rather than Bootstrap buttons — the bar
// supplies the colour, so a button variant on top of it just adds noise.
.tm-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.85rem;
  border: 0;
  background: none;
  color: rgba(255, 255, 255, 0.92);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;

  &:hover,
  &:focus {
    color: white;
    background-color: rgba(255, 255, 255, 0.12);
    text-decoration: none;
  }

  &.active {
    color: white;
    box-shadow: inset 0 -3px 0 $tm-orange;
  }

  @include media-breakpoint-down(md) {
    .tm-link-label {
      display: none;
    }
  }
}

.tm-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.5rem;
  border: 0;
  background-color: $tm-green;
  color: white;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;

  &:hover,
  &:focus {
    background-color: darken($tm-green, 6%);
    color: white;
  }

  @include media-breakpoint-down(sm) {
    padding: 0 1rem;

    .tm-menu-label {
      display: none;
    }
  }
}

// The language dropdown is the one place a Bootstrap component shows through;
// flatten it so it reads as part of the bar.
.tm-lang .btn {
  height: 100%;
  border: 0;
  border-radius: 0;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 600;

  &:hover,
  &:focus,
  &:active {
    background-color: rgba(255, 255, 255, 0.12);
    color: white;
  }
}
</style>
