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
  <header class="header">
    <PrismicImage :field="logo" class="logo" />

    <nav v-if="navigation.length" class="nav">
      <ul>
        <li v-for="item in navigation">
          <PrismicLink :field="item.link" :class="{ active: item.active === true }">
            <PrismicRichText :field="item.name" />
          </PrismicLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #000;
  color: #fff;
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
