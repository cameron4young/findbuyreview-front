<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";

const { currentUsername } = storeToRefs(useUserStore());
const router = useRouter();

const content = ref("");
const video = ref("");
const productURL = ref("");
const rating = ref<number | null>(null);
const labels = ref<string[]>([]);
const newLabel = ref("");

const availableInterests = ref<string[]>([
  'Sports', 'Movies', 'Music', 'Gaming', 'Technology', 'Art', 'Fashion', 'Fitness',
  'Travel', 'Cooking', 'Politics', 'Books', 'Celebrities', 'Health & Wellness', 
  'Yoga', 'Meditation', 'Hiking', 'Biking', 'Photography', 'Cars', 'Luxury', 
  'Interior Design', 'DIY Projects', 'Gardening', 'Fishing', 'Camping', 'Surfing',
  'Skiing', 'Home Improvement', 'Business', 'Finance', 'Investing'
]);

const emit = defineEmits(["refreshPosts"]);

const createPost = async () => {
  try {
    const response = await fetchy("/api/posts", "POST", {
      body: {
        content: content.value,
        video: video.value,
        productURL: productURL.value,
        rating: rating.value,
        labels: labels.value,
      },
    });
    if (response && response.post && response.post._id) {
      // Add labels to the created post
      for (const label of labels.value) {
        await fetchy(`/api/label`, "POST", {
          body: {
            postId: response.post._id,
            label,
          },
        });
      }

      // Navigate to the new post's page using the post ID
      router.push(`/post/${response.post._id}`);
    } else {
      console.error("Error creating post: No ID returned");
    }
  } catch (error) {
    console.error("Error creating post:", error);
  }
};

const emptyForm = () => {
  content.value = "";
  video.value = "";
  productURL.value = "";
  rating.value = null;
  labels.value = [];
};

const addCustomLabel = () => {
  const trimmedLabel = newLabel.value.trim();
  if (trimmedLabel && !availableInterests.value.includes(trimmedLabel)) {
    availableInterests.value.push(trimmedLabel);
  }
  if (trimmedLabel && !labels.value.includes(trimmedLabel)) {
    labels.value.push(trimmedLabel);
  }
  newLabel.value = "";
};

const toggleLabelSelection = (label: string) => {
  if (labels.value.includes(label)) {
    labels.value = labels.value.filter(l => l !== label);
  } else {
    labels.value.push(label);
  }
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

    <label for="rating">Rating:</label>
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

    <div class="form-section">
      <label>Select or Add Labels:</label>
      <div class="labels-grid">
        <div v-for="interest in availableInterests" :key="interest" class="label-item">
          <label>
            <input
              type="checkbox"
              :value="interest"
              :checked="labels.includes(interest)"
              @change="toggleLabelSelection(interest)"
            />
            {{ interest }}
          </label>
        </div>
        <div class="custom-label">
          <input
            type="text"
            v-model="newLabel"
            placeholder="Add your own label..."
          />
          <button type="button" @click="addCustomLabel" class="btn-add">Add</button>
        </div>
      </div>
    </div>

    <button type="submit" class="submit-button">Create Post</button>
  </form>
</template>

<style scoped>
form {
  background-color: #dad4ce3c;
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

button {
  background-color: #94ac5a;
}

textarea,
input {
  font-family: inherit;
  font-size: inherit;
  padding: 0.5em;
  border-radius: 4px;
}

textarea {
  height: 2em;
  resize: none;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.25em;
}

.labels-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5em; 
  margin: 0.5em 0;
}

.label-item {
  display: flex;
  align-items: center;
  gap: 0.2em; 
}

.custom-label {
  display: flex;
  gap: 0.3em;
  margin: 0.5em 0;
}

.custom-label input {
  flex: 1;
  padding: 0.4em; 
}

.btn-add {
  padding: 0.4em;
  background-color: #94ac5a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em; 
}


.submit-button {
  padding: 0.75em;
  border-radius: 8px;
  background-color: #94ac5a;
  color: white;
  font-size: 1em;
  cursor: pointer;
  border: none;
}

.submit-button:hover {
  background-color: #7a8e4a;
}
</style>
