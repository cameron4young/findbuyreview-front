<!-- NewConversationForm.vue -->
<template>
    <div class="new-conversation-form">
      <h2>Start a New Conversation</h2>
      <form @submit.prevent="startConversation">
        <label for="recipient">Recipient:</label>
        <input v-model="recipientId" id="recipient" type="text" placeholder="Enter recipient ID" required />
  
        <label for="initialMessage">Initial Message (optional):</label>
        <textarea v-model="initialMessage" id="initialMessage" placeholder="Say something..."></textarea>
  
        <button type="submit">Start Conversation</button>
      </form>
    </div>
  </template>
  
  <script setup lang="ts">
  import { fetchy } from "@/utils/fetchy";
import { ref } from "vue";
  
  // Form fields
  const recipientId = ref("");
  const initialMessage = ref("");
  
  // Emit event after creating a new conversation
  const emit = defineEmits(["conversation-created"]);
  
  // Function to start a new conversation
  const startConversation = async () => {
    try {
      const response = await fetchy("/api/conversations", "POST", {
        body: {
          recipientId: recipientId.value,
        },
      });
  
      // Optionally send the initial message if provided
      if (response.conversationId && initialMessage.value.trim()) {
        await fetchy(`/api/conversations/${response.conversationId}/messages`, "POST", {
          body: { content: initialMessage.value },
        });
      }
  
      // Emit an event to inform the parent that a conversation was created
      emit("conversation-created", response.conversationId);
      recipientId.value = "";
      initialMessage.value = "";
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };
  </script>
  
  <style scoped>
  .new-conversation-form {
    display: flex;
    flex-direction: column;
    max-width: 400px;
    margin: 0 auto;
    padding: 1em;
    background-color: #f7f7f7;
    border-radius: 8px;
  }
  
  .new-conversation-form h2 {
    text-align: center;
  }
  
  .new-conversation-form label {
    margin-top: 1em;
  }
  
  .new-conversation-form input,
  .new-conversation-form textarea {
    width: 100%;
    padding: 0.5em;
    margin-top: 0.5em;
    border-radius: 4px;
  }
  
  .new-conversation-form button {
    margin-top: 1em;
    padding: 0.5em;
    background-color: #69988d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  </style>
  