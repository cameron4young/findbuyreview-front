import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface LabelDoc extends BaseDoc {
  label: string;
  posts: ObjectId[];
  expiration?: Date; // Optional expiration date for "promoted" labels
}

/**
 * debugged by ChatGPT :)
 * concept: Labeling [Label -> Posts]
 */
export default class LabelingConcept {
  public readonly labels: DocCollection<LabelDoc>;

  /**
   * Make an instance of Labeling.
   */
  constructor(collectionName: string) {
    this.labels = new DocCollection<LabelDoc>(collectionName);
  }

  // Add a label to a post with optional expiration date (for promoted labels)
  async addLabelToPost(label: string, postId: ObjectId, expirationDate?: Date) {
    if (label === "promoted" && !expirationDate) {
      throw new Error("Promoted label must have an expiration date.");
    }

    let labelDoc = await this.labels.readOne({ label });
    if (!labelDoc) {
      await this.labels.createOne({ label, posts: [postId], expiration: expirationDate });
    } else {
      if (!labelDoc.posts.includes(postId)) {
        labelDoc.posts.push(postId);
        await this.labels.partialUpdateOne({ _id: labelDoc._id }, { posts: labelDoc.posts, expiration: expirationDate });
      }
    }
    return { msg: `Post successfully labeled with ${label}!` };
  }

  // Remove a label from a post
  async removeLabelFromPost(label: string, postId: ObjectId) {
    const labelDoc = await this.labels.readOne({ label });
    if (!labelDoc) {
      throw new NotFoundError(`Label '${label}' not found.`);
    }
    const updatedPosts = labelDoc.posts.filter((existingPostId) => existingPostId.toString() !== postId.toString());
    await this.labels.partialUpdateOne({ _id: labelDoc._id }, { posts: updatedPosts });
    return { msg: `Post successfully removed from label ${label}!` };
  }

  // Get posts by label and automatically expire label if needed
  async getPostsByLabel(label: string): Promise<ObjectId[]> {
    const labelDoc = await this.labels.readOne({ label });
    if (!labelDoc) {
      return [];
    }

    // Automatically expire the label if the expiration date has passed
    if (labelDoc.expiration && new Date() > labelDoc.expiration) {
      await this.labels.deleteOne({ _id: labelDoc._id });
      return [];
    }

    return labelDoc.posts;
  }

  // Clean up expired labels (to be run periodically)
  async cleanUpExpiredLabels() {
    const now = new Date();
    const expiredLabels = await this.labels.readMany({ expiration: { $lt: now } });
    for (const label of expiredLabels) {
      await this.labels.deleteOne({ _id: label._id });
    }
    return { msg: "Expired labels cleaned up!" };
  }

  async getPostsByLabels(labels: string[]): Promise<ObjectId[]> {
    const labelDocs = await this.labels.readMany({ label: { $in: labels } });

    const postLabelMap = new Map<string, Set<string>>();

    for (const labelDoc of labelDocs) {
      for (const postId of labelDoc.posts) {
        const postIdStr = postId.toHexString();
        if (!postLabelMap.has(postIdStr)) {
          postLabelMap.set(postIdStr, new Set());
        }
        postLabelMap.get(postIdStr)?.add(labelDoc.label);
      }
    }

    const matchingPostIds = Array.from(postLabelMap.entries())
      .filter(([, labelSet]) => labels.every((label) => labelSet.has(label)))
      .map(([postIdStr]) => new ObjectId(postIdStr));

    return matchingPostIds;
  }
}
