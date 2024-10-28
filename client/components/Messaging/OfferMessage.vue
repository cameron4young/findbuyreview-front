<template>
  <div v-if="isLoaded" :class="['offer-message', isMine ? 'mine' : '']">
    <div class="message-content">
      <p><b>Company:</b> {{ message.offer.company }}</p>
      <p><b>Product:</b> {{ message.offer.product }}</p>
      <div class="offer-details">
        <p><strong>Offer:</strong> {{ message.content }}</p>
        <p><strong>Duration:</strong> {{ message.offer.duration }} days</p>

        <p v-if="message.offer.response"><strong>Response:</strong> {{ message.offer.response }}</p>
        <p v-if="message.offer.approved"><strong>Status:</strong> Approved</p>
        <p v-else-if="message.offer.associatedPost && !message.offer.approved">
          <strong>Status:</strong> Waiting for Approval
        </p>

        <div v-if="message.offer.associatedPost && isMine && !message.offer.approved" class="approval-section">
          <p><strong>Associated Post:</strong> 
            <a :href="`/post/${message.offer.associatedPost}`" target="_blank">
              View Post
            </a>
          </p>
          <button @click="approveOffer">Approve</button>
          <button @click="denyOffer">Deny</button>
        </div>
      </div>

      <div v-if="isRecipient && !responseFormVisible && !message.offer.associatedPost">
        <p>Respond with a review for this product before this offer expires!</p>
        <button @click="openResponseForm">
          Respond to Offer
        </button>
      </div>

      <div v-if="responseFormVisible" class="response-form">
        <label for="post-url">Enter Full Post URL:</label>
        <input id="post-url" type="text" v-model="postUrl" placeholder="https://example.com/post/:postId" />
        <button @click="submitResponse">Submit Response</button>
        <button @click="closeResponseForm">Cancel</button>
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
const isRecipient = ref(false);
const isLoaded = ref(false); // Added to control initial rendering
const responseFormVisible = ref(false);
const postUrl = ref(''); // Store the full post URL

// Format message creation time
const formattedTime = computed(() => {
  return new Date(props.message.dateCreated).toLocaleTimeString();
});

// Determine if the message belongs to the current user
const checkIfMine = async () => {
  try {
    const userResponse = await fetchy('/api/session', 'GET');
    const currentUserId = userResponse._id;

    isMine.value = props.message.sender === currentUserId;
    isRecipient.value = props.message.recipient === currentUserId;

    // Fetch conversation ID if needed
    if (!props.message.conversationId && isRecipient.value) {
      await getConversationId(props.message.sender);
    }

    isLoaded.value = true; // Mark as loaded once all checks are complete
  } catch (error) {
    console.error('Error checking if message is mine:', error);
    isLoaded.value = true; // Mark as loaded even if there's an error
  }
};

// Function to get the conversation ID with a specific user (sender)
const getConversationId = async (recipientId: string) => {
  try {
    const response = await fetchy(`/api/conversations/with/${recipientId}`, 'GET');
    const conversation = response.conversation;
    
    if (conversation && conversation._id) {
      props.message.conversationId = conversation._id;
    }
  } catch (error) {
    console.error('Error fetching conversation ID:', error);
  }
};

// Functions to manage response form and actions
const openResponseForm = () => {
  responseFormVisible.value = true;
};

const closeResponseForm = () => {
  responseFormVisible.value = false;
  postUrl.value = '';
};

const extractPostIdFromUrl = (url: string): string | null => {
  try {
    const parts = new URL(url).pathname.split('/');
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
};

const submitResponse = async () => {
  const postId = extractPostIdFromUrl(postUrl.value);

  if (!postId || !props.message.conversationId) {
    console.error("Invalid URL or conversation ID");
    return;
  }

  try {
    const response = await fetchy(
      `/api/conversations/${props.message.conversationId}/messages/${props.message._id}/response`,
      'POST',
      { body: { postId } }
    );
    console.log('Response submitted:', response.msg);
    props.message.offer.associatedPost = postId;
    closeResponseForm();
  } catch (error) {
    console.error('Error submitting response:', error);
  }
};

const approveOffer = async () => {
  try {
    await getConversationId(props.message.recipient);
    const response = await fetchy(
      `/api/conversations/${props.message.conversationId}/messages/${props.message._id}/approve`,
      'POST'
    );
    console.log('Offer approved:', response.msg);
    props.message.offer.approved = true; 
  } catch (error) {
    console.error('Error approving offer:', error);
  }
};

const denyOffer = async () => {
  try {
    await getConversationId(props.message.recipient);
    const response = await fetchy(
      `/api/conversations/${props.message.conversationId}/offers/${props.message._id}/deny`,
      'POST'
    );
    console.log('Offer denied:', response.msg);
    props.message.offer.associatedPost = null;
  } catch (error) {
    console.error('Error denying offer:', error);
  }
};

onMounted(checkIfMine);
</script>

<style scoped>
.offer-message {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  margin: 0.5em;
  transition: left 0.3s ease; /* Smooth transition */
}

.offer-message.mine {
  position: relative;
  left: 22vw;
  align-self: flex-end;
  text-align: right;
}

.offer-message.mine > .message-content{
  background-color: #cbdde3;
}

.offer-message .message-content {
  background-color: #d2d1d1; 
  padding: 1em;
  border-radius: 8px;
  border: 1px solid #ccc; 
}

.offer-message .message-meta {
  font-size: 0.8em;
  color: #888;
  margin-top: 0.5em;
}

.response-form {
  margin-top: 0.5em;
}

.approval-section {
  margin-top: 0.5em;
}
</style>
