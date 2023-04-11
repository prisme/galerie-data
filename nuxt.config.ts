// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/apollo"],

  apollo: {
    clients: {
      default: {
        httpEndpoint: "https://data.objkt.com/v3/graphql",
      },
    },
  },
});
