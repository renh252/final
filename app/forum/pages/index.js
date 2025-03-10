import React from 'react';
import { useEffect, useState } from 'react';
import Carousel from '../components/Carousel';
import ButtonGroup from '../components/ButtonGroup';
import NavTabs from '../components/NavTabs';
import SearchBox from '../components/SearchBox';
import PinnedCard from '../components/PinnedCard';
import PostList from '../components/PostList';
import Pagination from '../components/Pagination';
import Loading from '../app/loading';

const HomePage = () => {
    const [featuredArticles, setFeaturedArticles] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const featuredResponse = await fetch('/api/forum/featured');
                const featuredData = await featuredResponse.json();
                setFeaturedArticles(featuredData);

                const articlesResponse = await fetch(`/api/forum/list?page=${currentPage}`);
                const articlesData = await articlesResponse.json();
                setArticles(articlesData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage]);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="container">
            <Carousel articles={featuredArticles} />
            <ButtonGroup />
            <div className="d-flex justify-content-between">
                <NavTabs />
                <SearchBox />
            </div>
            <div className="pinned-articles">
                {featuredArticles.map(article => (
                    <PinnedCard key={article.id} article={article} />
                ))}
            </div>
            <PostList articles={articles} />
            <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
    );
};

export default HomePage;