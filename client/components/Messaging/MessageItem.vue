<template>
  <div class="message-item">
    <component :is="messageComponent" :message="message" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import OfferMessage from './OfferMessage.vue';
import PostMessage from './PostMessage.vue';
import TextMessage from './TextMessage.vue';

const props = defineProps<{ message: any }>();

const messageComponent = computed(() => {
  if (props.message.offer) {
    return OfferMessage;
  } else if (props.message.associatedPost) {
    return PostMessage;
  } else {
    return TextMessage;
  }
});
</script>

<style scoped>
.message-item {
  margin: 0.5em 0;
}
</style>
