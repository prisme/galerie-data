<template>
  <div class="collection">
    <h2 class="collection__label">Collection</h2>
    <!-- <a :href="`https://objkt.com/collection/${collection.contract}`" class="collection__title">{{ collection?.name }}</a> -->
    <h1 class="collection__title">{{ collection?.name }}</h1>
    <p class="collection__objkt-description">{{ collection.description }}</p>

    <PrismicRichText :field="collectionDescription" class="collection__description" />
    <PrismicImage :field="collectionImage" class="collection__banner" />

    <div v-if="transformedTokens.length">
      <h2 class="tokens__title">NFT Limited Editions</h2>
      <ul class="tokens">
        <li v-for="token in transformedTokens" :key="token.token_id" class="token">
          <a :href="token.url" target="_blank" class="token__preview">
            <img :src="(token?.display_uri || token?.thumbnail_uri).replace('ipfs://', 'https://ecrantotal.twic.pics/')" :alt="token.name" lazy="true" />
          </a>
          <div class="token__info">
            <a :href="token.url" target="_blank">{{ token.name }}</a>
            <div v-if="token.supply">{{ token.supply }} editions</div>
            <div v-if="token.listings_active?.seller.address">
              seller:
              <a :href="`https://objkt.com/profile/${token.listings_active?.seller.address}`">{{ token.listings_active?.seller.alias }}</a>
            </div>
            <div v-if="token.listings_active?.price_xtz">price: {{ token.listings_active?.price_xtz }}</div>
            <div v-if="token.listings_active?.amount && token.listings_active?.amount_left">amount: {{ token.listings_active?.amount }} listed - {{ token.listings_active?.amount_left }} left</div>
          </div>

          <div class="token__cta">
            <a :href="token.url" target="_blank" class="cta"> BUY ON OBJKT </a>
          </div>
        </li>
      </ul>
    </div>

    <div class="load-more"><button v-if="isLoadMoreDisplayed" @click="loadMore" class="load-more__button cta">Load More</button></div>
  </div>
</template>

<script setup lang="ts">
// This code is used to fetch the token data from the objkt API
// The Token interface represents the data structure of the token
// The Collection interface represents the data structure of the collection
// The CollectionResult interface represents the data structure of the result from the API

import { RichTextField } from "@prismicio/types";

interface Token {
  name: string;
  fa_contract: string;
  token_id: string;
  thumbnail_uri: string;
  display_uri: string;
  supply: string;
  timestamp: Date;
  listings_active: {
    amount: number;
    amount_left: number;
    price_xtz: number;
    seller: {
      address: string;
      alias: string;
    };
  }[];
}

interface Collection {
  contract: string;
  name: string;
  description: string;
  creator: {
    alias: string;
    address: string;
    description: string;
  };
  tokens: Token[];
}

interface CollectionResult {
  fa: Collection[];
}

interface CollectionImage {
  dimensions: {
    width: number;
    height: number;
  };
  alt: string | null;
  copyright: string | null;
  url: string;
  small: {
    dimensions: {
      width: number;
      height: number;
    };
    alt: string | null;
    copyright: string | null;
    url: string;
  };
}

// https://public-api-v3-20221206.objkt.com/explore/
const collectionQuery = gql`
  query objkts($walletAddress: String!, $limit: Int = 100, $offset: Int = 0) {
    fa(where: { contract: { _eq: $walletAddress } }) {
      contract
      name
      description
      creator {
        alias
        address
        description
      }
      tokens(limit: $limit, offset: $offset, where: { supply: { _gte: "1" } }, order_by: { last_listed: desc }) {
        name
        fa_contract
        token_id
        thumbnail_uri
        display_uri
        supply
        timestamp
        listings_active {
          amount
          amount_left
          price_xtz
          seller {
            address
            alias
          }
        }
      }
    }
  }
`;

const props = defineProps<{
  walletAddress: string;
  collectionImage: CollectionImage;
  collectionDescription: RichTextField;
}>();

const { walletAddress, collectionImage, collectionDescription } = props;
const limit = ref(20);
const offset = ref(0);

const queryVariables = { walletAddress: walletAddress, limit: limit.value, offset: offset.value };
const { data } = await useAsyncQuery<CollectionResult>(collectionQuery, queryVariables);

const tokens = ref<Token[]>(data.value?.fa[0]?.tokens || []);

const creator = ref<Collection["creator"] | null>(data.value?.fa[0]?.creator || null);

const collection = ref<Pick<Collection, "contract" | "name" | "description">>({
  contract: data.value?.fa[0]?.contract || "",
  name: data.value?.fa[0]?.name || "",
  description: data.value?.fa[0]?.description || "",
});

async function loadMore() {
  offset.value += limit.value;
  const { result, loading, onResult } = useQuery(collectionQuery, {
    walletAddress: walletAddress,
    limit: limit.value,
    offset: offset.value,
  });

  if (result.value !== undefined && !loading.value) {
    tokens.value = [...tokens.value, ...result.value.fa[0].tokens];
    return;
  }

  onResult((res) => {
    tokens.value = [...tokens.value, ...res.data.fa[0].tokens];
  });
}

const isLoadMoreDisplayed = computed(() => {
  if (!tokens.value || tokens.value.length === 0) {
    return false;
  }
  return tokens.value.length > offset.value + limit.value - 1;
});

// data transformer
const transformedTokens = computed(() =>
  tokens.value.map((token) => {
    return {
      ...token,
      listings_active: token?.listings_active
        .map((listing) => {
          return {
            ...listing,
            price_xtz: `${listing.price_xtz / 1000000}ꜩ`,
          };
        })
        .pop(),
      url: `https://objkt.com/asset/${token.fa_contract}/${token.token_id}`,
    };
  })
);
</script>

<style scoped>
.collection {
  margin: auto;
  width: 90vw;
  max-width: 1280px;
  min-width: 350px;
}

.collection__label {
  font-weight: 400;
  font-size: 24px;
  line-height: 35px;
  text-transform: uppercase;
  color: #000000;
  margin: 42px 0 0 0;
}

@media screen and (max-width: 768px) {
  .collection__label {
    font-size: 20px;
    line-height: 29px;
  }
}
@media screen and (max-width: 480px) {
  .collection__label {
    font-size: 16px;
    line-height: 23px;
  }
}

.collection__title {
  margin: 0;
  font-weight: 600;
  font-size: 48px;
  line-height: 69px;
  text-transform: uppercase;
  text-decoration: none;
}

@media screen and (max-width: 768px) {
  .collection__title {
    font-size: 40px;
    line-height: 58px;
  }
}
@media screen and (max-width: 480px) {
  .collection__title {
    font-size: 32px;
    line-height: 46px;
  }
}

.collection__objkt-description {
  font-weight: 500;
  font-size: 16px;
  line-height: 23px;
  margin: 0;
}

@media screen and (max-width: 768px) {
  .collection__objkt-description {
    font-size: 14px;
    line-height: 20px;
  }
}
@media screen and (max-width: 480px) {
  .collection__objkt-description {
    font-size: 12px;
    line-height: 17px;
  }
}
.collection__description {
  font-weight: 300;
  font-size: 16px;
  line-height: 23px;
  margin: 2em 0;
}

@media screen and (max-width: 768px) {
  .collection__description {
    font-size: 14px;
    line-height: 20px;
  }
}
@media screen and (max-width: 480px) {
  .collection__description {
    font-size: 12px;
    line-height: 17px;
  }
}

.collection__banner {
  display: block;
  width: 100%;
}

.tokens {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1%;
}

.tokens__title {
  font-weight: 400;
  font-size: 24px;
  line-height: 35px;
  text-transform: uppercase;
  margin: 5rem 0 4rem;
}

@media screen and (max-width: 768px) {
  .tokens__title {
    font-size: 20px;
    line-height: 29px;
    margin: 4rem 0 3rem;
  }
}
@media screen and (max-width: 480px) {
  .tokens__title {
    font-size: 16px;
    line-height: 23px;
    margin: 3rem 0 2rem;
  }
}

.token {
  flex: 1 1 30%;
  margin-bottom: 2em;
}

@media screen and (max-width: 768px) {
  .token {
    flex: 1 1 49%;
  }
}
@media screen and (max-width: 480px) {
  .token {
    flex: 1 1 100%;
  }
}

.token img {
  display: block;
  width: 100%;
}

.token__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  aspect-ratio: 1/1;
  height: auto;

  border: 1px solid rgba(0, 0, 0, 0.02);
  /* border-radius: 4px; */
  /* box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.04); */
  box-shadow: -1px -1px 10px rgba(0, 0, 0, 0.04);
}

.token__preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.token__info {
  padding: 1em 0;
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 30px;
}

.token__cta {
  margin: 1em 0;
  display: flex;
  /* justify-content: center; */
}

.cta {
  font-size: 0.8em;
  color: white;
  background: black;
  font-style: normal;
  font-weight: 300;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  border-radius: 10px;
  text-decoration: none;
  padding: 0.3em 1.3em;
}
</style>
