'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  Divider,
  TextField,
  Box,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

interface User {
  id: number;
  name: string;
  avatar: string | null;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: User;
}

interface Tag {
  tag: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  user: User;
  category: Category;
  comments: Comment[];
  tags: Tag[];
}

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/forum/posts/${id}`);
        if (!response.ok) throw new Error('Post not found');
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement comment submission
  };

  if (loading) return (
    <Container sx={{ py: 4 }}>
      <Typography>載入中...</Typography>
    </Container>
  );

  if (!post) return (
    <Container sx={{ py: 4 }}>
      <Typography>找不到文章</Typography>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          {/* 作者資訊 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={post.user.avatar || undefined}
              alt={post.user.name}
              sx={{ mr: 2 }}
            >
              {!post.user.avatar && post.user.name[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle1">{post.user.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: zhTW,
                })}
              </Typography>
            </Box>
          </Box>

          {/* 文章標題 */}
          <Typography variant="h5" gutterBottom>
            {post.title}
          </Typography>

          {/* 分類和標籤 */}
          <Box sx={{ mb: 2 }}>
            <Chip
              label={post.category.name}
              color="primary"
              size="small"
              sx={{ mr: 1 }}
            />
            {post.tags.map((tag) => (
              <Chip
                key={tag.tag.id}
                label={tag.tag.name}
                size="small"
                sx={{ mr: 1 }}
              />
            ))}
          </Box>

          {/* 文章內容 */}
          <Typography variant="body1" paragraph>
            {post.content}
          </Typography>

          {/* 文章統計 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">{post.view_count}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <ThumbUpIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">{post.like_count}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">{post.comments.length}</Typography>
            </Box>
          </Box>

          {/* 操作按鈕 */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ThumbUpIcon />}
              size="small"
            >
              讚
            </Button>
            <Button
              variant="outlined"
              startIcon={<BookmarkIcon />}
              size="small"
            >
              收藏
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              size="small"
            >
              分享
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 評論區 */}
          <Typography variant="h6" gutterBottom>
            評論 ({post.comments.length})
          </Typography>

          {/* 新增評論 */}
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="寫下你的評論..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!newComment.trim()}
            >
              發表評論
            </Button>
          </Box>

          {/* 評論列表 */}
          <Box sx={{ mt: 2 }}>
            {post.comments.map((comment) => (
              <Card key={comment.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      src={comment.user.avatar || undefined}
                      alt={comment.user.name}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    >
                      {!comment.user.avatar && comment.user.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {comment.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: zhTW,
                        })}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2">
                    {comment.content}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
