<script setup>
const { client } = usePrismic();

const { data: index } = await useAsyncData("index", () => client.getSingle("index"), { transform: (response) => response.data });

const { data: navigation } = await useAsyncData("navigation", () => client.getSingle("navigation"), { transform: (response) => response.data });
const { logo, navigation_item, name } = navigation.value;
</script>

<template>
  <div>
    <Header :logo="logo" :navigation="navigation_item" :name="name" />
    <prismic-rich-text :field="index.title" />
    <NFTCollection />
  </div>
</template>
