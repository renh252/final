import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PostList from '../../../components/PostList';
import Loading from '../../../app/loading';

const SearchPage = () => {
    const router = useRouter();
    const { query } = router;
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticles = async () => {
            if (!query.keyword) return;

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/forum/list?search=${query.keyword}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch articles');
                }
                const data = await response.json();
                setArticles(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [query.keyword]);

    if (loading) return <Loading />;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mt-4">
            <h1>搜尋結果</h1>
            <PostList articles={articles} />
        </div>
    );
};

export default SearchPage;