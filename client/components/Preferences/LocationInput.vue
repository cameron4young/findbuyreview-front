<template>
    <div class="location-input">
      <label for="location">Enter your location:</label>
      <input
        type="text"
        id="location"
        v-model="location"
        placeholder="e.g., New York, USA"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineEmits, ref, watch } from 'vue';
  
  const location = ref<string>('');
  const emit = defineEmits(['update:location']);
  
  watch(location, (newValue) => {
    emit('update:location', newValue);
  });
  </script>
  
  <style scoped>
  .location-input {
    margin: 0 auto;
    margin-bottom: 1em;
    max-width: 400px;
  }
  
  label {
    display: block;
    margin-bottom: 0.5em;
  }
  
  input {
    width: 100%;
    padding: 0.5em;
    font-size: 1em;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  </style>
  