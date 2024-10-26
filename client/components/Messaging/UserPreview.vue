<template>
  <div class="user-preview">
    <img :src="user.avatarUrl" alt="User Avatar" />
    <span>{{ user.name }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ user: any }>();
</script>

<style scoped>
.user-preview {
  display: flex;
  align-items: center;
}

.user-preview img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 0.5em;
}
</style>
