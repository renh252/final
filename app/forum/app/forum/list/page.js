import { useEffect, useContext, useState } from 'react';
import Carousel from '../../../components/Carousel';
import ButtonGroup from '../../../components/ButtonGroup';
import NavTabs from '../../../components/NavTabs';
import SearchBox from '../../../components/SearchBox';
import PinnedCard from '../../../components/PinnedCard';
import PostList from '../../../components/PostList';
import Pagination from '../../../components/Pagination';
import { ArticleContext } from '../../../context/ArticleContext';
import Loading from '../../loading';

const ForumListPage = () => {
    const { setPinnedArticles, setArticles, setCurrentPage } = useContext(ArticleContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const featuredResponse = await fetch('/api/forum/featured');
                const featuredData = await featuredResponse.json();
                setPinnedArticles(featuredData);

                const articlesResponse = await fetch('/api/forum/list?page=1');
                const articlesData = await articlesResponse.json();
                setArticles(articlesData);
                setCurrentPage(1);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [setPinnedArticles, setArticles, setCurrentPage]);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="container">
            <Carousel articles={pinnedArticles} />
            <ButtonGroup />
            <div className="d-flex justify-content-between">
                <NavTabs />
                <SearchBox />
            </div>
            <div className="mt-4">
                {pinnedArticles.map(article => (
                    <PinnedCard key={article.id} article={article} />
                ))}
            </div>
            <PostList articles={articles} />
            <Pagination />
        </div>
    );
};

export default ForumListPage;