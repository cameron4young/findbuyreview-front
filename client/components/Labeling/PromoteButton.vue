<template>
  <div>
    <button class="btn-small pure-button" @click="isPromoting = true">Promote</button>

    <!-- Promotion Modal -->
    <div v-if="isPromoting" class="modal-overlay">
      <div class="modal-content">
        <h2>Promote Post</h2>
        <form @submit.prevent="promotePost">
          <!-- Promotion Duration -->
          <div class="form-group">
            <label for="duration">Promotion Duration (Days):</label>
            <input
              v-model.number="promotionForm.duration"
              id="duration"
              type="number"
              min="1"
              required
            />
          </div>

          <!-- Additional Tags -->
          <div class="form-group">
            <label for="tags">Additional Tags (comma separated):</label>
            <input
              v-model="promotionForm.tags"
              id="tags"
              type="text"
              placeholder="e.g., Tag1, Tag2, Tag3"
            />
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn pure-button">Promote</button>
            <button type="button" class="btn pure-button" @click="closeModal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BodyT, fetchy } from "@/utils/fetchy";
import { ref } from "vue";

const props = defineProps<{ postId: string }>();

const isPromoting = ref(false);

const promotionForm = ref({
  duration: 1,
  tags: "",
});

// Promote the post
const promotePost = async () => {
  try {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + promotionForm.value.duration);
    const expirationDateString = expirationDate.toISOString();

    const labelRequestBody: BodyT = {
      postId: props.postId,
      label: "promoted",
      expiration: expirationDateString,
    };

    // Send promotion request
    await fetchy(`/api/label`, "POST", { body: labelRequestBody });

    // Add additional tags if provided
    if (promotionForm.value.tags.trim()) {
      const tagList = promotionForm.value.tags.split(",").map((tag) => tag.trim());
      for (const tag of tagList) {
        await fetchy(`/api/label`, "POST", {
          body: {
            postId: props.postId,
            label: tag,
          },
        });
      }
    }

    closeModal();
  } catch (error) {
    console.error("Error promoting post:", error);
  }
};

const closeModal = () => {
  isPromoting.value = false;
  promotionForm.value = { duration: 1, tags: "" }; // Reset form
};
</script>

<style scoped>
.btn-small {
  padding: 0.3em 0.6em;
  font-size: 0.9em;
  background-color: #94ac5a;
}

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
  background-color: #fff;
  padding: 2em;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.modal-content h2 {
  margin-top: 0;
}

.form-group {
  margin-bottom: 1em;
}

.form-group label {
  display: block;
  margin-bottom: 0.5em;
}

.form-group input {
  width: 100%;
  padding: 0.5em;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1em;
}
</style>
