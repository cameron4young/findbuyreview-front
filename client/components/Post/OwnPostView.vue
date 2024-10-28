<template>
  <div class="post-page-container">
    <button class="back-button" @click="goBack">← Back to feed</button>
    <div class="video-container" v-if="post.video">
      <iframe
        :src="post.video"
        width="100%"
        height="300"
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
      <button class="button-error btn-small pure-button" @click="showDeleteConfirmation = true">Delete</button>
      <PromoteButton :postId="post._id" />
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

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmation" class="modal-overlay">
      <div class="modal-content">
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete this post? This action is permanent.</p>
        <div class="modal-actions">
          <button class="btn pure-button" @click="confirmDelete">Confirm</button>
          <button class="btn pure-button" @click="closeDeleteModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AddToCollectionButton from '@/components/Saving/AddToCollectionButton.vue';
import { fetchy } from '@/utils/fetchy';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import PromoteButton from '../Labeling/PromoteButton.vue';

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
const showDeleteConfirmation = ref(false);

const editForm = ref({
  content: props.post.content,
  productURL: props.post.productURL || '',
  rating: props.post.rating || 1,
});

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

const confirmDelete = () => {
  deletePost();
  closeDeleteModal();
};

const closeDeleteModal = () => {
  showDeleteConfirmation.value = false;
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

.interaction-buttons {
  display: flex;
  gap: 1em;
  margin: 1em 0;
}

.btn {
  padding: 0.5em 1em;
  border-radius: 4px;
  background-color: #9d9d9d;
  color: white;
  border: none;
  cursor: pointer;
}

.btn:hover {
  background-color: #677a3a;
}

.button-error {
  background-color: #e74c3c;
  color: white;
}

.button-error:hover {
  background-color: #c0392b;
}

.edit-delete-menu {
  margin-top: 2em;
  display: flex;
  gap: 1em;
}

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
  width: 400px;
  max-width: 90%;
}

.modal-content h2 {
  margin-top: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1em;
}
</style>
