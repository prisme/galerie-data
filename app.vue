<script setup>
const { data: page } = await useAsyncData("index", () => queryContent("/").findOne());

useContentHead(page);
</script>

<template>
  <div>
    <!-- <pre>{{ page }}</pre> -->
    <ContentRenderer :value="page" />
    <Header />
    <NFTCollection />
  </div>
</template>
