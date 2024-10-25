<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { defineProps, onMounted, ref } from "vue";

// Props definition
const props = defineProps<{ postId: string }>();

// Reactive state to manage collections and modal visibility
const collections = ref<{ _id: string; name: string }[]>([]);
const isModalOpen = ref(false);
const newCollectionName = ref("");

// Fetch collections for the logged-in user
const fetchCollections = async () => {
  try {
    const response = await fetchy("/api/collection/user", "GET");
    if (response.collections) {
      collections.value = response.collections;
    } else {
      console.error("No collections found for this user.");
    }
  } catch (error) {
    console.error("Error fetching collections:", error);
  }
};

// Function to handle saving a post to an existing collection
const saveToCollection = async (collectionId: string) => {
  try {
    await fetchy("/api/save", "POST", {
      body: { collectionId: collectionId, id: props.postId },
    });
    console.log(`Post saved to collection ${collectionId}`);
    isModalOpen.value = false;
  } catch (error) {
    console.error("Error saving post to collection:", error);
  }
};

// Function to handle creating a new collection
const createCollection = async () => {
  if (!newCollectionName.value) return;

  try {
    const response = await fetchy("/api/collection", "POST", {
      body: { collectionName: newCollectionName.value },
    });
    if (response.collection) {
      collections.value.push(response.collection);
      saveToCollection(response.collection._id);
    }
    newCollectionName.value = "";
  } catch (error) {
    console.error("Error creating collection:", error);
  }
};

// Open the modal and fetch collections when the button is clicked
const openModal = () => {
  isModalOpen.value = true;
  fetchCollections();
};

// Close the modal
const closeModal = () => {
  isModalOpen.value = false;
};

// Fetch collections on mount
onMounted(fetchCollections);
</script>

<template>
  <div>
    <button class="btn" @click="openModal">💾 Save to Collection</button>

    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h2>Select a Collection</h2>
        <ul>
          <li
            v-for="collection in collections"
            :key="'k'+collection._id"
            @click="saveToCollection(collection._id)"
            class="collection-item"
          >
            {{ collection.name }}
          </li>
        </ul>
        <h3>Create New Collection</h3>
        <input
          v-model="newCollectionName"
          placeholder="New collection name"
          class="input"
        />
        <button @click="createCollection" class="btn">Create and Save</button>
        <button @click="closeModal" class="btn">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn {
  padding: 0.5em 1em;
  border-radius: 4px;
  background-color: #69988d;
  color: white;
  border: none;
  cursor: pointer;
}

.btn:hover {
  background-color: #517a6b;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: white;
  padding: 2em;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}

.collection-item {
  cursor: pointer;
  padding: 0.5em;
  border-bottom: 1px solid #ddd;
}

.collection-item:hover {
  background-color: #f0f0f0;
}

.input {
  padding: 0.5em;
  width: 100%;
  margin-bottom: 1em;
}
</style>
