import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  order: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  post_count: number;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_avatar: string | null;
  like_count: number;
  comment_count: number;
  tags: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ForumFilters {
  category?: string;
  tags?: string[];
  sort?: 'latest' | 'hot';
  search?: string;
  page: number;
  limit: number;
}

export function useForumData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState({
    categories: false,
    tags: false,
    posts: false
  });
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      const { data } = await axios.get('/api/forum/categories');
      if (data.status === 'success') {
        setCategories(data.data);
      }
    } catch (err) {
      setError('無法載入分類');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const fetchTags = async () => {
    try {
      setLoading(prev => ({ ...prev, tags: true }));
      const { data } = await axios.get('/api/forum/tags');
      if (data.status === 'success') {
        setTags(data.data);
      }
    } catch (err) {
      setError('無法載入標籤');
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(prev => ({ ...prev, tags: false }));
    }
  };

  const fetchPosts = async (filters: ForumFilters) => {
    try {
      setLoading(prev => ({ ...prev, posts: true }));
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.tags?.length) params.append('tags', filters.tags.join(','));
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const { data } = await axios.get(`/api/forum/posts?${params.toString()}`);
      if (data.status === 'success') {
        setPosts(data.data.posts);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      setError('無法載入文章');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(prev => ({ ...prev, posts: false }));
    }
  };

  const createPost = async (postData: {
    title: string;
    content: string;
    categorySlug: string;
    tags?: number[];
  }) => {
    try {
      const { data } = await axios.post('/api/forum/posts', postData);
      if (data.status === 'success') {
        return data.data.id;
      }
      throw new Error(data.message);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  return {
    categories,
    tags,
    posts,
    pagination,
    loading,
    error,
    fetchPosts,
    createPost
  };
}
