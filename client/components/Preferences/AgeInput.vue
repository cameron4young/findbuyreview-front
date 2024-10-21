<template>
  <div class="age-input">
    <label for="age">Enter your age:</label>
    <input
      type="number"
      id="age"
      v-model="age"
      min="1"
    />
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref, watch } from 'vue';

// Define props
const props = defineProps<{ value: number | null }>();

const age = ref<number | null>(props.value);
const emit = defineEmits(['update:age']);

// Watch the age value and emit changes to the parent
watch(age, (newValue) => {
  emit('update:age', newValue);
});

watch(() => props.value, (newValue) => {
  age.value = newValue;
});
</script>

<style scoped>
.age-input {
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
