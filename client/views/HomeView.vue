<script setup lang="ts">
import PostGrid from "@/components/Post/PostGrid.vue";

import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>General Feed</h1>
    <section>
      <h1 v-if="!isLoggedIn">Please log in!</h1>
      <!-- <h1 v-else>Please login!</h1> -->
    </section>
    <!-- <PostListComponent /> -->
    <!-- <PostThumbnail /> -->
    <PostGrid />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
