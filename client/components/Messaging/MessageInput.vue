<template>
  <div class="message-input">
    <input
      type="text"
      v-model="content"
      @keydown.enter="onSend"
      placeholder="Type a message"
    />
    
    <!-- Offer input fields -->
    <div v-if="isOffer">
      <input type="text" v-model="offerCompany" placeholder="Company" />
      <input type="text" v-model="offerProduct" placeholder="Product" />
      <input type="number" v-model="offerDuration" placeholder="Duration (days)" />
    </div>

    <button @click="toggleOffer">{{ isOffer ? "Cancel Offer" : "Add Offer" }}</button>
    <button @click="onSend">Send</button>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, ref } from 'vue';

const emit = defineEmits(['send', 'sendOffer']);
const content = ref('');
const isOffer = ref(false);

// Individual offer fields
const offerCompany = ref('');
const offerProduct = ref('');
const offerDuration = ref(0);

const toggleOffer = () => {
  isOffer.value = !isOffer.value;
  if (!isOffer.value) {
    offerCompany.value = '';
    offerProduct.value = '';
    offerDuration.value = 0;
  }
};

// Emit a send event for regular messages or sendOffer event for offer messages
const onSend = () => {
  if (content.value.trim()) {
    if (isOffer.value && offerCompany.value && offerProduct.value && offerDuration.value > 0) {
      console.log('Emitting sendOffer with:', content.value, offerCompany.value, offerProduct.value, offerDuration.value);
      emit('sendOffer', content.value, offerCompany.value, offerProduct.value, offerDuration.value);
    } else {
      console.log('Emitting send with:', content.value);
      emit('send', content.value);
    }
    content.value = '';
    if (isOffer.value) {
      offerCompany.value = '';
      offerProduct.value = '';
      offerDuration.value = 0;
    }
  }
};
</script>

<style scoped>
.message-input {
  display: flex;
  flex-direction: column;
  padding: 0.5em;
  border-top: 1px solid #ccc;
}
.message-input input {
  margin: 0.25em 0;
  padding: 0.5em;
  border: 1px solid #ccc;
}
</style>
