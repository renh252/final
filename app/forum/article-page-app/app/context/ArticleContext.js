import React, { createContext, useContext, useState } from 'react';

const ArticleContext = createContext();

export const ArticleProvider = ({ children }) => {
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);

  const updateArticle = (newArticle) => {
    setArticle(newArticle);
  };

  const addComment = (comment) => {
    setComments((prevComments) => [...prevComments, comment]);
  };

  return (
    <ArticleContext.Provider value={{ article, comments, updateArticle, addComment }}>
      {children}
    </ArticleContext.Provider>
  );
};

export const useArticle = () => {
  return useContext(ArticleContext);
};