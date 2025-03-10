import React, { createContext, useContext, useState, useEffect } from 'react';

const ArticleContext = createContext();

export const ArticleProvider = ({ children }) => {
    const [articles, setArticles] = useState([]);
    const [featuredArticles, setFeaturedArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/forum/list?page=' + currentPage);
                const data = await response.json();
                setArticles(data.articles);
                setFeaturedArticles(data.featuredArticles);
            } catch (error) {
                console.error('Error fetching articles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [currentPage]);

    return (
        <ArticleContext.Provider value={{ articles, featuredArticles, currentPage, setCurrentPage, loading }}>
            {children}
        </ArticleContext.Provider>
    );
};

export const useArticleContext = () => {
    return useContext(ArticleContext);
};