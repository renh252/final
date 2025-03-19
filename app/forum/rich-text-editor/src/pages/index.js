import React from 'react';
import Layout from '../components/common/Layout';
import { useEffect, useState } from 'react';

const HomePage = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles');
        if (response.ok) {
          const data = await response.json();
          setArticles(data);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, []);

  return (
    <Layout>
      <div className="container mt-5">
        <h1 className="text-center">文章列表</h1>
        <div className="row">
          {articles.map((article) => (
            <div key={article.id} className="col-md-4 mb-4">
              <div className="card">
                <img src={article.image || '/assets/images/placeholder.svg'} className="card-img-top" alt={article.title} />
                <div className="card-body">
                  <h5 className="card-title">{article.title}</h5>
                  <p className="card-text">{article.excerpt}</p>
                  <a href={`/edit/${article.id}`} className="btn btn-primary">編輯</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;