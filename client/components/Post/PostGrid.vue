<script setup lang="ts">
import PostThumbnail from "@/components/Post/PostThumbnail.vue";
import { PropType } from "vue";

// Define props with proper types
const props = defineProps({
  posts: {
    type: Array as PropType<Array<{
      _id: string;
      content: string;
      author: string;
      rating?: number;
      video?: string;
    }>>,
    required: true,
  },
  buttonLabel: {
    type: String,
    required: true,
  },
  buttonAction: {
    type: Function as PropType<(postId: string) => void>,
    required: true,
  },
});
</script>

<template>
  <div class="center-container">
    <div class="post-grid">
      <PostThumbnail
        v-for="post in posts"
        :key="post._id"
        :title="post.content"
        :user="post.author"
        :rating="post.rating"
        :videoUrl="post.video"
        :id="post._id"
        :buttonLabel="buttonLabel"
        @doNotShow="() => buttonAction(post._id)"
      />
    </div>
  </div>
</template>

<style scoped>
.center-container {
  display: flex;
  justify-content: center;
  padding: 1em;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4em;
  max-width: 1300px;
  width: 100%;
}

@media (max-width: 900px) {
  .post-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .post-grid {
    grid-template-columns: 1fr;
  }
}
</style>
