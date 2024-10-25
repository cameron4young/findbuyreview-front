<script setup lang="ts">
import PostGrid from "@/components/Post/PostGrid.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";

interface Post {
  _id: string;
  content: string;
  author: string;
  rating?: number;
  video?: string;
  labels?: string[];
}

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const posts = ref<Post[]>([]);
const interests = ref<string[]>([]);
const selectedInterest = ref<string | null>(null);
const doNotShowList = ref<string[]>([]);
const blockedPostIds = ref<Set<string>>(new Set());
const loadingInterests = ref(true);
const loadingPosts = ref(false);
const error = ref<string | null>(null);
const showSearchDialog = ref(false);
const searchQuery = ref("");

// Fetch interests and do-not-show preferences
const fetchPreferences = async () => {
  try {
    loadingInterests.value = true;
    const response = await fetchy("/api/preferences", "GET");
    if (response.preferences) {
      interests.value = response.preferences.interests || [];
      doNotShowList.value = response.preferences.doNotShow || [];
      await compileBlockedPosts();
    } else {
      throw new Error("No preferences returned from the API.");
    }
  } catch (err) {
    console.error("Error fetching preferences:", err);
    error.value = "Error loading preferences. Please try again later.";
  } finally {
    loadingInterests.value = false;
  }
};

// Compile a list of posts to be blocked based on the "Do Not Show" labels
const compileBlockedPosts = async () => {
  blockedPostIds.value.clear();

  for (const item of doNotShowList.value) {
    // Check if the item is a valid ObjectId (i.e., a post ID)
    if (isValidObjectId(item)) {
      // Add the post ID directly to the blockedPostIds set
      blockedPostIds.value.add(item);
    } else {
      // If the item is not a post ID, treat it as a label
      try {
        const response = await fetchy(`/api/label/${item}`, "GET");
        if (response.posts && Array.isArray(response.posts)) {
          response.posts.forEach((postId: string) => {
            blockedPostIds.value.add(postId);
          });
        } else {
          console.error(`No posts found for label ${item}`);
        }
      } catch (err) {
        console.error(`Error fetching posts for label ${item}:`, err);
      }
    }
  }
};

// Utility function to check if a string is a valid ObjectId
const isValidObjectId = (id: string): boolean => {
  return /^[a-f\d]{24}$/i.test(id);
};

// Fetch posts based on the selected interest
const fetchPostsByInterest = async (interest: string | null) => {
  try {
    loadingPosts.value = true;
    error.value = null;
    const endpoint = interest ? `/api/label/${interest}` : "/api/posts";
    const response = await fetchy(endpoint, "GET");

    const fetchedPosts = Array.isArray(response.posts) ? response.posts : response;
    if (Array.isArray(fetchedPosts)) {
      posts.value = fetchedPosts.filter((post: Post) => !blockedPostIds.value.has(post._id));
    } else {
      posts.value = [];
    }
  } catch (err) {
    console.error("Error fetching posts:", err);
    error.value = "Error loading posts. Please try again later.";
  } finally {
    loadingPosts.value = false;
  }
};

// Fetch posts based on a search query
const fetchPostsBySearch = async (searchQuery: string) => {
  try {
    loadingPosts.value = true;
    selectedInterest.value=null;
    error.value = null;

    // Make a GET request with the query passed as a URL parameter
    const response = await fetchy(`/api/posts/search/`+searchQuery, "GET");

    const fetchedPosts = Array.isArray(response.posts) ? response.posts : response;

    if (Array.isArray(fetchedPosts)) {
      posts.value = fetchedPosts.filter((post: Post) => !blockedPostIds.value.has(post._id));
    } else {
      posts.value = [];
    }
  } catch (err) {
    console.error("Error fetching posts:", err);
    error.value = "Error loading posts. Please try again later.";
  } finally {
    loadingPosts.value = false;
  }
};




// Handle interest selection and unselection
const selectInterest = (interest: string | null) => {
  if (selectedInterest.value === interest) {
    selectedInterest.value = null;
    fetchPostsByInterest(null);
  } else {
    selectedInterest.value = interest;
    fetchPostsByInterest(interest);
  }
};

// Handle the "Do Not Show" event from PostGrid
const handleDoNotShowPost = async (postId: string) => {
  try {
    await fetchy("/api/preferences/blocked", "POST", { body: { block: postId } });
    posts.value = posts.value.filter((post) => post._id !== postId);
    doNotShowList.value.push(postId);
    blockedPostIds.value.add(postId);
  } catch (err) {
    console.error("Error blocking post:", err);
  }
};

// Open the search dialog
const openSearchDialog = () => {
  showSearchDialog.value = true;
};

// Perform search and close the dialog
const performSearch = () => {
  if (searchQuery.value.trim()) {
    fetchPostsBySearch(searchQuery.value.trim());
  }
  showSearchDialog.value = false;
};

onMounted(async () => {
  if (isLoggedIn.value) {
    try {
      await fetchPreferences();
      await fetchPostsByInterest(null);
    } catch (err) {
      console.error("Error during component initialization:", err);
    }
  }
});
</script>

<template>
  <main>
    <h1>General Feed</h1>
    <section v-if="isLoggedIn">
      <div v-if="loadingInterests">Loading interests...</div>
      <div v-else-if="error">{{ error }}</div>
      <div v-else>
        <div class="interest-selector">
          <button
            v-for="interest in interests"
            :key="interest"
            class="interest-button"
            @click="selectInterest(interest)"
            :class="{ active: selectedInterest === interest }"
          >
            {{ interest }}
          </button>
          <button class="search-button" @click="openSearchDialog">Search</button>
        </div>
        <div v-if="loadingPosts">Loading posts...</div>
        <PostGrid 
          v-else-if="posts.length > 0" 
          :posts="posts" 
          :buttonLabel="'Do Not Show'" 
          :buttonAction="handleDoNotShowPost" 
        />
        <p v-else>No posts in this category!</p>
      </div>
    </section>
    <section v-else>
      <h1>Please log in!</h1>
    </section>

    <!-- Search Dialog -->
    <div v-if="showSearchDialog" class="dialog-backdrop">
      <div class="search-dialog">
        <h2>Search Posts</h2>
        <textarea v-model="searchQuery" placeholder="Enter search query"></textarea>
        <div class="dialog-buttons">
          <button @click="performSearch" class="search-submit-button">Search</button>
          <button @click="showSearchDialog = false" class="search-cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 1em;
}

.interest-selector {
  display: flex;
  gap: 0.5em;
  overflow-x: auto;
  padding: 1em 0;
  margin-bottom: 1em;
  justify-content: center;
}

.interest-button,
.search-button {
  background-color: #c0c0c0;
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1em;
  white-space: nowrap;
}

.interest-button.active {
  background-color: #69988d;
  color: white;
}

.interest-button:hover,
.search-button:hover {
  background-color: #517a6b;
  color: white;
}

.dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-dialog {
  background: white;
  padding: 1em;
  border-radius: 8px;
  width: 300px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
}

textarea {
  width: 100%;
  height: 80px;
  margin-bottom: 1em;
  padding: 0.5em;
}

.dialog-buttons {
  display: flex;
  justify-content: space-between;
}

.search-submit-button,
.search-cancel-button {
  background-color: #69988d;
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
  color: white;
  border-radius: 4px;
}

.search-cancel-button {
  background-color: #e74c3c;
}

.search-submit-button:hover {
  background-color: #517a6b;
}

.search-cancel-button:hover {
  background-color: #c0392b;
}
</style>
