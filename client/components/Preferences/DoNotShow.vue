<template>
  <div class="do-not-show-list">
    <h2>Do Not Show</h2>
    <div class="add-item">
      <input
        type="text"
        v-model="newItem"
        placeholder="Add a category, company or post ID..."
      />
      <button @click="addItem">Add</button>
    </div>
    <br>
    <div class="list" v-if="localDoNotShow.length > 0">
      <div v-for="(item, index) in localDoNotShow" :key="index" class="list-item">
        <span>{{ item }}</span>
        <button @click="removeItem(index)">Remove</button>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref, watch } from 'vue';

// Accept 'value' as a prop from the parent to set the initial list
const props = defineProps<{ value: string[] }>();

const localDoNotShow = ref<string[]>([...props.value]);
const newItem = ref<string>('');
const emit = defineEmits(['update:doNotShow']);

// Watch for changes in the prop and update the local state accordingly
watch(
  () => props.value,
  (newValue) => {
    localDoNotShow.value = [...newValue];
  }
);

// Function to add a new item
const addItem = () => {
  const trimmedItem = newItem.value.trim();
  if (trimmedItem && !localDoNotShow.value.includes(trimmedItem)) {
    localDoNotShow.value.push(trimmedItem);
    newItem.value = ''; // Clear the input field after adding
    emit('update:doNotShow', localDoNotShow.value);
  }
};

// Function to remove an item
const removeItem = (index: number) => {
  localDoNotShow.value.splice(index, 1);
  emit('update:doNotShow', localDoNotShow.value);
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
  background-color: #94ac5a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
