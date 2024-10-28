<template>
  <div class="conversation-content" v-if="conversationId">
    <div v-if="recipientName" class="recipient-name">
      <h2>Chat with {{ recipientName }}</h2>
    </div>
    <div ref="messageListContainer" class="message-list-container">
      <MessageList :conversationId="conversationId" :reload="reloadMessages" />
      <!-- Use a marker at the end of the message list to scroll to -->
      <div ref="scrollAnchor"></div>
    </div>
    <MessageInput @send="sendMessage" @sendOffer="sendOfferMessage" />
  </div>
  <div v-else class="no-conversation">
    <p class="loading-text">Select a conversation to start chatting!</p>
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
const scrollAnchor = ref<HTMLElement | null>(null);

const recipientId = ref<string | null>(null);
const recipientName = ref<string | null>(null); // New reactive variable for recipient's name

type SendOfferMessageBody = {
  conversationId: string;
  recipientId: string;
  content: string;
  company: string;
  product: string;
  duration: number;
  response?: string;
};

// Scroll to the bottom using the scrollAnchor
const scrollToBottom = async () => {
  await nextTick();
  if (scrollAnchor.value) {
    scrollAnchor.value.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
};

// Fetch recipient ID and name
const getRecipientId = async () => {
  if (!props.conversationId) return;

  try {
    const response = await fetchy(`/api/conversations/${props.conversationId}`, 'GET');
    const conversation = response.conversation;

    const currentUserResponse = await fetchy('/api/session', 'GET');
    const currentUserId = currentUserResponse._id;

    recipientId.value = conversation.participants.find((id: string) => id !== currentUserId);
    if (recipientId.value) {
      await getRecipientName(recipientId.value); 
    }
  } catch (error) {
    console.error('Error fetching recipient ID:', error);
  }
};

// Fetch recipient name by ID
const getRecipientName = async (id: string) => {
  try {
    const userResponse = await fetchy(`/api/users/id/${id}`, 'GET');
    console.log(userResponse);
    recipientName.value = userResponse.username; // Assume response has a name field

  } catch (error) {
    console.error('Error fetching recipient name:', error);
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
    await scrollToBottom();
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
    await scrollToBottom();
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
    await scrollToBottom();
  }
);

watch(
  () => props.conversationId,
  async () => {
    getRecipientId();
    await scrollToBottom();
  }
);
</script>

<style scoped>
.conversation-content {
  display: flex;
  flex-direction: column;
  width: 80vw;
  height: 80vh;
}

.recipient-name {
  padding: 1em;
  text-align: center;
  font-weight: bold;
  background-color: #d9e2ee;
  border-bottom: 1px solid #ddd;
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
