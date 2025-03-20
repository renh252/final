import { useState, useEffect, useCallback } from 'react';
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
  view_count: number;
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

export function useForumData(filters: ForumFilters) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 獲取分類
      const categoriesResponse = await axios.get('/api/forum/categories');
      if (categoriesResponse.data.status === 'success') {
        setCategories(categoriesResponse.data.data);
      }

      // 獲取文章列表
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.tags?.length) params.append('tags', filters.tags.join(','));
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const postsResponse = await axios.get(`/api/forum/posts?${params}`);
      if (postsResponse.data.status === 'success') {
        setPosts(postsResponse.data.data);
        setPagination(postsResponse.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '載入資料失敗');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    categories,
    posts,
    pagination,
    loading,
    error,
    refetch: fetchData
  };
}
