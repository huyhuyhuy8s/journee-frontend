import apiClient from '@/utils/apiClient';
import {IComment, IPost, IReaction, TReactionType} from '@/types';

interface IApiResponse<T> {
  meta: {
    status: number;
    message: string;
    error?: string;
  };
  results?: T;
}

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
    const response = await apiClient.get<
      IApiResponse<{ posts: IPostWithRelations[] }>
    >('/posts');
    return response.data.results!.posts;
  };

  getPostById = async (postId: string): Promise<IPostWithRelations> => {
    const response = await apiClient.get<
      IApiResponse<{ post: IPostWithRelations }>
    >(`/posts/${postId}`);
    return response.data.results!.post;
  };

  createPost = async (
    caption: string,
    images?: string[],
    journal?: any[]
  ): Promise<IPost> => {
    const response = await apiClient.post<IApiResponse<{ post: IPost }>>(
      '/posts',
      {
        caption,
        image: images || [],
        journal: journal || [],
      }
    );
    return response.data.results!.post;
  };

  updatePost = async (
    postId: string,
    updates: {
      caption?: string;
      images?: string[];
      journal?: any[];
    }
  ): Promise<IPost> => {
    const response = await apiClient.patch<IApiResponse<{ post: IPost }>>(
      `/posts/${postId}`,
      updates
    );
    return response.data.results!.post;
  };

  deletePost = async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}`);
  };

  reactToPost = async (
    postId: string,
    reactionType: TReactionType
  ): Promise<IReaction> => {
    const response = await apiClient.post<IApiResponse<{ reaction: IReaction }>>(
      `/posts/${postId}/react`,
      {reactionType}
    );
    return response.data.results!.reaction;
  };

  updateReaction = async (
    postId: string,
    reactionType: TReactionType
  ): Promise<IReaction> => {
    const response = await apiClient.patch<IApiResponse<{ reaction: IReaction }>>(
      `/posts/${postId}/react`,
      {reactionType}
    );
    return response.data.results!.reaction;
  };

  removeReaction = async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/react`);
  };

  addComment = async (postId: string, content: string): Promise<IComment> => {
    const response = await apiClient.post<IApiResponse<{ comment: IComment }>>(
      `/posts/${postId}/comment`,
      {content}
    );
    return response.data.results!.comment;
  };

  updateComment = async (
    postId: string,
    commentId: string,
    content: string
  ): Promise<IComment> => {
    const response = await apiClient.patch<IApiResponse<{ comment: IComment }>>(
      `/posts/${postId}/comment/${commentId}`,
      {content}
    );
    return response.data.results!.comment;
  };

  deleteComment = async (postId: string, commentId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/comment/${commentId}`);
  };
}

export default PostApiService.getInstance();