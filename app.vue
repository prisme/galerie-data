<script setup>
const { data: page } = await useAsyncData("index", () => queryContent("/").findOne());

useContentHead(page);
</script>

<template>
  <div>
    <Header />
    <ContentRenderer :value="page" />
    <NFTCollection />
  </div>
</template>
