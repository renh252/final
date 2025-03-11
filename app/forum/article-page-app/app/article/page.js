'use client';
import React, { useEffect, useState } from 'react';
import ArticleContent from '../../components/ArticleContent';
import ArticleInteraction from '../../components/ArticleInteraction';
import CommentSection from '../../components/CommentSection';
import RelatedArticles from '../../components/RelatedArticles';
import ShareButtons from '../../components/ShareButtons';
import Loading from '../../app/loading';

const ArticlePage = ({ params }) => {
  const { id } = params;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/articles/${id}`);
        const data = await res.json();
        setArticle(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching article:', error);
        setLoading(false);
      }
    };

    fetchArticle();
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
          <ShareButtons articleId={id} />
          <CommentSection articleId={id} comments={comments} setComments={setComments} />
          <RelatedArticles currentArticleId={id} />
        </>
      )}
    </div>
  );
};

export default ArticlePage;