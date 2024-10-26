<template>
    <div class="post-page-container">
      <button class="back-button" @click="goBack">← Back to feed</button>
      <div class="video-container" v-if="post.video">
        <iframe
          :src="post.video"
          width="100%"
          height="400"
          title="Video player"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>
      <!-- Display post content as the title -->
      <h1 class="post-title">{{ post.content }}</h1>
      <p class="author">by {{ post.author }}</p>
  
      <div class="interaction-buttons">
        <AddToCollectionButton :postId="post._id" />
        <button class="btn pure-button">✉️ Send through Messages</button>
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
  
      <!-- Edit, Delete, and Promote options -->
      <div class="edit-delete-menu">
        <button class="btn-small pure-button" @click="isEditing = true">Edit</button>
        <button class="button-error btn-small pure-button" @click="deletePost">Delete</button>
        <!-- Promotion Button -->
        <PromotionButton :postId="post._id" />
      </div>
  
      <!-- Edit Modal -->
      <div v-if="isEditing" class="modal-overlay">
        <div class="modal-content">
          <h2>Edit Post</h2>
          <form @submit.prevent="saveChanges">
            <div class="form-group">
              <label for="content">Content:</label>
              <textarea v-model="editForm.content" id="content"></textarea>
            </div>
            <div class="form-group">
              <label for="productURL">Product URL:</label>
              <input v-model="editForm.productURL" id="productURL" type="text" />
            </div>
            <div class="form-group">
              <label for="rating">Rating:</label>
              <!-- Updated input to allow decimal numbers -->
              <input
                v-model.number="editForm.rating"
                id="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
              />
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn pure-button">Save</button>
              <button type="button" class="btn pure-button" @click="isEditing = false">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>
  
<script setup lang="ts">
  import PromotionButton from '@/components/Labeling/PromoteButton.vue';
import AddToCollectionButton from '@/components/Saving/AddToCollectionButton.vue';
import { fetchy } from '@/utils/fetchy';
import { computed, ref, watch } from 'vue';
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
  const emit = defineEmits(['updatePost']);
  
  const router = useRouter();
  const isEditing = ref(false);
  
  // Create a copy of the post data for editing
  const editForm = ref({
    content: props.post.content,
    productURL: props.post.productURL || '',
    rating: props.post.rating || 1,
  });
  
  // Watch for changes in props.post to update editForm
  watch(
    () => props.post,
    (newPost) => {
      editForm.value.content = newPost.content;
      editForm.value.productURL = newPost.productURL || '';
      editForm.value.rating = newPost.rating || 1;
    }
  );
  
  const formattedDate = computed(() => {
    return new Date(props.post.dateCreated).toLocaleDateString();
  });
  
  // Functions
  const goBack = () => {
    router.push('/');
  };
  
  const deletePost = async () => {
    try {
      await fetchy(`/api/posts/${props.post._id}`, 'DELETE');
      console.log('Post deleted!');
      router.push('/');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };
  
  const saveChanges = async () => {
    try {
      const updatedPost = {
        ...props.post,
        content: editForm.value.content,
        productURL: editForm.value.productURL,
        rating: editForm.value.rating,
      };
      await fetchy(`/api/posts/${props.post._id}`, 'PATCH', { body: updatedPost });
      // Emit an event to update the post in the parent component
      emit('updatePost', updatedPost);
      isEditing.value = false;
    } catch (error) {
      console.error('Error saving changes:', error);
    }
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
  
  .edit-delete-menu {
    margin-top: 2em;
    display: flex;
    gap: 1em;
    align-items: center; /* Align items vertically */
  }
  
  .button-error {
    background-color: #e74c3c;
    color: white;
  }
  
  .button-error:hover {
    background-color: #c0392b;
  }
  
  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: var(--base-bg);
    padding: 2em;
    border-radius: 8px;
    width: 500px;
    max-width: 90%;
  }
  
  .modal-content h2 {
    margin-top: 0;
  }
  
  .form-group {
    margin-bottom: 1em;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5em;
  }
  
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.5em;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1em;
  }
  </style>
  