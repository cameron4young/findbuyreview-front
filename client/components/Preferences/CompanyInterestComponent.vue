<template>
  <div class="favorite-companies">
    <h2>Select Your Favorite Companies</h2>
    <form @submit.prevent>
      <!-- Existing companies with checkboxes -->
      <div v-for="company in companies" :key="company" class="company-item">
        <label>
          <input
            type="checkbox"
            :value="company"
            v-model="selectedCompanies"
          />
          {{ company }}
        </label>
      </div>

      <!-- Input to add a custom company -->
      <div class="custom-company">
        <input
          type="text"
          v-model="newCompany"
          placeholder="Add your own company..."
        />
        <button type="button" @click="addCustomCompany" class="btn-add">Add</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref, watch } from 'vue';

// Define props to accept companies and selected companies from the parent
const props = defineProps<{
  initialCompanies: string[];
  initialSelectedCompanies: string[];
}>();

const companies = ref<string[]>([...props.initialCompanies]);
const selectedCompanies = ref<string[]>([...props.initialSelectedCompanies]);
const newCompany = ref<string>('');

// Emit an event when selected companies change
const emit = defineEmits(['update:selectedCompanies']);

// Watch for changes in selectedCompanies and emit the update
watch(selectedCompanies, (newValue) => {
  emit('update:selectedCompanies', newValue);
});

// Function to add a custom company
const addCustomCompany = () => {
  const trimmedCompany = newCompany.value.trim();
  if (trimmedCompany && !companies.value.includes(trimmedCompany)) {
    companies.value.push(trimmedCompany); // Add to available companies
  }
  if (trimmedCompany && !selectedCompanies.value.includes(trimmedCompany)) {
    selectedCompanies.value.push(trimmedCompany); // Add to selected companies
  }
  newCompany.value = ''; // Clear the input field after adding
};
</script>

<style scoped>
.favorite-companies {
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

.company-item {
  margin: 0.5em 0;
}

.custom-company {
  display: flex;
  gap: 0.5em;
  margin: 1em 0;
}

.custom-company input {
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
