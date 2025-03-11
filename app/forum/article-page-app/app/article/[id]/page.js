'use client';
import React, { useEffect, useState } from 'react';
import ArticleContent from '../../components/ArticleContent';
import ArticleInteraction from '../../components/ArticleInteraction';
import CommentSection from '../../components/CommentSection';
import RelatedArticles from '../../components/RelatedArticles';
import Loading from '../../app/loading';
import { useArticle } from '../../hooks/useArticle';

const ArticlePage = ({ params }) => {
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);

  const fetchArticleData = async () => {
    try {
      const res = await fetch(`/api/articles/${id}`);
      const data = await res.json();
      setArticle(data.article);
      setComments(data.comments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching article data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticleData();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="article-page">
      {article && (
        <>
          <ArticleContent article={article} />
          <ArticleInteraction articleId={id} />
          <CommentSection comments={comments} setComments={setComments} />
          <RelatedArticles currentArticleId={id} />
        </>
      )}
    </div>
  );
};

export default ArticlePage;