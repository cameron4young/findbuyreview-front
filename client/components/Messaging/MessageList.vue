<template>
  <div class="message-list">
    <div v-for="(messageGroup, index) in groupedMessages" :key="index">
      <DateSeparator :date="messageGroup.date" />
      <MessageItem
        v-for="message in messageGroup.messages"
        :key="message._id"
        :message="message"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { onMounted, ref, watch } from 'vue';
import DateSeparator from './DateSeparator.vue';
import MessageItem from './MessageItem.vue';

const props = defineProps<{ conversationId: string; reload: boolean }>();

interface Message {
  _id: string;
  content: string;
  dateCreated: string;
}

interface MessageGroup {
  date: string;
  messages: Message[];
}

const messages = ref<Message[]>([]);
const groupedMessages = ref<MessageGroup[]>([]);

const loadMessages = async () => {
  if (!props.conversationId) return;

  try {
    const response = await fetchy(`/api/conversations/${props.conversationId}/messages`, 'GET');
    messages.value = response.messages;
    groupMessagesByDate();
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

const groupMessagesByDate = () => {
  const groups: Record<string, Message[]> = {};

  messages.value.forEach((message) => {
    const date = new Date(message.dateCreated).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });

  groupedMessages.value = Object.keys(groups).map((date) => ({
    date,
    messages: groups[date],
  }));
};

onMounted(loadMessages);

watch(
  () => [props.conversationId, props.reload],
  loadMessages
);
</script>

<style scoped>
.message-list {
  flex-grow: 1;
  overflow-y: auto;
}
</style>
