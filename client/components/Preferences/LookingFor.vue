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
import { defineEmits, defineProps, ref, watch } from 'vue';

// Define props
const props = defineProps<{ value: string }>();

const status = ref<string>(props.value);
const emit = defineEmits(['update:lookingFor']);

watch(status, (newValue) => {
  emit('update:lookingFor', newValue);
});

watch(() => props.value, (newValue) => {
  status.value = newValue;
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
