<template>
    <div class="do-not-show-list">
      <h2>Do Not Show</h2>
      <div class="list" v-if="doNotShow.length > 0">
        <div v-for="(item, index) in doNotShow" :key="index" class="list-item">
          <span>{{ item }}</span>
          <button @click="removeItem(index)">Remove</button>
        </div>
      </div>
      <div class="add-item">
        <input
          type="text"
          v-model="newItem"
          placeholder="Add an item..."
        />
        <button @click="addItem">Add</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineEmits, ref } from 'vue';
  
  const doNotShow = ref<string[]>([]);
  const newItem = ref<string>('');
  const emit = defineEmits(['update:doNotShow']);
  
  // Function to add a new item
  const addItem = () => {
    const trimmedItem = newItem.value.trim();
    if (trimmedItem && !doNotShow.value.includes(trimmedItem)) {
      doNotShow.value.push(trimmedItem);
      newItem.value = ''; // Clear the input field after adding
      emit('update:doNotShow', doNotShow.value);
    }
  };
  
  // Function to remove an item
  const removeItem = (index: number) => {
    doNotShow.value.splice(index, 1);
    emit('update:doNotShow', doNotShow.value);
  };
  </script>
  
  <style scoped>
  .do-not-show-list {
    max-width: 400px;
    margin: 0 auto;
    padding: 1em;
    background-color: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    margin-bottom: 0.5em;
  }
  
  .list {
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid #ddd;
    padding: 0.5em;
    border-radius: 4px;
    margin-bottom: 1em;
  }
  
  .list-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5em;
  }
  
  .add-item {
    display: flex;
    gap: 0.5em;
  }
  
  input {
    flex: 1;
    padding: 0.5em;
    font-size: 1em;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  button {
    padding: 0.5em;
    background-color: #69988D;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  </style>
  