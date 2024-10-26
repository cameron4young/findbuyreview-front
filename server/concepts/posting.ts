import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface PostOptions {
  backgroundColor?: string;
}

export interface PostDoc extends BaseDoc {
  author: ObjectId;
  content: string;
  video: string;
  date: Date;
  rating: number;
  productURL: string;
  options?: PostOptions;
}

/**
 * concept: Posting
 */
export default class PostingConcept {
  public readonly posts: DocCollection<PostDoc>;

  constructor(collectionName: string) {
    this.posts = new DocCollection<PostDoc>(collectionName);
  }

  async create(author: ObjectId, content: string, video: string, productURL: string, rating: number, options?: PostOptions) {
    const date = new Date();

    const _id = await this.posts.createOne({
      author,
      content,
      video,
      date,
      rating,
      productURL,
      options,
    });

    return { msg: "Post successfully created!", post: await this.posts.readOne({ _id }) };
  }

  async getPosts() {
    return await this.posts.readMany({}, { sort: { _id: -1 } });
  }

  async getByAuthor(author: ObjectId) {
    return await this.posts.readMany({ author });
  }

  async getPostById(_id: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post with ID ${_id} not found.`);
    }
    return post;
  }

  async getPostsByIds(postIds: ObjectId[]) {
    return await this.posts.readMany({ _id: { $in: postIds } });
  }

  async searchPosts(query: string): Promise<PostDoc[]> {
    // Create a RegExp object for the query with case-insensitive search
    const regex = new RegExp(query, "i");

    console.log("Query", regex);

    return await this.posts.readMany({
      $or: [
        { content: { $regex: regex } }, // Match content
      ],
    });
  }

  async update(_id: ObjectId, content?: string, rating?: number, productURL?: string, options?: PostOptions) {
    await this.posts.partialUpdateOne({ _id }, { content, rating, productURL, options });
    return { msg: "Post successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.posts.deleteOne({ _id });
    return { msg: "Post deleted successfully!" };
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post ${_id} does not exist!`);
    }
    if (post.author.toString() !== user.toString()) {
      throw new PostAuthorNotMatchError(user, _id);
    }
  }
}

export class PostAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}
