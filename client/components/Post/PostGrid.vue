<script setup lang="ts">
import PostThumbnail from "@/components/Post/PostThumbnail.vue";
import { fetchy } from "@/utils/fetchy";
import { onMounted, ref } from "vue";

const posts = ref([]);

const fetchPosts = async () => {
  try {
    const postResults = await fetchy("/api/posts", "GET");
    posts.value = postResults;
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

// Fetch posts when the component is mounted
onMounted(async () => {
  await fetchPosts();
});

// Function to handle the "Do Not Show" event
const doNotShowPost = (postId) => {
  // Logic to remove or hide the post from the grid
  posts.value = posts.value.filter((post) => post._id !== postId);
};
</script>

<template>
  <div class="post-grid">
    <PostThumbnail
      v-for="post in posts"
      :key="post._id"
      :title="post.content"
      :user="post.author"
      :rating="post.rating"
      :videoUrl="post.video"
      :id="post._id"
      @doNotShow="doNotShowPost(post._id)"
    />
  </div>
</template>

<style scoped>
.post-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2em; /* Adds spacing between columns and rows */
  padding: 2em;
  justify-items: center;
  align-items: start;
}

@media (max-width: 900px) {
  /* For medium screens (e.g., tablets), display 2 items per row */
  .post-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  /* For small screens (e.g., phones), display 1 item per row */
  .post-grid {
    grid-template-columns: 1fr;
  }
}
</style>
