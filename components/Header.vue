<script setup>
defineProps({
  logo: {
    type: Object,
    default: () => {},
  },
  navigation: {
    type: Array,
    default: () => [],
  },
  name: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <header class="header header--top-center header--mobile-center header--has-menu">
    <h1 class="header__heading">
      <a :href="baseUrl" class="header__heading-link link link--text focus-inset">
        <PrismicImage :field="logo" class="header__heading-logo" />
      </a>
    </h1>

    <nav v-if="navigation.length" class="header__inline-menu">
      <ul class="list-menu list-menu--inline" role="list">
        <li v-for="item in navigation">
          <PrismicLink :field="item.link" :class="{ 'header__active-menu-item': item.active === true }" class="header__menu-item list-menu__item link link--text focus-inset">
            <PrismicRichText :field="item.name" />
          </PrismicLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.header {
  --color-foreground: #fff;
  /* display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; */
  background-color: #000;
  /* color: #fff; */
  padding-top: 20px;
  padding-bottom: 20px;
}

.logo {
  max-width: 250px;
  height: auto;
}

.nav ul {
  list-style: none;
}
.nav a {
  color: #fff;
}
.nav a.active {
  text-decoration: none;
}

.nav ul {
  display: flex;
  flex-direction: row;
  gap: 1em;
}
</style>
