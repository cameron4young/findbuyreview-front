<template>
  <div v-if="isLoading">
    <p>Loading post...</p>
  </div>
  <div v-else-if="post">
    <component
      :is="postComponent"
      :post="post"
      @updatePost="handleUpdatePost"
    />
  </div>
  <div v-else>
    <p>Post not found.</p>
  </div>
</template>

<script setup lang="ts">
import OtherPostView from '@/components/Post/OtherPostView.vue';
import OwnPostView from '@/components/Post/OwnPostView.vue';
import { fetchy } from '@/utils/fetchy';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Define the type for the post
interface Post {
  _id: string;
  author: string;
  content: string;
  video?: string;
  productURL?: string;
  rating?: number;
  dateCreated: string;
}

// Define the type for the user
interface User {
  username:string;
  _id: string;
  // Include other user fields if necessary
}

// State to store the post and user
const post = ref<Post | null>(null);
const currentUser = ref<User | null>(null);
const isLoading = ref(true);

// Get the current route and router instance
const route = useRoute();
const router = useRouter();

// Function to fetch post by ID
const fetchPostById = async (id: string) => {
  try {
    const response = await fetchy(`/api/posts/${id}`, 'GET');
    if (response) {
      post.value = response[0] as Post; // Assuming the response is an array with one post
    } else {
      console.error('Post not found');
      router.push('/404');
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    router.push('/404');
  }
};

// Function to fetch the current user
const fetchCurrentUser = async () => {
  try {
    const response = await fetchy('/api/session', 'GET');
    if (response) {
      currentUser.value = response as User;
    } else {
      console.error('User not found');
      // Handle unauthenticated state if necessary
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
    // Handle error
  }
};

// Fetch the post and current user when the component is mounted
onMounted(async () => {
  const postId = route.params.id as string;
  if (postId) {
    await Promise.all([fetchPostById(postId), fetchCurrentUser()]);
  }
  isLoading.value = false;
});

// Determine which component to render
const postComponent = computed(() => {
  if (post.value && currentUser.value) {
    if (post.value.author === currentUser.value.username) {
      return OwnPostView;
    } else {
      return OtherPostView;
    }
  } else if (post.value) {
    return OtherPostView; // Default to OtherPostView if user is not logged in
  } else {
    return null; // Post not found
  }
});

// Handle the updatePost event emitted from OwnPostView
const handleUpdatePost = (updatedPost: Post) => {
  post.value = updatedPost;
};
</script>

<style scoped>
/* You can include any shared styles here if needed */
</style>
