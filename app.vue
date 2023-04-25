<script setup>
const { client } = usePrismic();
const { data: index } = await client.getSingle("index");
</script>
<template>
  <div>
    <Header />
    <prismic-rich-text :field="index.title" />
    <NFTCollection />
  </div>
</template>
