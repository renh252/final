import React, { createContext, useContext, useState, useEffect } from 'react';

const ArticleContext = createContext();

export const ArticleProvider = ({ children }) => {
    const [articles, setArticles] = useState([]);
    const [featuredArticles, setFeaturedArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch('/api/forum/list?page=' + currentPage);
                const data = await response.json();
                setArticles(data);
            } catch (error) {
                console.error('Error fetching articles:', error);
            }
        };

        fetchArticles();
    }, [currentPage]);

    useEffect(() => {
        const fetchFeaturedArticles = async () => {
            try {
                const response = await fetch('/api/forum/featured');
                const data = await response.json();
                setFeaturedArticles(data);
            } catch (error) {
                console.error('Error fetching featured articles:', error);
            }
        };

        fetchFeaturedArticles();
    }, []);

    return (
        <ArticleContext.Provider value={{ articles, featuredArticles, currentPage, setCurrentPage }}>
            {children}
        </ArticleContext.Provider>
    );
};

export const useArticleContext = () => {
    return useContext(ArticleContext);
};