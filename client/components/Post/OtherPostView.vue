<template>
    <div class="post-page-container">
      <button class="back-button" @click="goBack">← Back to feed</button>
      <div class="video-container" v-if="post.video">
        <iframe
          :src="post.video"
          width="100%"
          height="400"
          title="YouTube video player"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>
      <!-- Display post content as the title -->
      <h1 class="post-title">{{ post.content }}</h1>
      <p class="author">by {{ post.author }}</p>
  
      <div class="interaction-buttons">
        <AddToCollectionButton :postId="post._id" />
      </div>
  
      <div class="post-details">
        <p v-if="post.productURL" class="product-url">
          <strong>Product URL:</strong>
          <a :href="post.productURL" target="_blank">{{ post.productURL }}</a>
        </p>
        <p v-if="post.rating" class="rating">
          <strong>Rating:</strong> {{ post.rating }}/5
        </p>
        <p class="upload-date">Uploaded {{ formattedDate }}</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import AddToCollectionButton from '@/components/Saving/AddToCollectionButton.vue';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
  
  // Props passed from parent component
  interface Post {
    _id: string;
    author: string;
    content: string;
    video?: string;
    productURL?: string;
    rating?: number;
    dateCreated: string;
  }
  
  const props = defineProps<{ post: Post }>();
  
  const router = useRouter();
  
  // Computed property for formatted date
  const formattedDate = computed(() => {
    return new Date(props.post.dateCreated).toLocaleDateString();
  });
  
  // Functions
  const goBack = () => {
    router.push('/');
  };
  </script>
  
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
  
  .btn-small {
    padding: 0.3em 0.6em;
    font-size: 0.9em;
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
  </style>
  