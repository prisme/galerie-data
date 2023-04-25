<template>
  <div class="collection">
    <div>
      <h2>Collection</h2>
      <a :href="`https://objkt.com/collection/${collection.contract}`">{{ collection?.name }}</a>
      <p>{{ collection.description }}</p>
    </div>

    <div v-if="creator?.address">
      <a :href="`https://objkt.com/profile/${creator?.address}`">{{ creator?.alias }}</a>
      <p>{{ creator?.description }}</p>
    </div>

    <PrismicImage :field="collectionImage" class="banner" />
    <PrismicRichText :field="collectionDescription" />

    <div v-if="transformedTokens.length">
      <h2>NFT Limited Editions</h2>
      <ul class="tokens">
        <li v-for="token in transformedTokens" :key="token.token_id" class="token">
          <a :href="token.url" target="_blank" class="token__preview">
            <img :src="(token?.thumbnail_uri || token?.display_uri).replace('ipfs://', 'https://ecrantotal.twic.pics/')" :alt="token.name" />
          </a>
          <div class="token__info">
            <a :href="token.url" target="_blank">{{ token.name }}</a>
            <div v-if="token.supply">supply: {{ token.supply }}</div>
            <div v-if="token.listings_active?.seller.address">
              seller:
              <a :href="`https://objkt.com/profile/${token.listings_active?.seller.address}`">{{ token.listings_active?.seller.alias }}</a>
            </div>
            <div v-if="token.listings_active?.price_xtz">price: {{ token.listings_active?.price_xtz }}</div>
            <div v-if="token.listings_active?.amount && token.listings_active?.amount_left">amount: {{ token.listings_active?.amount }} listed - {{ token.listings_active?.amount_left }} left</div>
          </div>
        </li>
      </ul>
    </div>

    <div class="load-more"><button v-if="isLoadMoreDisplayed" @click="loadMore" class="load-more__button">Load More</button></div>
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
      tokens(limit: $limit, offset: $offset, where: { supply: { _gte: "1" } }) {
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
  max-width: 1920px;
}

.tokens {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1%;
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

  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.04);
}

.token__preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 30px;
}

.banner {
  display: block;
  width: 100%;
}
</style>
