<template>
  <div class="interest-selection">
    <h2>Select Your Interests</h2>
    <form @submit.prevent>
      <!-- Existing interests with checkboxes -->
      <div class="custom-interest">
        <input
          type="text"
          v-model="newInterest"
          placeholder="Add your own interest..."
        />
        <button type="button" @click="addCustomInterest" class="btn-add">Add</button>
      </div>
      <div v-for="interest in suggestedInterests" :key="interest" class="interest-item">
        <label>
          <input
            type="checkbox"
            :value="interest"
            v-model="selectedInterests"
          />
          {{ interest }}
        </label>
      </div>
  
      <!-- Input to add a custom interest -->
      
    </form>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue';

// Define props
const props = defineProps<{
  value: string[],
  suggestedInterests: string[]
}>();

const selectedInterests = ref<string[]>([...props.value]);
const newInterest = ref<string>('');

// Use suggested interests from props
const interests = ref<string[]>([...props.suggestedInterests]);

const emit = defineEmits(['update:selectedInterests']);

onMounted(() => {
  // Initialize selectedInterests based on the value passed via props
  selectedInterests.value = props.value;
});

// Watch selectedInterests and emit changes to the parent
watch(selectedInterests, (newValue) => {
  emit('update:selectedInterests', newValue);
});

// Function to add a custom interest
const addCustomInterest = () => {
  const trimmedInterest = newInterest.value.trim();
  if (trimmedInterest && !interests.value.includes(trimmedInterest)) {
    interests.value.push(trimmedInterest);
  }
  if (trimmedInterest && !selectedInterests.value.includes(trimmedInterest)) {
    selectedInterests.value.push(trimmedInterest);
  }
  newInterest.value = ''; // Clear the input field after adding
};
</script>

<style scoped>
.interest-selection {
  max-width: 400px;
  margin: 0 auto;
  padding: 1em;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
}

.interest-item {
  margin: 0.5em 0;
}

.custom-interest {
  display: flex;
  gap: 0.5em;
  margin: 1em 0;
}

.custom-interest input {
  flex: 1;
  padding: 0.5em;
}

.btn-add {
  padding: 0.5em;
  background-color: #69988D;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}
</style>
