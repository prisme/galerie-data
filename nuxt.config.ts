// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/apollo", "@nuxtjs/google-fonts", "@nuxt/content"],

  css: ["normalize.css/normalize.css", "@/css/main.css"],

  apollo: {
    clients: {
      default: {
        httpEndpoint: "https://data.objkt.com/v3/graphql",
      },
    },
  },

  googleFonts: {
    families: {
      Jost: [300, 600],
    },
  },
});
