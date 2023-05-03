// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/apollo", "@nuxtjs/google-fonts", "@nuxtjs/prismic"],

  css: ["normalize.css/normalize.css", "@/css/variables.css", "@/css/main.css", "@/css/base.css", "@/css/nav.css", "@/css/section-footer.css"],

  apollo: {
    clients: {
      default: {
        httpEndpoint: "https://data.objkt.com/v3/graphql",
      },
    },
  },

  googleFonts: {
    families: {
      Jost: [300, 400, 500, 600],
    },
  },

  prismic: { endpoint: "galeriedata" },

  app: {
    head: {
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", type: "image/png", href: "/favicon.png" },
      ],
    },
  },
});
