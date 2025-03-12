'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Loading from '../../components/UI/loading';
import NotFound from '../../components/UI/not-found';
import ArticleHeader from '../../components/ArticleHeader';
import ArticleBody from '../../components/ArticleBody';
import ArticleFooter from '../../components/ArticleFooter';
import Comments from '../../components/Comments';

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
    if (error || !article) return <NotFound />;

    return (
        <div className="container mt-5">
            <ArticleHeader title={article.title} author={article.author} publishedAt={article.publishedAt} category={article.category} />
            <ArticleBody content={article.content} />
            <ArticleFooter articleId={id} />
            <Comments articleId={id} />
        </div>
    );
};

export default ArticlePage;