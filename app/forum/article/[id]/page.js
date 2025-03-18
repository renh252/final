'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Loading from '../../components/UI/loading';
import NotFound from '../../components/UI/not-found';
import ArticleHeader from '../../components/ArticleHeader';
import ArticleBody from '../../components/ArticleBody';
import ArticleFooter from '../../components/ArticleFooter';
import Comments from '../../components/Comments';
import styles from '../../article.module.css';
import { FaCaretDown, FaRegComment, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const ArticlePage = () => {
    const params = useParams();
    const id = params.id;
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    
    // 模擬社區數據
    const communityInfo = {
        name: "寵物之家",
        description: "分享關於寵物照顧、健康、訓練和有趣故事的社區",
        members: 25600,
        online: 432,
        createdAt: "2020-06-15"
    };

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
                    
                    // 模擬獲取相關文章
                    fetchRelatedArticles(data.category);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchArticle();
        }
    }, [id]);
    
    // 模擬獲取相關文章
    const fetchRelatedArticles = (category) => {
        // 這裡可以替換為實際API調用
        const mockRelatedArticles = [
            {
                id: '101',
                title: '狗狗的健康飲食指南',
                author: '狗狗專家',
                upvotes: 203,
                comments: 45
            },
            {
                id: '102',
                title: '貓咪行為分析：為什麼貓咪會這樣做？',
                author: '貓貓觀察家',
                upvotes: 189,
                comments: 37
            },
            {
                id: '103',
                title: '寵物訓練的基本技巧與策略',
                author: '訓練教練',
                upvotes: 156,
                comments: 23
            }
        ];
        setRelatedArticles(mockRelatedArticles);
    };

    if (loading) return <Loading />;
    if (error || !article) return <NotFound />;
    
    return (
        <div className={styles.articlePageContainer}>
            <div className={styles.mainContent}>
                <ArticleBody 
                    content={article.content} 
                    author={article.author}
                    publishedAt={article.publishedAt}
                    category={article.category}
                    title={article.title}
                    id={id}
                />
                
                <div className={styles.commentsSection}>
                    <div className={styles.commentSorting}>
                        <div className={styles.sortText}>排序依據：</div>
                        <div className={styles.sortOption}>
                            最佳評論 <FaCaretDown />
                        </div>
                        <div className={styles.sortOption}>
                            新到舊 <FaCaretDown />
                        </div>
                    </div>
                    
                    <div className={styles.commentBox}>
                        <textarea 
                            className={styles.commentInput} 
                            placeholder="分享你的看法..."
                        />
                        <div className={styles.commentButtons}>
                            <button className={styles.commentButton}>評論</button>
                        </div>
                    </div>
                    
                    <div className={styles.commentList}>
                        {/* 評論範例 1 */}
                        <div className={styles.commentItem}>
                            <div className={styles.commentHeader}>
                                <div className={styles.commentAuthor}>user123</div>
                                <div className={styles.commentTime}>3小時前</div>
                            </div>
                            <div className={styles.commentContent}>
                                這篇文章非常有幫助！我一直在尋找這方面的資訊。感謝分享這麼詳細的內容。
                            </div>
                            <div className={styles.commentActions}>
                                <div className={styles.commentAction}><FaChevronUp /> 45</div>
                                <div className={styles.commentAction}><FaChevronDown /></div>
                                <div className={styles.commentAction}><FaRegComment /> 回覆</div>
                            </div>
                            
                            <div className={styles.replies}>
                                <div className={styles.commentItem}>
                                    <div className={styles.commentHeader}>
                                        <div className={styles.commentAuthor}>{article.author}</div>
                                        <div className={styles.commentTime}>2小時前</div>
                                    </div>
                                    <div className={styles.commentContent}>
                                        謝謝你的回饋！很高興這篇文章對你有所幫助。
                                    </div>
                                    <div className={styles.commentActions}>
                                        <div className={styles.commentAction}><FaChevronUp /> 12</div>
                                        <div className={styles.commentAction}><FaChevronDown /></div>
                                        <div className={styles.commentAction}><FaRegComment /> 回覆</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* 評論範例 2 */}
                        <div className={styles.commentItem}>
                            <div className={styles.commentHeader}>
                                <div className={styles.commentAuthor}>petlover456</div>
                                <div className={styles.commentTime}>5小時前</div>
                            </div>
                            <div className={styles.commentContent}>
                                我想補充一點，根據我的經驗，這個方法效果很好，但可能需要一些時間和耐心來看到結果。
                            </div>
                            <div className={styles.commentActions}>
                                <div className={styles.commentAction}><FaChevronUp /> 23</div>
                                <div className={styles.commentAction}><FaChevronDown /></div>
                                <div className={styles.commentAction}><FaRegComment /> 回覆</div>
                            </div>
                        </div>
                        
                        {/* 評論範例 3 */}
                        <div className={styles.commentItem}>
                            <div className={styles.commentHeader}>
                                <div className={styles.commentAuthor}>newbie789</div>
                                <div className={styles.commentTime}>1天前</div>
                            </div>
                            <div className={styles.commentContent}>
                                請問有人嘗試過其他方法嗎？我正在考慮幾個不同的選擇。
                            </div>
                            <div className={styles.commentActions}>
                                <div className={styles.commentAction}><FaChevronUp /> 8</div>
                                <div className={styles.commentAction}><FaChevronDown /></div>
                                <div className={styles.commentAction}><FaRegComment /> 回覆</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className={styles.sidebar}>
                <div className={styles.aboutCommunity}>
                    <div className={styles.sidebarTitle}>關於社區</div>
                    <div className={styles.communityInfo}>
                        {communityInfo.description}
                    </div>
                    <div className={styles.communityStats}>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>{communityInfo.members.toLocaleString()}</div>
                            <div className={styles.statLabel}>成員</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>{communityInfo.online}</div>
                            <div className={styles.statLabel}>線上</div>
                        </div>
                    </div>
                    <div className={styles.createPostButton}>發布文章</div>
                    <div className={styles.joinButton}>加入社區</div>
                </div>
                
                <div className={styles.relatedPosts}>
                    <div className={styles.sidebarTitle}>相關文章</div>
                    {relatedArticles.map(related => (
                        <div key={related.id} className={styles.relatedPost}>
                            <div className={styles.relatedPostTitle}>{related.title}</div>
                            <div className={styles.relatedPostMeta}>
                                {related.upvotes} 投票 • {related.comments} 評論
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArticlePage;