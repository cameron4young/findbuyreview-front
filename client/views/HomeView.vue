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
const searchQuery = ref("");
const lookingFor = ref<string>("");

// Fetch interests and other user preferences
const fetchPreferences = async () => {
  try {
    loadingInterests.value = true;
    const response = await fetchy("/api/preferences", "GET");
    if (response.preferences) {
      interests.value = response.preferences.interests || [];
      lookingFor.value = response.preferences.lookingFor || "";
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

// Compile posts to be blocked based on "Do Not Show" labels
const compileBlockedPosts = async () => {
  blockedPostIds.value.clear();

  for (const item of doNotShowList.value) {
    if (isValidObjectId(item)) {
      blockedPostIds.value.add(item);
    } else {
      try {
        const response = await fetchy(`/api/label/${item}`, "GET");
        if (response.posts && Array.isArray(response.posts)) {
          response.posts.forEach((postId: string) => blockedPostIds.value.add(postId));
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
const isValidObjectId = (id: string): boolean => /^[a-f\d]{24}$/i.test(id);

// Fetch posts based on selected interest
const fetchPostsByInterest = async (interest: string | null) => {
  try {
    loadingPosts.value = true;
    error.value = null;

    if (interest) {
      selectedInterest.value = interest;
      const response = await fetchy(`/api/label/${interest}`, "GET");
      const interestPosts: Post[] = Array.isArray(response.posts) ? response.posts : response;
      const promotedResponse = await fetchy(`/api/label/promoted/${interest}`, "GET");
      const promotedPosts: Post[] = Array.isArray(promotedResponse.posts) ? promotedResponse.posts : [];

      const combinedPosts = [...promotedPosts, ...interestPosts.filter(post => !promotedPosts.some(p => p._id === post._id))];
      posts.value = combinedPosts.filter((post: Post) => !blockedPostIds.value.has(post._id));
    } else {
      selectedInterest.value = null;
      const response = await fetchy("/api/posts", "GET");
      const generalPosts = Array.isArray(response.posts) ? response.posts : response;

      let promotedPosts: Post[] = [];
      if (lookingFor.value) {
        const promotedLookingForResponse = await fetchy(`/api/label/promoted/${lookingFor.value}`, "GET");
        promotedPosts = Array.isArray(promotedLookingForResponse.posts) ? promotedLookingForResponse.posts : [];
      }

      if (promotedPosts.length === 0 && interests.value.length > 0) {
        for (const userInterest of interests.value) {
          const promotedInterestResponse = await fetchy(`/api/label/promoted/${userInterest}`, "GET");
          promotedPosts.push(...(Array.isArray(promotedInterestResponse.posts) ? promotedInterestResponse.posts : []));
        }
        promotedPosts = promotedPosts.filter((post, index, self) => index === self.findIndex((p) => p._id === post._id));
      }

      const postsToDisplay = [];
      let promotedIndex = 0;
      for (let i = 0; i < generalPosts.length; i++) {
        if (i > 0 && i % 6 === 0 && promotedIndex < promotedPosts.length) {
          if (!blockedPostIds.value.has(promotedPosts[promotedIndex]._id)) postsToDisplay.push(promotedPosts[promotedIndex]);
          promotedIndex++;
        }
        if (!blockedPostIds.value.has(generalPosts[i]._id)) postsToDisplay.push(generalPosts[i]);
      }

      posts.value = postsToDisplay;
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
    selectedInterest.value = null;
    error.value = null;

    const response = await fetchy(`/api/posts/search/` + searchQuery, "GET");
    posts.value = Array.isArray(response.posts) ? response.posts.filter((post: Post) => !blockedPostIds.value.has(post._id)) : [];
  } catch (err) {
    console.error("Error fetching posts:", err);
    error.value = "Error loading posts. Please try again later.";
  } finally {
    loadingPosts.value = false;
  }
};

// Trigger search when Enter key is pressed
const handleSearchEnter = (event: KeyboardEvent) => {
  if (event.key === "Enter" && searchQuery.value.trim()) {
    fetchPostsBySearch(searchQuery.value.trim());
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
    <br>
    <section v-if="isLoggedIn">
      <div v-if="loadingInterests" class="loading">Loading interests...</div>
      <div v-else-if="error">{{ error }}</div>
      <div v-else>
        <!-- Search Input Field -->
        <div class="search-input-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search posts..."
            @keydown="handleSearchEnter"
            class="search-input"
          />
        </div>
        
        <div class="interest-selector">
          <!-- General button to show the original feed -->
          <button
            class="interest-button"
            @click="selectInterest(null)"
            :class="{ active: selectedInterest === null }"
          >
            General
          </button>

          <!-- Interest buttons for each user interest -->
          <button
            v-for="interest in interests"
            :key="interest"
            class="interest-button"
            @click="selectInterest(interest)"
            :class="{ active: selectedInterest === interest }"
          >
            {{ interest }}
          </button>
        </div>

        <div v-if="loadingPosts" class="loading">Loading posts...</div>
        <PostGrid
          v-else-if="posts.length > 0"
          :posts="posts"
          :buttonLabel="'Do Not Show'"
          :buttonAction="handleDoNotShowPost"
        />
        <p v-else class="loading" style="left:43vw">No posts in this category!</p>
      </div>
    </section>
    <section v-else>
      <h1>Please log in!</h1>
    </section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 1em;
}

.search-input-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1em;
}

.search-input {
  padding: 0.5em;
  width: 300px;
  border: 1px solid #c0c0c0;
  border-radius: 4px;
  font-size: 1em;
}

.interest-selector {
  display: flex;
  gap: 0.5em;
  overflow-x: auto;
  padding: 1em 0;
  margin-bottom: 1em;
  justify-content: center;
}

.interest-button {
  background-color: #C8A37E;
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1em;
  white-space: nowrap;
}

.interest-button.active {
  background-color: #6a553f;
  color: white;
}

.interest-button:hover {
  background-color: #ab9379;
  color: white;
}

.loading{
  position:absolute;
  font-size: large;
  top: 50vh;
  left: 45vw;
}
</style>
