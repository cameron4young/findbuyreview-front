<template>
    <div class="status-input">
      <label for="status">Currently looking for...</label>
      <input
        type="text"
        id="status"
        v-model="status"
        placeholder="e.g., Car, apartment, etc."
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineEmits, ref, watch } from 'vue';
  
  const status = ref<string>('');
  const emit = defineEmits(['update:status']);
  
  watch(status, (newValue) => {
    emit('update:status', newValue);
  });
  </script>
  
  <style scoped>
  .status-input {
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
  