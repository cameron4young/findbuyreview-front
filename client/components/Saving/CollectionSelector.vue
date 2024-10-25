<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { defineEmits, onMounted, ref } from "vue";

// Define the Collection interface
interface Collection {
  _id: string;
  name: string;
}

// State to store collections and selected collection
const collections = ref<Collection[]>([]);
const selectedCollection = ref<string | null>(null);

const emit = defineEmits<{
  (e: "selectCollection", collectionId: string | null): void;
}>();

// Fetch collections based on the logged-in user
const fetchCollections = async () => {
  try {
    const response = await fetchy(`/api/collections/user`, "GET");
    if (response.collections) {
      collections.value = response.collections as Collection[];
    } else {
      console.error("No collections found for this user.");
    }
  } catch (error) {
    console.error("Error fetching collections:", error);
  }
};

// Function to handle collection selection and toggle selection
const selectCollection = (collectionId: string) => {
  // Toggle selection: if the same collection is selected again, unselect it
  console.log(selectedCollection)
  if (selectedCollection.value === collectionId) {
    console.log(`Unselecting collection: ${collectionId}`);
    selectedCollection.value = null; // Unselect to show the general feed
  } else {
    console.log(`Selecting collection: ${collectionId}`);
    selectedCollection.value = collectionId;
  }
  emit("selectCollection", selectedCollection.value);
};

// Fetch collections when the component is mounted
onMounted(() => {
  fetchCollections();
});
</script>

<template>
  <div class="collection-selector">
    <button
      v-for="collection in collections"
      :key="collection._id"
      class="collection-button"
      :class="{ active: selectedCollection === collection._id }"
      @click="selectCollection(collection._id)"
    >
      {{ collection.name }}
    </button>
  </div>
</template>

<style scoped>
.collection-selector {
  display: flex;
  gap: 1em;
  margin-bottom: 1em;
  overflow-x: auto;
  padding: 0.5em;
}

.collection-button {
  background-color: #e5e5e5;
  border: none;
  padding: 0.5em 1em;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.collection-button:hover {
  background-color: #cfcfcf;
}

.collection-button.active {
  background-color: #69988d;
  color: white;
}
</style>
