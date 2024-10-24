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

// Fetch interests and do-not-show preferences
const fetchPreferences = async () => {
  try {
    const response = await fetchy("/api/preferences", "GET");
    if (response.preferences) {
      if (response.preferences.interests) {
        interests.value = response.preferences.interests;
      } else {
        console.error("No interests found for this user.");
      }

      if (response.preferences.doNotShow) {
        doNotShowList.value = response.preferences.doNotShow;
        await compileBlockedPosts();
      }
    }
  } catch (error) {
    console.error("Error fetching preferences:", error);
  }
};

// Compile a list of posts to be blocked based on the "Do Not Show" labels
const compileBlockedPosts = async () => {
  blockedPostIds.value.clear();

  for (const item of doNotShowList.value) {
    // If the item is a label, fetch the posts associated with it
    const response = await fetchy(`/api/label/${item}`, "GET");
    if (response.posts && Array.isArray(response.posts)) {
      response.posts.forEach((postId) => {
        blockedPostIds.value.add(postId);
      });
    }
  }
};

// Fetch posts based on the selected interest
const fetchPostsByInterest = async (interest: string | null) => {
  try {
    const endpoint = interest ? `/api/label/${interest}` : "/api/posts";
    const postResults = await fetchy(endpoint, "GET");
    let fetchedPosts = postResults as Post[];

    // Filter out posts based on the compiled list of blocked post IDs
    fetchedPosts = fetchedPosts.filter((post) => !blockedPostIds.value.has(post._id));

    posts.value = fetchedPosts;
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

// Handle interest selection
const selectInterest = (interest: string | null) => {
  selectedInterest.value = interest;
  fetchPostsByInterest(interest);
};

// Handle the "Do Not Show" event from PostGrid
const handleDoNotShowPost = async (postId: string) => {
  try {
    // Update the "Do Not Show" list on the server
    await fetchy("/api/preferences/blocked", "POST", { body: { block: postId } });

    // Remove the post from the current posts list
    posts.value = posts.value.filter((post) => post._id !== postId);

    // Add the post ID to the local "Do Not Show" list to keep the state consistent
    doNotShowList.value.push(postId);
    blockedPostIds.value.add(postId);
  } catch (error) {
    console.error("Error blocking post:", error);
  }
};

onMounted(async () => {
  if (isLoggedIn.value) {
    await fetchPreferences();
    await fetchPostsByInterest(null);
  }
});
</script>

<template>
  <main>
    <h1>General Feed</h1>
    <section v-if="isLoggedIn">
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
      </div>
      <PostGrid 
        v-if="posts.length > 0" 
        :posts="posts" 
        :buttonLabel="'Do Not Show'" 
        :buttonAction="handleDoNotShowPost" 
      />
      <p v-else>No posts in this category!</p>
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

.interest-selector {
  display: flex;
  gap: 0.5em;
  overflow-x: auto;
  padding: 1em 0;
  margin-bottom: 1em;
  justify-content: center;
}

.interest-button {
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

.interest-button:hover {
  background-color: #517a6b;
  color: white;
}
</style>
