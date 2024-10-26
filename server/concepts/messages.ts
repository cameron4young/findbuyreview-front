import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface Offer {
  company: string;
  product: string;
  duration: number;
  createdAt: Date;
  response?: string;
  associatedPost?: ObjectId;
  approved?: boolean;
}

export interface MessageDoc extends BaseDoc {
  _id: ObjectId;
  content: string;
  sender: ObjectId;
  recipient: ObjectId;
  offer?: Offer;
  associatedPost?: ObjectId;
}

export interface ConversationDoc extends BaseDoc {
  _id: ObjectId;
  participants: ObjectId[]; // Users involved in the conversation
  messages: MessageDoc[]; // Messages in the conversation
}

export default class MessagesConcept {
  public readonly conversations: DocCollection<ConversationDoc>;

  constructor(collectionName: string) {
    this.conversations = new DocCollection<ConversationDoc>(collectionName);
  }

  // Create a conversation with specified participants
  async createConversation(participants: ObjectId[]): Promise<{ msg: string; conversationId: ObjectId }> {
    // Check if a conversation already exists with these participants
    const existingConversation = await this.getConversationBetweenUsers(participants);

    if (existingConversation) {
      return { msg: "Conversation already exists!", conversationId: existingConversation._id };
    }

    // Create a new conversation if none exists
    const _id = await this.conversations.createOne({
      participants,
      messages: [],
    });

    return { msg: "New conversation created!", conversationId: _id };
  }

  // Send a regular message and add it to the conversation
  async sendMessage(conversationId: ObjectId, content: string, sender: ObjectId, recipient: ObjectId): Promise<{ msg: string; messageId: ObjectId }> {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Verify that sender and recipient are participants
    if (!conversation.participants.some((id) => id.equals(sender))) {
      throw new Error("Sender is not a participant in this conversation.");
    }
    if (!conversation.participants.some((id) => id.equals(recipient))) {
      throw new Error("Recipient is not a participant in this conversation.");
    }

    const messageId = new ObjectId();
    const now = new Date();

    const message: MessageDoc = {
      _id: messageId,
      dateCreated: now,
      dateUpdated: now,
      content,
      sender,
      recipient,
    };

    // Add the message to the conversation
    conversation.messages.push(message);
    await this.conversations.partialUpdateOne({ _id: conversationId }, { messages: conversation.messages });

    return { msg: "Message sent!", messageId };
  }

  // Add response to offer and link associated post
  async addResponseToOffer(conversationId: ObjectId, messageId: ObjectId, postId: ObjectId, response: string, userId: ObjectId): Promise<{ msg: string }> {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Verify user is a participant
    if (!conversation.participants.some((id) => id.equals(userId))) {
      throw new Error("Access denied: You are not a participant in this conversation.");
    }

    const message = conversation.messages.find((m) => m._id.equals(messageId));
    if (!message?.offer) {
      throw new Error("No offer associated with this message.");
    }

    // Verify user is the recipient of the offer
    if (!message.recipient.equals(userId)) {
      throw new Error("Only the recipient can respond to the offer.");
    }

    // Add response and link associated post
    message.offer.response = response;
    message.offer.associatedPost = postId;

    await this.conversations.partialUpdateOne({ _id: conversationId }, { messages: conversation.messages });
    console.log(message.offer);

    return { msg: "Response added and post linked to offer." };
  }

  // Send an offer message and add it to the conversation
  async sendOfferMessage(
    conversationId: ObjectId,
    content: string,
    sender: ObjectId,
    recipient: ObjectId,
    associatedPost: ObjectId,
    company: string,
    product: string,
    duration: number,
  ): Promise<{ msg: string; messageId: ObjectId }> {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Verify that sender and recipient are participants
    if (!conversation.participants.some((id) => id.equals(sender))) {
      throw new Error("Sender is not a participant in this conversation.");
    }
    if (!conversation.participants.some((id) => id.equals(recipient))) {
      throw new Error("Recipient is not a participant in this conversation.");
    }

    const messageId = new ObjectId();
    const now = new Date();

    // Construct the message with individual offer details
    const message: MessageDoc = {
      _id: messageId,
      dateCreated: now,
      dateUpdated: now,
      content,
      sender,
      recipient,
      offer: {
        company,
        product,
        duration,
        createdAt: now,
        approved: false,
      },
      associatedPost,
    };

    // Add the message to the conversation
    conversation.messages.push(message);
    await this.conversations.partialUpdateOne({ _id: conversationId }, { messages: conversation.messages });

    return { msg: "Offer message sent!", messageId };
  }

  // Approve the offer by the original sender
  async approveOffer(conversationId: ObjectId, messageId: ObjectId, senderId: ObjectId): Promise<{ msg: string }> {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Verify sender is a participant
    if (!conversation.participants.some((id) => id.equals(senderId))) {
      throw new Error("Access denied: You are not a participant in this conversation.");
    }

    const message = conversation.messages.find((m) => m._id.equals(messageId));
    if (!message?.offer) {
      throw new Error("No offer associated with this message.");
    }

    if (!message.sender.equals(senderId)) {
      throw new Error("Only the original sender can approve the offer.");
    }

    if (message.offer.associatedPost) {
      message.offer.approved = true;
      await this.conversations.partialUpdateOne({ _id: conversationId }, { messages: conversation.messages });
      return { msg: "Offer approved!" };
    } else {
      return { msg: "Offer cannot be approved, no associated post found." };
    }
  }

  // Deny the offer by the original sender
  async denyOffer(conversationId: ObjectId, messageId: ObjectId, senderId: ObjectId): Promise<{ msg: string }> {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Verify sender is a participant
    if (!conversation.participants.some((id) => id.equals(senderId))) {
      throw new Error("Access denied: You are not a participant in this conversation.");
    }

    const message = conversation.messages.find((m) => m._id.equals(messageId));
    if (!message?.offer) {
      throw new Error("No offer associated with this message.");
    }

    // Verify only the original sender can deny the offer
    if (!message.sender.equals(senderId)) {
      throw new Error("Only the original sender can deny the offer.");
    }

    // Mark the offer as denied
    message.offer.associatedPost = undefined; // Clear the associated post
    message.offer.approved = false; // Ensure offer is not marked as approved
    message.offer.response = "Offer denied by the sender"; // Optional, add response reason

    await this.conversations.partialUpdateOne({ _id: conversationId }, { messages: conversation.messages });
    return { msg: "Offer denied!" };
  }

  // Get all messages in a conversation
  async getMessages(conversationId: ObjectId, userId: ObjectId): Promise<MessageDoc[]> {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Verify user is a participant
    if (!conversation.participants.some((id) => id.equals(userId))) {
      throw new Error("Access denied: You are not a participant in this conversation.");
    }

    return conversation.messages;
  }

  // Delete a message from a conversation
  async deleteMessage(conversationId: ObjectId, messageId: ObjectId, userId: ObjectId): Promise<{ msg: string }> {
    const conversation = await this.conversations.readOne({ _id: conversationId });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Verify user is a participant
    if (!conversation.participants.some((id) => id.equals(userId))) {
      throw new Error("Access denied: You are not a participant in this conversation.");
    }

    const messageIndex = conversation.messages.findIndex((m) => m._id.equals(messageId));
    if (messageIndex === -1) {
      throw new Error("Message not found.");
    }

    const message = conversation.messages[messageIndex];

    // Verify user is the sender
    if (!message.sender.equals(userId)) {
      throw new Error("Only the sender can delete this message.");
    }

    // Remove the message
    conversation.messages.splice(messageIndex, 1);
    await this.conversations.partialUpdateOne({ _id: conversationId }, { messages: conversation.messages });

    return { msg: "Message deleted!" };
  }

  // Get a conversation involving specific users
  async getConversationBetweenUsers(userIds: ObjectId[]): Promise<ConversationDoc | null> {
    const conversation = await this.conversations.readOne({
      participants: { $all: userIds },
    });
    return conversation;
  }

  // Get all conversations for a specific user
  async getConversationsForUser(userId: ObjectId): Promise<ConversationDoc[]> {
    // Use $in to check if userId is included in the participants array
    const conversations = await this.conversations.readMany({
      participants: { $in: [userId] },
    });
    return conversations;
  }

  // Helper function to check if the offer is expired
  isOfferExpired(offer: Offer): boolean {
    const now = new Date();
    const expirationDate = new Date(offer.createdAt);
    expirationDate.setDate(expirationDate.getDate() + offer.duration);
    return now > expirationDate;
  }
}
