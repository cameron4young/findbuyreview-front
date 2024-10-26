<template>
  <div class="conversation-selector">
    <input
      type="text"
      v-model="recipientUsername"
      placeholder="Enter username to start conversation"
    />
    <button @click="startConversation">Start Conversation</button>
  </div>
</template>

<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { defineEmits, ref } from 'vue';

const recipientUsername = ref('');
const emit = defineEmits(['conversationSelected']);

const startConversation = async () => {
  if (!recipientUsername.value.trim()) return;

  try {
    const userResponse = await fetchy(`/api/users/${recipientUsername.value}`, 'GET');
    const userData = userResponse.user;

    if (!userData) {
      console.error('User not found');
      return;
    }

    const recipientId = userData._id;

    const conversationResponse = await fetchy('/api/conversations', 'POST', {
      body: { recipientId },
    });
    emit('conversationSelected', conversationResponse.conversationId);
  } catch (error) {
    console.error('Error starting conversation:', error);
  }
};
</script>

<style scoped>
.conversation-selector {
  padding: 1em;
}
</style>
