import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Loading from '../../../loading';
import NotFound from '../../../not-found';

const ArticlePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            const fetchArticle = async () => {
                try {
                    const response = await fetch(`/api/forum/article/${id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch article');
                    }
                    const data = await response.json();
                    setArticle(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchArticle();
        }
    }, [id]);

    if (loading) return <Loading />;
    if (error) return <NotFound />;

    return (
        <div className="container mt-5">
            {article && (
                <div className="article">
                    <h1>{article.title}</h1>
                    <p className="text-muted">By {article.author} on {new Date(article.publishedAt).toLocaleDateString()}</p>
                    <div className="content" dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>
            )}
        </div>
    );
};

export default ArticlePage;