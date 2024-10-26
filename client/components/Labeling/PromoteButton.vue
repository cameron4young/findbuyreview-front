<script setup lang="ts">
import { BodyT, fetchy } from "@/utils/fetchy";
import { ElMessage, ElMessageBox } from "element-plus";
import { defineProps, ref } from 'vue';

const props = defineProps<{ postId: string }>();

const promoting = ref(false);

interface LabelRequestBody {
  postId: string;
  label: string;
  expiration: string;
}

const promotePost = async () => {
  promoting.value = true;
  try {
    // Prompt for the number of days for promotion
    const { value: daysValue } = await ElMessageBox.prompt(
      "Enter the number of days for promotion:",
      "Promotion Duration",
      {
        confirmButtonText: "Next",
        cancelButtonText: "Cancel",
        inputPattern: /^\d+$/,
        inputErrorMessage: "Please enter a valid number of days.",
      }
    );

    const expirationDays = parseInt(daysValue, 10);
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expirationDays);
    const expirationDateString = expirationDate.toISOString();

    // Prompt for additional tags
    const { value: tags } = await ElMessageBox.prompt(
      "Enter additional tags (comma separated):",
      "Additional Tags",
      {
        confirmButtonText: "Promote",
        cancelButtonText: "Cancel",
        inputPlaceholder: "e.g., Tag1, Tag2, Tag3",
      }
    );

    console.log(props.postId);

    const labelRequestBody: BodyT = {
      postId: props.postId,
      label: "promoted",
      expiration: expirationDateString,
    };

    // Promote the post by adding the "promoted" label with an expiration date
    await fetchy(`/api/label`, "POST", {
      body: labelRequestBody, // Pass the body as an object
    });


    // Add additional tags individually as labels
    if (tags.trim() !== "") {
      const tagList = tags.split(",").map((tag) => tag.trim());
      console.log(tagList);
      for (const tag of tagList) {
        if (tag) {
          await fetchy(`/api/label`, "POST", {
            body: {
              postId: props.postId,
              label: tag,
            },
          });
        }
      }
    }

    ElMessage({
      message: "Post promoted successfully!",
      type: "success",
    });
  } catch (error) {
    if (error !== "cancel") {
      console.error("Error promoting post:", error);
      ElMessage({
        message: "Failed to promote post. Please try again.",
        type: "error",
      });
    }
  } finally {
    promoting.value = false;
  }
};
</script>

<template>
  <button class="promote-button" :disabled="promoting" @click="promotePost">
    Promote Post
  </button>
  <!-- If there's additional content from the second template, include it here -->
</template>

<style scoped>
.promote-button {
  background-color: #69988d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5em 1em;
  cursor: pointer;
  transition: background-color 0.3s;
}

.promote-button:hover {
  background-color: #517a6b;
}

.promote-button:disabled {
  background-color: #c0c0c0;
  cursor: not-allowed;
}

/* Include additional styles from the second style block here if needed */
</style>
