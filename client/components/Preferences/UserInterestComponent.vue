<template>
    <div class="interest-selection">
      <h2>Select Your Interests</h2>
      <form @submit.prevent>
        <!-- Existing interests with checkboxes -->
        <div v-for="interest in interests" :key="interest" class="interest-item">
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
        <div class="custom-interest">
          <input
            type="text"
            v-model="newInterest"
            placeholder="Add your own interest..."
          />
          <button type="button" @click="addCustomInterest" class="btn-add">Add</button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { defineEmits } from 'vue';
  
  const interests = ref([
    'Sports',
    'Movies',
    'Music',
    'Gaming',
    'Technology',
    'Art',
    'Fashion',
    'Fitness',
    'Travel',
    'Cooking',
    'Politics',
    'Books',
    'Celebrities'
  ]);
  
  const selectedInterests = ref<string[]>([]);
  const newInterest = ref<string>('');
  
  const emit = defineEmits(['update:selectedInterests']);
  
  // Simulate fetching saved interests from a database or local storage
  const fetchSavedInterests = () => {
    // Example saved interests - replace with your actual data fetching logic
    return ['Music', 'Technology', 'Travel'];
  };
  
  onMounted(() => {
    // Populate the selectedInterests with saved interests when the component is mounted
    selectedInterests.value = fetchSavedInterests();
  });
  
  // Watch for changes in selectedInterests and emit the updated list
  watch(selectedInterests, (newValue) => {
    emit('update:selectedInterests', newValue);
  });
  
  // Function to add a custom interest
  const addCustomInterest = () => {
    const trimmedInterest = newInterest.value.trim();
    if (trimmedInterest && !interests.value.includes(trimmedInterest)) {
      interests.value.push(trimmedInterest);
      selectedInterests.value.push(trimmedInterest);
      newInterest.value = ''; // Clear the input field after adding
    }
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
  