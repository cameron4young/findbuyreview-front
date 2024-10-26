<template>
  <div class="date-separator">
    <span>{{ date }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ date: string }>();
</script>

<style scoped>
.date-separator {
  text-align: center;
  margin: 1em 0;
  font-weight: bold;
}
</style>
