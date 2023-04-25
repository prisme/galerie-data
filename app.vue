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

const collection = index.value.body.find((item) => item.slice_type === "collection").primary;
</script>

<template>
  <div>
    <Header :logo="headerLogo" :navigation="headerNavigation" :name="headerName" />
    <NFTCollection :wallet-address="collection.address" :collection-image="collection.cover" :collection-description="collection.description" />
    <div class="footer">
      <div class="footer-block grid__item">
        <div class="footer-block__details-content rte">
          GALERIE DATA<br data-mce-fragment="1" />26, boulevard Jules Ferry Paris 11<br data-mce-fragment="1" />wednesday &amp; thursday 14h-18h<br data-mce-fragment="1" />friday &amp; saturday
          14h-20h <br data-mce-fragment="1" /><meta charset="utf-8" /><a
            href="mailto:contact@galeriedata.com"
            title="mailto:contact@galeriedata.com"
            data-mce-fragment="1"
            data-mce-href="mailto:contact@galeriedata.com"
            target="_blank"
            ><span data-mce-fragment="1">contact@galeriedata.com</span></a
          ><br data-mce-fragment="1" />phone : +33 (6) 18 52 26 86
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.footer {
  background-color: #000;
  color: #fff;
  padding: 2rem 0;
  display: flex;
  font-weight: 300;
  font-size: 0.9em;
}
</style>
