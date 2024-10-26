<template>
  <div :class="['post-message', isMine ? 'mine' : '']">
    <div class="message-content">
      <p>{{ message.content }}</p>
      <div class="post-details">
        <!-- Display associated post information -->
        <p><strong>Associated Post ID:</strong> {{ message.associatedPost }}</p>
      </div>
    </div>
    <div class="message-meta">
      <span class="message-time">{{ formattedTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { computed, onMounted, ref } from 'vue';

const props = defineProps<{ message: any }>();

const isMine = ref(false);
const formattedTime = computed(() => {
  return new Date(props.message.dateCreated).toLocaleTimeString();
});

const checkIfMine = async () => {
  try {
    const userResponse = await fetchy('/api/auth/user', 'GET');
    const currentUserData = await userResponse.json();
    const currentUserId = currentUserData.user._id;

    isMine.value = props.message.sender === currentUserId;
  } catch (error) {
    console.error('Error checking if message is mine:', error);
  }
};

onMounted(checkIfMine);
</script>

<style scoped>
.post-message {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  margin: 0.5em;
}

.post-message.mine {
  align-self: flex-end;
  position: relative;
  left: 30vw;
  background-color: #dcf8c6;
  text-align: right;
}

.post-message .message-content {
  background-color: #fff;
  padding: 0.5em;
  border-radius: 5px;
}

.post-message .message-meta {
  text-align: right;
  font-size: 0.8em;
  color: #888;
}
</style>
