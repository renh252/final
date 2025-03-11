import React, { useEffect, useState } from 'react';
import ArticleCard from './ArticleCard';

const RelatedArticles = ({ currentArticleId }) => {
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        const response = await fetch(`/api/articles/${currentArticleId}/related`);
        const data = await response.json();
        setRelatedArticles(data);
      } catch (error) {
        console.error('Error fetching related articles:', error);
      }
    };

    fetchRelatedArticles();
  }, [currentArticleId]);

  return (
    <div className="related-articles">
      <h3>Related Articles</h3>
      <div className="article-list">
        {relatedArticles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default RelatedArticles;