<template>
  <div>
    <h1>nfts</h1>
    <div v-for="nft in transformedNfts" :key="nft.token_id">
      <img :src="nft.thumbnail_uri" :alt="nft.name" />
      <div>{{ nft.name }}</div>
      <div>{{ nft.highest_offer }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const collectionQuery = gql`
  query objkts($walletAddress: String!, $limit: Int = 100) {
    fa(where: { contract: { _eq: $walletAddress } }) {
      contract
      name
      description
      tokens(limit: $limit, where: { supply: { _gte: "1" } }) {
        token_id
        name
        description
        thumbnail_uri
        display_uri
        mime
        ophash
        symbol
        supply
        highest_offer
      }
    }
  }
`;

interface Token {
  display_uri: string;
  description: string;
  token_id: string;
  name: string;
  mime: string;
  thumbnail_uri: string;
  ophash: string;
  symbol: string;
  supply: string;
  highest_offer: number;
  tags: {
    id: string;
    tag_id: string;
    tag: {
      name: string;
      token_count: number;
    };
  }[];
  fa: {
    contract: string;
    creator: {
      description: string;
      address: string;
    };
  };
}

interface CollectionResult {
  fa: {
    collection_id: string;
    collection_type: string;
    description: string;
    contract: string;
    name: string;
    tokens: Token[];
  }[];
}

const { data } = await useAsyncQuery<CollectionResult>(collectionQuery, { walletAddress: "KT1S23ui1PKU5G3V52Ds2NyNnPgxJbZhUY6y", limit: 20 });

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

console.log(transformedNfts.value);
</script>
