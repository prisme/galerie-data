<template>
  <div class="header">
    <img :src="logo" width="500" height="82" alt="" class="logo" />
  </div>
</template>

<script setup>
const logo = "https://cdn.shopify.com/s/files/1/0660/8165/3002/files/GALERIE_DATA_LOGO_WHITE.png?v=1674927996&width=500";
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
  color: #fff;
  padding-top: 20px;
  padding-bottom: 20px;
}

.logo {
  max-width: 250px;
  height: auto;
}
</style>
