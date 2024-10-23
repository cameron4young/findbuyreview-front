<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const { currentUsername } = storeToRefs(useUserStore());

const content = ref("");
const video = ref("");
const productURL = ref("");
const rating = ref<number | null>(null);
const backgroundColor = ref("");
const emit = defineEmits(["refreshPosts"]);

const createPost = async () => {
  try {
    await fetchy("/api/posts", "POST", {
      body: {
        content: content.value,
        video: video.value,
        productURL: productURL.value,
        rating: rating.value,
      },
    });
  } catch (_) {
    return;
  }
  emit("refreshPosts");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
  video.value = "";
  productURL.value = "";
  rating.value = null;
};
</script>

<template>
  <form @submit.prevent="createPost">
    <label for="content">Post Title:</label>
    <textarea
      v-model="content"
      placeholder="Enter post title"
      required
    ></textarea>

    <label for="video">YouTube Video URL:</label>
    <input
      type="url"
      id="video"
      v-model="video"
      placeholder="Enter a YouTube video URL"
      required
    />

    <label for="productURL">Product URL:</label>
    <input
      type="url"
      id="productURL"
      v-model="productURL"
      placeholder="Enter a product URL"
      required
    />

    <input
        type="number"
        id="rating"
        v-model="rating"
        min="1"
        max="5"
        step="0.1" 
        placeholder="Rate the product"
        required
     />

    <button type="submit" class="pure-button-primary pure-button">Create Post</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

button{
  background-color: #69988D;
}

textarea,
input {
  font-family: inherit;
  font-size: inherit;
  padding: 0.5em;
  border-radius: 4px;
}

textarea {
  height: 6em;
  resize: none;
}
</style>
