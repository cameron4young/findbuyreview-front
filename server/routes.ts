import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Friending, Labeling, Messages, Posting, Preferences, Saving, Sessioning } from "./app";
import { PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

import { z } from "zod";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/id/:userId")
  async getUserById(userId: string) {
    const userObjectId = new ObjectId(userId);
    return await Authing.getUserById(userObjectId);
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  @Router.validate(z.object({ author: z.string().optional() }))
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      posts = await Posting.getByAuthor(id);
    } else {
      posts = await Posting.getPosts();
    }
    return Responses.posts(posts);
  }

  @Router.get("/posts/:id")
  async getPostById(id: string) {
    const postId = new ObjectId(id);
    const post = await Posting.getPostById(postId);

    if (!post) {
      return 404; // Return 404 if no post is found with this ID
    }

    return Responses.posts([post]);
  }

  @Router.post("/posts")
  async createPost(session: SessionDoc, content: string, video: string, productURL: string, rating: number, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const created = await Posting.create(user, content, video, productURL, rating, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, content?: string, rating?: number, productURL?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid, content, rating, productURL, options);
  }

  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return Posting.delete(oid);
  }

  @Router.get("/posts/search/:searchQuery")
  async searchPosts(session: SessionDoc, searchQuery: string) {
    try {
      const schema = z.string().nonempty("Query is required.");
      const validatedQuery = schema.parse(searchQuery);

      // Search for the original query
      const namePosts = await Posting.searchPosts(validatedQuery);

      // Search for posts by label (original case and capitalized version)
      const labelVariants = [searchQuery, searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1).toLowerCase()];

      let postIds = [];
      for (const label of labelVariants) {
        const ids = await Labeling.getPostsByLabel(label);
        postIds.push(...ids);
      }

      // Remove duplicates by creating a Set
      postIds = [...new Set(postIds)];

      const categoryPosts = await Posting.getPostsByIds(postIds);

      return { posts: [...namePosts, ...categoryPosts] };
    } catch (error) {
      console.error("Error in searchPosts:", error);
      if (error instanceof z.ZodError) {
        return { status: 400, msg: "Invalid query: " + error.errors[0].message };
      }
      return { status: 500, msg: "Internal Server Error" };
    }
  }

  @Router.get("/friends")
  async getFriends(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.idsToUsernames(await Friending.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: SessionDoc, friend: string) {
    const user = Sessioning.getUser(session);
    const friendOid = (await Authing.getUserByUsername(friend))._id;
    return await Friending.removeFriend(user, friendOid);
  }

  @Router.get("/friend/requests")
  async getRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Responses.friendRequests(await Friending.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.sendRequest(user, toOid);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.removeRequest(user, toOid);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.acceptRequest(fromOid, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.rejectRequest(fromOid, user);
  }

  @Router.post("/collection")
  async createCollection(session: SessionDoc, collectionName: string) {
    const user = Sessioning.getUser(session);
    const saved = await Saving.createCollection(user, collectionName);
    return { collection: saved.collection };
  }

  @Router.delete("/collection")
  async deleteCollection(session: SessionDoc, collectionName: string) {
    const user = Sessioning.getUser(session);
    const collectionId = await Saving.getCollectionByName(user, collectionName);
    if (collectionId != null) {
      const saved = await Saving.deleteCollection(user, collectionId);
      return { msg: saved.msg };
    }
    return { msg: "Could not find Collection" };
  }

  @Router.get("/collection/user/")
  async getCollectionsByUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const collections = await Saving.getCollectionsByUser(user);
    return { collections };
  }

  @Router.get("/posts/collection/:collectionId")
  async getPostsInCollection(session: SessionDoc, collectionId: string) {
    try {
      const user = Sessioning.getUser(session);
      const collectionObjectId = new ObjectId(collectionId);

      // Fetch the collection
      const collection = await Saving.getPostsInCollection(user, collectionObjectId);
      if (!collection) {
        return { msg: "Collection not found" };
      }

      const posts = await Posting.getPostsByIds(collection);

      return Responses.posts(posts);
    } catch (error) {
      console.error(error);
      return 404;
    }
  }

  @Router.post("/save")
  async savePostToCollection(session: SessionDoc, collectionId: string, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    const cid = new ObjectId(collectionId);
    if (cid != null) {
      const saved = await Saving.savePostToCollection(user, cid, oid);
      return { msg: saved.msg };
    }
    return { msg: "Could not find Collection" };
  }

  @Router.delete("/save/:collectionId/:id")
  async removePostFromCollection(session: SessionDoc, collectionId: string, id: string) {
    try {
      const user = Sessioning.getUser(session);
      const oid = new ObjectId(id);
      const cid = new ObjectId(collectionId);
      if (cid != null) {
        const saved = await Saving.removePostFromCollection(user, cid, oid);
        return { msg: saved.msg };
      }
      return { msg: "Could not find Collection" };
    } catch (error) {
      console.error("Error removing post from collection:", error);
      return { status: 500, msg: "Internal Server Error" };
    }
  }

  @Router.post("/label")
  async addLabelToPost(session: SessionDoc, postId: string, label: string, expiration?: Date) {
    try {
      const oid = new ObjectId(postId);
      const response = await Labeling.addLabelToPost(label, oid, expiration);
      return { msg: response.msg };
    } catch (error) {
      console.error("Error in addLabelToPost:", error);
      return { status: 500, msg: "Internal Server Error" };
    }
  }

  @Router.delete("/label")
  async removeLabelFromPost(session: SessionDoc, postId: string, label: string) {
    const oid = new ObjectId(postId);
    const response = await Labeling.removeLabelFromPost(label, oid);
    return { msg: response.msg };
  }

  @Router.get("/label/:label")
  async getPostsByLabel(session: SessionDoc, label: string) {
    try {
      const user = Sessioning.getUser(session);
      const postIds = await Labeling.getPostsByLabel(label);
      if (!postIds || postIds.length === 0) {
        return { posts: [] };
      }
      const posts = await Posting.getPostsByIds(postIds);
      return Responses.posts(posts);
    } catch (error) {
      return { status: 500 };
    }
  }

  @Router.get("/label/promoted/:label")
  async getPromotedPostsByLabel(session: SessionDoc, label: string) {
    try {
      const labelList = ["promoted", label];
      const postIds = await Labeling.getPostsByLabels(labelList);
      if (!postIds || postIds.length === 0) {
        return { posts: [] };
      }
      const posts = await Posting.getPostsByIds(postIds);
      return Responses.posts(posts);
    } catch (error) {
      console.error("Error in getPromotedPostsByLabel:", error);
      return { status: 500, msg: "Internal Server Error" };
    }
  }

  @Router.post("/preferences")
  async createUserProfile(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const profile = await Preferences.createUserPreferenceDoc(user);
    return { msg: profile };
  }

  // @Router.post("/preferences/interests")
  // async addInterest(session: SessionDoc, interest: string) {
  //   console.log(interest);
  //   const user = Sessioning.getUser(session);
  //   await Preferences.addInterest(user, interest);
  //   return { msg: `Interest ${interest} added for user ${user}` };
  // }

  // @Router.post("/preferences/favorite-companies")
  // async addFavoriteCompany(session: SessionDoc, company: string) {
  //   const user = Sessioning.getUser(session);
  //   await Preferences.addFavoriteCompany(user, company);
  //   return { msg: `Favorite company ${company} added for user ${user}` };
  // }

  @Router.patch("/preferences/interests")
  async updateInterests(session: SessionDoc, newInterests: string[]) {
    const user = Sessioning.getUser(session);
    await Preferences.updateInterests(user, newInterests);
    return { msg: `Interests updated for user ${user}` };
  }

  @Router.patch("/preferences/favorite-companies")
  async updateFavoriteCompanies(session: SessionDoc, newFavoriteCompanies: string[]) {
    const user = Sessioning.getUser(session);
    await Preferences.updateFavoriteCompanies(user, newFavoriteCompanies);
    return { msg: `Favorite companies updated for user ${user}` };
  }

  @Router.post("/preferences/blocked")
  async blockContent(session: SessionDoc, block: string) {
    const user = Sessioning.getUser(session);
    await Preferences.blockContent(user, block);
    return { msg: `Content ${block} blocked for user ${user}` };
  }

  @Router.patch("/preferences/do-not-show")
  async updateDoNotShow(session: SessionDoc, newDoNotShowList: string[]) {
    const user = Sessioning.getUser(session);
    await Preferences.updateDoNotShow(user, newDoNotShowList);
    return { msg: `Do Not Show list updated for user ${user}` };
  }

  @Router.patch("/preferences/location")
  async updateLocation(session: SessionDoc, newLocation: string) {
    const user = Sessioning.getUser(session);
    await Preferences.updateLocation(user, newLocation);
    return { msg: `Location updated to ${newLocation} for user ${user}` };
  }

  @Router.patch("/preferences/age")
  async updateAge(session: SessionDoc, newAge: number) {
    const user = Sessioning.getUser(session);
    await Preferences.updateAge(user, newAge);
    return { msg: `Age updated to ${newAge} for user ${user}` };
  }

  @Router.patch("/preferences/looking-for")
  async updateLookingFor(session: SessionDoc, newLookingFor: string) {
    const user = Sessioning.getUser(session);
    await Preferences.updateLookingFor(user, newLookingFor);
    return { msg: `Looking-for status updated to ${newLookingFor} for user ${user}` };
  }

  @Router.get("/preferences")
  async getPreferences(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const preferences = await Preferences.getPreferences(user);
    return { preferences };
  }

  @Router.post("/conversations")
  async createConversation(session: SessionDoc, recipientId: string) {
    const senderId = Sessioning.getUser(session);
    const recipientObjectId = new ObjectId(recipientId);
    const participants = [senderId, recipientObjectId];
    const response = await Messages.createConversation(participants);
    return { msg: response.msg, conversationId: response.conversationId };
  }

  @Router.get("/conversations/:conversationId")
  async getConversation(session: SessionDoc, conversationId: string) {
    const userId = Sessioning.getUser(session);
    const conversation = await Messages.conversations.readOne({ _id: new ObjectId(conversationId) });
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Verify user is a participant
    if (!conversation.participants.some((id) => id.equals(userId))) {
      throw new Error("Access denied: You are not a participant in this conversation.");
    }

    return { conversation };
  }

  /** Get the conversation between the current user and another user */
  @Router.get("/conversations/with/:recipientId")
  async getConversationBetweenUsers(session: SessionDoc, recipientId: string) {
    const senderId = Sessioning.getUser(session);
    const recipientObjectId = new ObjectId(recipientId);
    const conversation = await Messages.getConversationBetweenUsers([senderId, recipientObjectId]);
    return { conversation };
  }

  /** Get all conversations for the current user */
  @Router.get("/conversations")
  async getConversationsForUser(session: SessionDoc) {
    const userId = Sessioning.getUser(session);
    const conversations = await Messages.getConversationsForUser(userId);
    console.log(conversations);
    return { conversations: conversations };
  }

  /** Get messages in a conversation */
  @Router.get("/conversations/:conversationId/messages")
  async getMessages(session: SessionDoc, conversationId: string) {
    const userId = Sessioning.getUser(session);
    const messages = await Messages.getMessages(new ObjectId(conversationId), userId);
    return { messages };
  }

  @Router.post("/conversations/messages")
  async sendMessage(session: SessionDoc, conversationId: string, recipientId: string, content: string) {
    const senderId = Sessioning.getUser(session);
    const recipientObjectId = new ObjectId(recipientId);
    const response = await Messages.sendMessage(new ObjectId(conversationId), content, senderId, recipientObjectId);
    return { msg: response.msg, messageId: response.messageId };
  }

  @Router.post("/conversations/offers")
  async sendOfferMessage(session: SessionDoc, conversationId: string, recipientId: string, content: string, associatedPostId: string, company: string, product: string, duration: number) {
    const senderId = Sessioning.getUser(session);
    const recipientObjectId = new ObjectId(recipientId);
    const conversationObjectId = new ObjectId(conversationId);
    const associatedPostObjectId = new ObjectId(associatedPostId);

    const responseObj = await Messages.sendOfferMessage(conversationObjectId, content, senderId, recipientObjectId, associatedPostObjectId, company, product, duration);

    return { msg: responseObj.msg, messageId: responseObj.messageId };
  }

  /** Add a response to an offer */
  @Router.post("/conversations/:conversationId/messages/:messageId/response")
  async addResponseToOffer(session: SessionDoc, conversationId: string, messageId: string, postId: string, response: string) {
    const userId = Sessioning.getUser(session);
    const resp = await Messages.addResponseToOffer(new ObjectId(conversationId), new ObjectId(messageId), new ObjectId(postId), response, userId);
    return { msg: resp.msg };
  }

  /** Approve an offer */
  @Router.post("/conversations/:conversationId/messages/:messageId/approve")
  async approveOffer(session: SessionDoc, conversationId: string, messageId: string) {
    const senderId = Sessioning.getUser(session);
    const resp = await Messages.approveOffer(new ObjectId(conversationId), new ObjectId(messageId), senderId);
    return { msg: resp.msg };
  }

  @Router.post("/conversations/:conversationId/offers/:messageId/deny")
  async denyOffer(session: SessionDoc, conversationId: string, messageId: string) {
    const senderId = Sessioning.getUser(session);
    const conversationObjectId = new ObjectId(conversationId);
    const messageObjectId = new ObjectId(messageId);
    const response = await Messages.denyOffer(conversationObjectId, messageObjectId, senderId);
    return { msg: response.msg };
  }

  /** Delete a message */
  @Router.delete("/conversations/:conversationId/messages/:messageId")
  async deleteMessage(session: SessionDoc, conversationId: string, messageId: string) {
    const userId = Sessioning.getUser(session);
    const response = await Messages.deleteMessage(new ObjectId(conversationId), new ObjectId(messageId), userId);
    return { msg: response.msg };
  }

  @Router.post("/promotions")
  async createPromotion(session: SessionDoc, postId: string, duration: number) {
    const oid = new ObjectId(postId);
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + duration);
    const response = await Labeling.addLabelToPost("promoted", oid, expirationDate);
    return { msg: response.msg };
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
