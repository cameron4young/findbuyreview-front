<template>
  <div class="conversation-content" v-if="conversationId">
    <div ref="messageListContainer" class="message-list-container">
      <MessageList :conversationId="conversationId" :reload="reloadMessages" />
    </div>
    <MessageInput @send="sendMessage" @sendOffer="sendOfferMessage" />
  </div>
  <div v-else class="no-conversation">
    <p>Select a conversation to start chatting!</p>
  </div>
</template>

<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { nextTick, onMounted, ref, watch } from 'vue';
import MessageInput from './MessageInput.vue';
import MessageList from './MessageList.vue';

const props = defineProps<{ conversationId: string | null }>();
const reloadMessages = ref(false);
const messageListContainer = ref<HTMLElement | null>(null);

type SendOfferMessageBody = {
  conversationId: string;
  recipientId: string;
  content: string;
  company: string;
  product: string;
  duration: number;
  response?: string;
};

const recipientId = ref<string | null>(null);

// Scroll to bottom function
const scrollToBottom = () => {
  if (messageListContainer.value) {
    messageListContainer.value.scrollTop = messageListContainer.value.scrollHeight;
  }
};

const getRecipientId = async () => {
  if (!props.conversationId) return;

  try {
    const response = await fetchy(`/api/conversations/${props.conversationId}`, 'GET');
    const conversation = response.conversation;

    const currentUserResponse = await fetchy('/api/session', 'GET');
    const currentUserId = currentUserResponse._id;

    recipientId.value = conversation.participants.find((id: string) => id !== currentUserId);
  } catch (error) {
    console.error('Error fetching recipient ID:', error);
  }
};

const sendMessage = async (content: string) => {
  if (!props.conversationId || !content.trim() || !recipientId.value) return;

  try {
    await fetchy(`/api/conversations/messages`, 'POST', {
      body: {
        conversationId: props.conversationId,
        recipientId: recipientId.value,
        content,
      },
    });
    reloadMessages.value = !reloadMessages.value;
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const sendOfferMessage = async (content: string, company: string, product: string, duration: number) => {
  if (!props.conversationId || !content.trim() || !recipientId.value || !company || !product || duration <= 0) return;

  const body: SendOfferMessageBody = {
    conversationId: props.conversationId,
    recipientId: recipientId.value,
    content,
    company,
    product,
    duration,
  };

  try {
    const response = await fetchy(`/api/conversations/offers`, 'POST', { body });
    reloadMessages.value = !reloadMessages.value;
  } catch (error) {
    console.error('Error sending offer message:', error);
  }
};

onMounted(() => {
  getRecipientId();
  scrollToBottom();
});

watch(
  () => reloadMessages.value,
  async () => {
    await nextTick();
    scrollToBottom();
  }
);

watch(
  () => props.conversationId,
  getRecipientId
);
</script>

<style scoped>
.conversation-content {
  display: flex;
  flex-direction: column;
  width: 75vw;
  height: 80vh;
}

.message-list-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1em;
}

.message-input {
  position: sticky;
  bottom: 0;
  width: 100%;
  background-color: white;
  padding: 1em;
  border-top: 1px solid #ccc;
}
</style>
