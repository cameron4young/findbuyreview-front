<template>
  <div class="conversation-page">
    <ConversationSelector @conversationSelected="onConversationSelected" />
    <div class="conversation-container">
      <ConversationList
        :conversations="conversations"
        @conversationSelected="onConversationSelected"
      />
      <Conversation :conversationId="selectedConversationId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Conversation from "@/components/Messaging/Conversation.vue";
import ConversationList from '@/components/Messaging/ConversationList.vue';
import ConversationSelector from '@/components/Messaging/ConversationSelector.vue';
import { fetchy } from '@/utils/fetchy';
import { onMounted, ref } from 'vue';

const conversations = ref([]);
const selectedConversationId = ref<string | null>(null);

const onConversationSelected = (conversationId: string) => {
  selectedConversationId.value = conversationId;
};

const loadConversations = async () => {
  try {
    const response = await fetchy('/api/conversations', 'GET');
    conversations.value = response.conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
  }
};

onMounted(loadConversations);
</script>

<style scoped>
/* Disable page scrolling */
html, body {
  overflow: hidden;
}

.conversation-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.conversation-container {
  display: flex;
  flex-grow: 1;
  overflow: hidden; /* Prevent scrolling within the container */
}
</style>
