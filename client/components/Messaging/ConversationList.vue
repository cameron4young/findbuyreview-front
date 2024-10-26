<template>
  <div class="conversation-list">
    <ConversationItem
      v-for="conversation in conversations"
      :key="conversation._id"
      :conversation="conversation"
      @click="onConversationClicked(conversation._id)"
    />
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';
import ConversationItem from './ConversationItem.vue';

const props = defineProps<{ conversations: any[] }>();
const emit = defineEmits(['conversationSelected']);

const onConversationClicked = (conversationId: string) => {
  emit('conversationSelected', conversationId);
};
</script>

<style scoped>
.conversation-list {
  width: 300px;
  height: 80vh;
  border-right: 1px solid #ccc;
  overflow-y: auto;
}
</style>
