<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  title: String,
  user: String,
  rating: Number,
  videoUrl: String,
  id: String,
  buttonLabel: String,
});

const isHovered = ref(false);
const router = useRouter();

const videoSrc = computed(() => {
  const baseUrl = props.videoUrl;
  return isHovered.value ? `${baseUrl}&autoplay=1` : baseUrl;
});

const toggleHover = (state: boolean) => {
  isHovered.value = state;
};

const navigateToPost = () => {
  router.push(`/post/${props.id}`);
};
</script>

<template>
  <div
    class="post-thumbnail"
    @click="navigateToPost"
    @mouseover="toggleHover(true)"
    @mouseleave="toggleHover(false)"
  >
    <div class="iframe-container">
      <iframe
        :src="videoSrc"
        class="iframe"
        title="Video preview"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </div>
    <p class="post-title">{{ title }}</p>
    <p class="post-user">by {{ user }}</p>
    <p class="post-rating">Rating: {{ rating }} / 5</p>
    <button class="action-btn" @click.stop="$emit('doNotShow')">{{ buttonLabel }}</button>
  </div>
</template>

<style scoped>
.post-thumbnail {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1em;
  background-color: white;
  transition: transform 0.2s;
  cursor: pointer;
}

.post-thumbnail:hover {
  transform: scale(1.05);
}

.iframe-container {
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.post-title {
  font-weight: bold;
  font-size: 1.3em; /* Increased font size */
  text-align: center;
  margin: 0.3em 0; /* Reduced margin around title */
}

.post-user,
.post-rating {
  font-size: 0.9em;
  text-align: center;
  margin: 0;
}

.action-btn {
  background-color: #949292;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5em;
  cursor: pointer;
  font-size: 0.8em;
}

.action-btn:hover {
  background-color: #7a7a7a;
}
</style>
