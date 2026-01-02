import apiClient from '@/utils/axiosInstance';
import type {IComment, IPost, IReaction, TReactionType} from '@/types';

interface IPostWithRelations extends IPost {
  comments: IComment[];
  reactions: IReaction[];
}

export class PostApiService {
  private static instance: PostApiService;

  private constructor() {
  }

  static getInstance = (): PostApiService => {
    if (!PostApiService.instance) {
      PostApiService.instance = new PostApiService();
    }
    return PostApiService.instance;
  };

  getAllPosts = async (): Promise<IPostWithRelations[]> => {
    const response =
      await apiClient.get<{ posts: IPostWithRelations[] }>(
        '/posts',
      );
    return response.results.posts;
  };

  getPostById = async (postId: string): Promise<IPostWithRelations> => {
    const response = await apiClient.get<
      { post: IPostWithRelations }
    >(`/posts/${postId}`);
    return response.results.post;
  };

  createPost = async (
    caption: string,
    images?: string[],
    journal?: string[],
  ): Promise<IPost> => {
    const response = await apiClient.post<{ post: IPost }>(
      '/posts',
      {
        caption,
        image: images || [],
        journal: journal || [],
      },
    );
    return response.results.post;
  };

  updatePost = async (
    postId: string,
    updates: {
      caption?: string;
      images?: string[];
      journal?: string[];
    },
  ): Promise<IPost> => {
    const response = await apiClient.patch<{ post: IPost }>(
      `/posts/${postId}`,
      updates,
    );
    return response.results.post;
  };

  deletePost = async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}`);
  };

  reactToPost = async (
    postId: string,
    reactionType: TReactionType,
  ): Promise<IReaction> => {
    const response = await apiClient.post<
      { reaction: IReaction }
    >(`/posts/${postId}/react`, {reactionType});
    return response.results.reaction;
  };

  updateReaction = async (
    postId: string,
    reactionType: TReactionType,
  ): Promise<IReaction> => {
    const response = await apiClient.patch<
      { reaction: IReaction }
    >(`/posts/${postId}/react`, {reactionType});
    return response.results.reaction;
  };

  removeReaction = async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/react`);
  };

  addComment = async (postId: string, content: string): Promise<IComment> => {
    const response = await apiClient.post<{ comment: IComment }>(
      `/posts/${postId}/comment`,
      {content},
    );
    return response.results.comment;
  };

  updateComment = async (
    postId: string,
    commentId: string,
    content: string,
  ): Promise<IComment> => {
    const response = await apiClient.patch<{ comment: IComment }>(
      `/posts/${postId}/comment/${commentId}`,
      {content},
    );
    return response.results.comment;
  };

  deleteComment = async (postId: string, commentId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/comment/${commentId}`);
  };
}

export default PostApiService.getInstance();
