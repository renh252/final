'use client';
import React, { useEffect, useState } from 'react';
import ArticleContent from '../../components/ArticleContent';
import ArticleInteraction from '../../components/ArticleInteraction';
import CommentSection from '../../components/CommentSection';
import RelatedArticles from '../../components/RelatedArticles';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useRouter } from 'next/router';
import Loading from '../../app/loading';

const ArticlePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (id) {
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
    }
  }, [id]);

  const handleCommentsUpdate = (newComments) => {
    setComments(newComments);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="article-page">
      <Header />
      {article && (
        <>
          <ArticleContent article={article} />
          <ArticleInteraction articleId={id} />
          <CommentSection articleId={id} onCommentsUpdate={handleCommentsUpdate} />
          <RelatedArticles currentArticleId={id} />
        </>
      )}
      <Footer />
    </div>
  );
};

export default ArticlePage;