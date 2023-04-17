<template>
  <div class="collection">
    <fieldset style="margin-top: 2em">
      <label for="wallet">collection wallet</label> <br />
      <input type="text" v-model.trim="refWallet" id="wallet" />
    </fieldset>
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
            <img :src="token.thumbnail_uri" :alt="token.name" />
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
  </div>
</template>

<script setup lang="ts">
// This code is used to fetch the token data from the objkt API
// The Token interface represents the data structure of the token
// The Collection interface represents the data structure of the collection
// The CollectionResult interface represents the data structure of the result from the API

interface Token {
  name: string;
  thumbnail_uri: string;
  display_uri: string;
  token_id: string;
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
  query objkts($walletAddress: String!, $limit: Int = 100) {
    fa(where: { contract: { _eq: $walletAddress } }) {
      contract
      name
      description
      creator {
        alias
        address
        description
      }
      tokens(limit: $limit) {
        name
        thumbnail_uri
        display_uri
        token_id
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

const walletAddress = "KT1VeyVNYbtYJSd6NVa8mUFmKode5UXn8yuE";
const limit = 20;

const refWallet = ref(walletAddress);

const { data } = await useAsyncQuery<CollectionResult>(collectionQuery, { walletAddress, limit });

// watch the input field for changes & update the data
watch(refWallet, (value) => {
  const { onResult } = useQuery(collectionQuery, { walletAddress: value, limit });

  onResult((result) => {
    data.value = result.data;
  });
});

// transform the data to make it easier to use in the template
const creator = computed(() => data.value?.fa[0]?.creator);

const collection = computed(() => {
  const { contract, name, description } = data.value?.fa[0] || {};
  return {
    name,
    description,
    contract,
  };
});

const tokens = computed(() => data.value?.fa.flatMap((collection: Collection) => collection.tokens) || []);

const transformedTokens = computed(() =>
  tokens.value.map((token) => {
    return {
      ...token,
      display_uri: token.display_uri.replace("ipfs://", "https://ecrantotal.twic.pics/"),
      thumbnail_uri: token.thumbnail_uri.replace("ipfs://", "https://ecrantotal.twic.pics/"),
      listings_active: token.listings_active
        .map((listing) => {
          return {
            ...listing,
            price_xtz: `${listing.price_xtz / 1000000}ꜩ`,
          };
        })
        .pop(),
      url: `https://objkt.com/asset/${walletAddress}/${token.token_id}`,
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
</style>
