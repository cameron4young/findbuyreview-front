<script setup lang="ts">
import PostGrid from "@/components/Post/PostGrid.vue";
import { fetchy } from "@/utils/fetchy";
import { onMounted, ref } from "vue";

interface Post {
  _id: string;
  content: string;
  author: string;
  rating?: number;
  video?: string;
  productURL?: string;
  dateCreated: string;
  dateUpdated: string;
}

const collections = ref<{ _id: string; name: string }[]>([]);
const selectedCollection = ref<string | null>(null);
const posts = ref<Post[]>([]);
const newCollectionName = ref<string>("");
const showModal = ref(false); // Controls the visibility of the modal

const fetchCollections = async () => {
  try {
    const response = await fetchy(`/api/collection/user`, "GET");
    if (response.collections) {
      collections.value = response.collections;
    }
  } catch (error) {
    console.error("Error fetching collections:", error);
  }
};

const fetchPostsByCollection = async (collectionId: string) => {
  try {
    const endpoint = `/api/posts/collection/${collectionId}`;
    const postResults = await fetchy(endpoint, "GET");
    posts.value = postResults as Post[];
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

const selectCollection = (collectionId: string | null) => {
  selectedCollection.value = collectionId;
  if (collectionId) {
    fetchPostsByCollection(collectionId);
  } else {
    posts.value = [];
  }
};

const removePostFromCollection = async (postId: string) => {
  if (selectedCollection.value) {
    try {
      const response = await fetchy(`/api/save/${encodeURIComponent(selectedCollection.value)}/${encodeURIComponent(postId)}`, "DELETE");

      if (response.msg === "Post successfully removed from collection!") {
        posts.value = posts.value.filter((post) => post._id !== postId);
      } else {
        console.error("Error removing post:", response.msg);
      }
    } catch (error) {
      console.error("Error removing post from collection:", error);
    }
  }
};

const addCollection = async () => {
  const trimmedName = newCollectionName.value.trim();
  if (trimmedName) {
    try {
      const response = await fetchy("/api/collection", "POST", {
        body: { collectionName: trimmedName },
      });
      if (response.collection) {
        collections.value.push(response.collection); // Add new collection to list
        newCollectionName.value = ""; // Reset input field
        showModal.value = false; // Close the modal
      }
    } catch (error) {
      console.error("Error adding collection:", error);
    }
  }
};

onMounted(async () => {
  await fetchCollections();
});
</script>

<template>
  <main>
    <h1>Saved Posts</h1>
    <section class="collection-selector">
      <button
        v-for="collection in collections"
        :key="collection._id"
        @click="selectCollection(collection._id)"
        :class="{ active: selectedCollection === collection._id }"
      >
        {{ collection.name }}
      </button>
      <button class="add-collection-button" @click="showModal = true">+ Add Collection</button>
    </section>

    <!-- Modal for adding a new collection -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Add New Collection</h2>
        <input
          type="text"
          v-model="newCollectionName"
          placeholder="Enter collection name"
          class="modal-input"
        />
        <div class="modal-actions">
          <button @click="addCollection" class="modal-button">Add</button>
          <button @click="showModal = false" class="modal-button cancel">Cancel</button>
        </div>
      </div>
    </div>

    <PostGrid 
      v-if="selectedCollection && posts.length > 0" 
      :posts="posts" 
      buttonLabel="Remove from Collection" 
      :buttonAction="removePostFromCollection" 
    />
    <p v-else-if="selectedCollection && posts.length === 0" class="saved">No posts found in this collection.</p>
    <p v-else class="saved">Please select a collection to view posts.</p>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 1em;
}

.collection-selector {
  display: flex;
  gap: 0.5em;
  overflow-x: auto;
  padding: 1em 0;
  margin-bottom: 1em;
  justify-content: center;
  align-items: center;
}

.collection-selector button {
  background-color: #C8A37E;
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1em;
  white-space: nowrap;
}

.collection-selector button.active {
  background-color: #6a553f;
  color: white;
}

.collection-selector button:hover {
  background-color: #ab9379;
  color: white;
}

.add-collection-button {
  /* background-color: #4CAF50; */
  color: white;
  border: none;
  padding: 0.5em 1em;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

.add-collection-button:hover {
  background-color: #45a049;
}

/* Modal styling */
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
  background-color: #f5f5f5;
  padding: 2em;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.modal-input {
  width: 100%;
  padding: 0.5em;
  margin-top: 1em;
  margin-bottom: 1em;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
}

.modal-button {
  background-color: #94ac5a;
  padding: 0.5em 1em;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

.modal-button:hover {
  background-color: #b8cd87;
  color: white;
}

.modal-button.cancel {
  background-color: #e74c3c;
  color: white;
}

.modal-button.cancel:hover {
  background-color: #c0392b;
}

.saved{
  position: relative;
  left: 1vw;
  top: 10vh;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; 
  font-size: 2em; 
  font-weight: bold; 
  color: #555;
}
</style>

