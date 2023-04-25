<script setup>
const { client } = usePrismic();

const { data: index } = await useAsyncData("index", () => client.getSingle("index"), { transform: (response) => response.data });

const { data: navigation } = await useAsyncData("navigation", () => client.getSingle("navigation"), { transform: (response) => response.data });
const { logo: headerLogo, navigation_item: headerNavigation, name: headerName } = navigation.value;

const open_graph = index.value.social.find((item) => item.slice_type === "open_graph").primary;

useHead({
  title: index.value.meta_title[0].text,
  meta: [
    {
      property: "description",
      content: index.value.meta_description[0].text,
    },
    {
      property: "og:title",
      content: open_graph.og_title[0].text,
    },
    {
      property: "og:description",
      content: open_graph.og_description[0].text,
    },
    {
      property: "og:image",
      content: open_graph.og_image.url,
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "twitter:card",
      content: "summary_large_image",
    },
  ],
});
</script>

<template>
  <div>
    <Header :logo="headerLogo" :navigation="headerNavigation" :name="headerName" />
    <NFTCollection />
  </div>
</template>
