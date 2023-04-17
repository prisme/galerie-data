<template>
  <div>
    <div>
      <h2>collection</h2>
      <a :href="`https://objkt.com/collection/${collection.contract}`">{{ collection?.name }}</a>
      <p>{{ collection.description }}</p>
    </div>

    <div>
      <h2>artist</h2>
      <a :href="`https://objkt.com/profile/${creator?.address}`">{{ creator?.alias }}</a>
      <p>{{ creator?.description }}</p>
    </div>

    <h2>tokens</h2>
    <div v-for="nft in transformedNfts" :key="nft.token_id">
      <img :src="nft.thumbnail_uri" :alt="nft.name" />
      <div>{{ nft.name }}</div>
      <div>{{ nft.listings_active.price_xtz }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
    seller_address: string;
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
          seller_address
        }
      }
    }
  }
`;

const walletAddress = "KT1VeyVNYbtYJSd6NVa8mUFmKode5UXn8yuE";
const limit = 20;

const { data } = await useAsyncQuery<CollectionResult>(collectionQuery, { walletAddress, limit });

const nfts = computed(() => data.value?.fa.flatMap((collection) => collection.tokens) || []);

const transformedNfts = computed(() =>
  nfts.value.map((nft) => {
    return {
      ...nft,
      display_uri: nft.display_uri.replace("ipfs://", "https://ipfs.io/ipfs/"),
      thumbnail_uri: nft.thumbnail_uri.replace("ipfs://", "https://ipfs.io/ipfs/"),
    };
  })
);

const creator = computed(() => data.value?.fa[0]?.creator);

const collection = computed(() => {
  const { contract, name, description } = data.value?.fa[0] || {};
  return {
    name,
    description,
    contract,
  };
});

console.log(transformedNfts.value);
</script>
