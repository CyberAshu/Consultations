import { apiGet, apiPost } from '../client';
import { 
  BlogPost, 
  BlogFilters,
  CreateBlogPostRequest 
} from '../../types/service.types';

class BlogService {
  // Get list of blog posts with optional filters
  async getBlogPosts(filters: BlogFilters = {}): Promise<BlogPost[]> {
    return apiGet<BlogPost[]>('/blogs/', filters);
  }

  // Search blog posts
  async searchBlogPosts(query: string): Promise<BlogPost[]> {
    return apiGet<BlogPost[]>('/blogs/search', { query });
  }

  // Get blog post by ID
  async getBlogPostById(postId: number): Promise<BlogPost> {
    return apiGet<BlogPost>(`/blogs/${postId}`);
  }

  // Create new blog post
  async createBlogPost(postData: CreateBlogPostRequest): Promise<BlogPost> {
    return apiPost<BlogPost>('/blogs/', postData);
  }

  // Update blog post
  async updateBlogPost(postId: number, updateData: Partial<CreateBlogPostRequest>): Promise<BlogPost> {
    return apiPost<BlogPost>(`/blogs/${postId}`, updateData);
  }

  // Create blog comment
  async createBlogComment(postId: number, commentData: { content: string }): Promise<void> {
    return apiPost<void>(`/blogs/${postId}/comments`, commentData);
  }

  // Like/unlike blog post
  async likeBlogPost(postId: number): Promise<{ message: string; liked: boolean }> {
    return apiPost<{ message: string; liked: boolean }>(`/blogs/${postId}/like`);
  }

  // Get blog categories with post counts
  async getBlogCategories(): Promise<Array<{ name: string; count: number }>> {
    return apiGet<Array<{ name: string; count: number }>>('/blogs/categories');
  }

  // Get recent blog posts
  async getRecentPosts(limit: number = 5): Promise<Array<{ title: string; slug: string }>> {
    return apiGet<Array<{ title: string; slug: string }>>('/blogs/recent', { limit: limit.toString() });
  }
}

export const blogService = new BlogService();
