<template>
  <div v-if="isLoaded" :class="['text-message', isMine ? 'mine' : '']">
    <div class="message-content">
      <p>{{ message.content }}</p>
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
const isLoaded = ref(false);
const formattedTime = computed(() => {
  return new Date(props.message.dateCreated).toLocaleTimeString();
});

const checkIfMine = async () => {
  try {
    const userResponse = await fetchy('/api/session', 'GET');
    const currentUserId = userResponse._id;

    isMine.value = props.message.sender === currentUserId;
    isLoaded.value = true; // Mark as loaded once check is done
  } catch (error) {
    console.error('Error checking if message is mine:', error);
    isLoaded.value = true; // Show message even if error occurs
  }
};

onMounted(checkIfMine);
</script>

<style scoped>
.text-message {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  margin: 0.5em;
  transition: left 0.3s ease; /* Smooth transition */
}

.text-message.mine > .message-content {
  background-color: #E3F2f7;
}

.text-message.mine {
  align-self: flex-end;
  position: relative;
  left: 22vw;
  text-align: right;
}

.text-message .message-content {
  padding: 0.5em;
  border-radius: 8px;
  background-color: #f1f1f1;
  border: 1px solid #ddd; 
}

.text-message .message-meta {
  font-size: 0.8em;
  color: #888;
}
</style>
