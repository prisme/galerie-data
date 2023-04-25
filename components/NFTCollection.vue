<template>
  <div class="collection">
    <div>
      <h2>Collection</h2>
      <a :href="`https://objkt.com/collection/${collection.contract}`">{{ collection?.name }}</a>
      <p>{{ collection.description }}</p>
    </div>

    <div v-if="creator?.address">
      <h2>Creator</h2>
      <a :href="`https://objkt.com/profile/${creator?.address}`">{{ creator?.alias }}</a>
      <p>{{ creator?.description }}</p>
    </div>

    <div v-if="transformedTokens.length">
      <h2>Tokens</h2>
      <ul class="tokens">
        <li v-for="token in transformedTokens" :key="token.token_id" class="token">
          <a :href="token.url" target="_blank">
            <img :src="(token?.thumbnail_uri || token?.display_uri).replace('ipfs://', 'https://ecrantotal.twic.pics/')" :alt="token.name" />
          </a>
          <div>
            name: <a :href="token.url" target="_blank">{{ token.name }}</a>
          </div>
          <div>
            seller:
            <a :href="`https://objkt.com/profile/${token.listings_active?.seller.address}`">{{ token.listings_active?.seller.alias }}</a>
          </div>
          <div>price: {{ token.listings_active?.price_xtz }}</div>
          <div>supply: {{ token.supply }}</div>
          <div>amount: {{ token.listings_active?.amount }} listed - {{ token.listings_active?.amount_left }} left</div>
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

const walletAddress = ref("KT18jEB9uJTqVtChNnhhPSkaucieFnVACPKV");
const limit = ref(20);
const offset = ref(0);

const queryVariables = { walletAddress: walletAddress.value, limit: limit.value, offset: offset.value };
const { data } = await useAsyncQuery<CollectionResult>(collectionQuery, queryVariables);

const tokens = ref<Token[]>(data.value?.fa[0]?.tokens || []);

const creator = ref<Collection["creator"] | null>(data.value?.fa[0]?.creator || null);

const collection = ref<Pick<Collection, "contract" | "name" | "description">>({
  contract: data.value?.fa[0]?.contract || "",
  name: data.value?.fa[0]?.name || "",
  description: data.value?.fa[0]?.description || "",
});

function updateData(res: CollectionResult) {
  tokens.value = res.fa[0].tokens;
  creator.value = res.fa[0].creator;
  collection.value = {
    contract: res.fa[0].contract,
    name: res.fa[0].name,
    description: res.fa[0].description,
  };
}

async function loadMore() {
  offset.value += limit.value;
  const { result, loading, onResult } = useQuery(collectionQuery, {
    walletAddress: walletAddress.value,
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

.load-more {
  display: flex;
  justify-content: center;
  padding: 30px;
}
</style>
