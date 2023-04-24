<script setup>
const { data } = await useAsyncData("index", () => queryContent("/").findOne());
</script>

<template>
  <div>
    <pre>{{ data.title }}</pre>
    <Header />
    <NFTCollection />
  </div>
</template>
