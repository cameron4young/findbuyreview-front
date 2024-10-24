<script setup lang="ts">
import PostGrid from "@/components/Post/PostGrid.vue";
import { fetchy } from "@/utils/fetchy";
import { onMounted, ref } from "vue";

interface Post {
  _id: string;
  content: string;
  author: string;
  rating?: number;
  video?: string;
  productURL?: string;
  dateCreated: string;
  dateUpdated: string;
}

const collections = ref<{ _id: string; name: string }[]>([]);
const selectedCollection = ref<string | null>(null);
const posts = ref<Post[]>([]);

const fetchCollections = async () => {
  try {
    const response = await fetchy(`/api/collection/user`, "GET");
    if (response.collections) {
      collections.value = response.collections;
    }
  } catch (error) {
    console.error("Error fetching collections:", error);
  }
};

const fetchPostsByCollection = async (collectionId: string) => {
  try {
    const endpoint = `/api/posts/collection/${collectionId}`;
    const postResults = await fetchy(endpoint, "GET");
    posts.value = postResults as Post[];
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

const selectCollection = (collectionId: string | null) => {
  selectedCollection.value = collectionId;
  if (collectionId) {
    fetchPostsByCollection(collectionId);
  } else {
    posts.value = [];
  }
};

const removePostFromCollection = (postId: string) => {
  posts.value = posts.value.filter((post) => post._id !== postId);
};

onMounted(async () => {
  await fetchCollections();
});
</script>

<template>
  <main>
    <h1>Saved Posts</h1>
    <section class="collection-selector">
      <button
        v-for="collection in collections"
        :key="collection._id"
        @click="selectCollection(collection._id)"
        :class="{ active: selectedCollection === collection._id }"
      >
        {{ collection.name }}
      </button>
    </section>
    <PostGrid 
      v-if="selectedCollection && posts.length > 0" 
      :posts="posts" 
      buttonLabel="Remove from Collection" 
      :buttonAction="removePostFromCollection" 
    />
    <p v-else-if="selectedCollection && posts.length === 0">No posts found in this collection.</p>
    <p v-else>Please select a collection to view posts.</p>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 1em;
}

.collection-selector {
  display: flex;
  gap: 0.5em;
  overflow-x: auto;
  padding: 1em 0;
  margin-bottom: 1em;
  justify-content: center;
}

.collection-selector button {
  background-color: #c0c0c0;
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1em;
  white-space: nowrap;
}

.collection-selector button.active {
  background-color: #69988d;
  color: white;
}

.collection-selector button:hover {
  background-color: #517a6b;
  color: white;
}
</style>
