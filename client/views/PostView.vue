<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

// State to store the post
const post = ref(null);

// Get the current route and router instance
const route = useRoute();
const router = useRouter();

// Function to fetch post by ID
const fetchPostById = async (id: string) => {
  try {
    const response = await fetchy(`/api/posts/${id}`, "GET");
    if (response) {
      post.value = response[0]; // Assuming the response is an array with one post
    } else {
      console.error("Post not found");
      router.push("/404"); // Redirect to a 404 page or handle the error appropriately
    }
  } catch (error) {
    console.error("Error fetching post:", error);
    router.push("/404");
  }
};

// Fetch the post when the component is mounted
onMounted(() => {
  const postId = route.params.id as string;
  if (postId) {
    fetchPostById(postId);
  }
});

// Functions for interactions
const deletePost = () => {
  console.log("Post deleted!");
};

const goBack = () => {
  router.push("/"); // Redirect back to the feed or a suitable route
};
</script>

<template>
  <div v-if="post" class="post-page-container">
    <button class="back-button" @click="goBack">← Back to feed</button>
    <div class="video-container" v-if="post.video">
      <iframe
        :src="post.video"
        width="100%"
        height="400"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </div>
    <h1 class="post-title">{{ post.title }}</h1>
    <p class="author">by {{ post.author }}</p>
    <p class="reviewer-details">About the Reviewer: Speaker Enthusiast, A/V Expert</p>
    <div class="interaction-buttons">
      <button class="btn pure-button">❤️ Like</button>
      <button class="btn pure-button">💾 Save to Collection</button>
      <button class="btn pure-button">✉️ Send through Messages</button>
    </div>
    <div class="post-details">
      <p class="description">
        <strong>Description:</strong> {{ post.content }}
      </p>
      <p v-if="post.productURL" class="product-url">
        <strong>Product URL:</strong> <a :href="post.productURL" target="_blank">{{ post.productURL }}</a>
      </p>
      <p v-if="post.rating" class="rating">
        <strong>Rating:</strong> {{ post.rating }}/5
      </p>
      <p class="upload-date">Uploaded {{ new Date(post.dateCreated).toLocaleDateString() }}</p>
    </div>
    <div class="edit-delete-menu" v-if="post.author === 'user12345'"> <!-- Add appropriate logic for the current user -->
      <button class="btn-small pure-button" @click="console.log('Edit Post')">Edit</button>
      <button class="button-error btn-small pure-button" @click="deletePost">Delete</button>
    </div>
  </div>
  <p v-else>Loading post...</p>
</template>

<style scoped>
.post-page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2em;
  background-color: var(--base-bg);
  border-radius: 8px;
}

.back-button {
  background: none;
  border: none;
  font-size: 1em;
  margin-bottom: 1em;
  cursor: pointer;
}

.video-container {
  margin-bottom: 1em;
}

.post-title {
  font-size: 1.8em;
  margin: 0.5em 0;
}

.author {
  font-size: 1.2em;
  color: #666;
  margin-bottom: 0.5em;
}

.reviewer-details {
  font-style: italic;
  color: #888;
  margin-bottom: 1em;
}

.interaction-buttons {
  display: flex;
  gap: 1em;
  margin: 1em 0;
}

.btn {
  padding: 0.5em 1em;
  border-radius: 4px;
  background-color: #69988D;
  color: white;
  border: none;
  cursor: pointer;
}

.btn:hover {
  background-color: #517A6B;
}

.post-details {
  margin-top: 1.5em;
  line-height: 1.6;
}

.product-url a {
  color: #3498db;
  text-decoration: underline;
}

.rating {
  font-weight: bold;
  color: #555;
}

.upload-date {
  font-size: 0.9em;
  color: #888;
}

.edit-delete-menu {
  margin-top: 2em;
  display: flex;
  justify-content: space-between;
}

.button-error {
  background-color: #e74c3c;
  color: white;
}

.button-error:hover {
  background-color: #c0392b;
}
</style>
