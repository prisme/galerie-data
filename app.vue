<script setup>
const { data } = await useAsyncData("index", () => queryContent("/").findOne());
</script>
<template>
  <div>
    <Header />
    <pre>{{ data.title }}</pre>
    <NFTCollection />
  </div>
</template>
