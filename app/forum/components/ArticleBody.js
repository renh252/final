import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../article.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { BsArrowUpCircle, BsArrowUpCircleFill, BsArrowDownCircle, BsArrowDownCircleFill } from 'react-icons/bs';
import { FaRegBookmark, FaBookmark, FaShare, FaRegComment, FaEllipsisH } from 'react-icons/fa';
import { RiAwardLine } from 'react-icons/ri';

const ArticleBody = ({ content, author, publishedAt, category, title, id }) => {
    const [votes, setVotes] = useState(Math.floor(Math.random() * 1000) + 1);
    const [userVote, setUserVote] = useState(null); // null, 'up', or 'down'
    const [bookmarked, setBookmarked] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [commentCount] = useState(Math.floor(Math.random() * 200) + 5);
    
    // 計算發布時間
    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHrs < 1) return '剛才';
        if (diffHrs < 24) return `${diffHrs}小時前`;
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 30) return `${diffDays}天前`;
        return `${Math.floor(diffDays / 30)}個月前`;
    };
    
    // 處理投票
    const handleVote = (voteType) => {
        if (userVote === voteType) {
            // 取消投票
            setUserVote(null);
            setVotes(voteType === 'up' ? votes - 1 : votes + 1);
        } else {
            // 更改投票或新投票
            setVotes(
                userVote === null 
                    ? (voteType === 'up' ? votes + 1 : votes - 1)
                    : (voteType === 'up' ? votes + 2 : votes - 2)
            );
            setUserVote(voteType);
        }
    };

    return (
        <div className={styles.articleWrapper}>
            {/* 左側投票區塊 */}
            <div className={styles.voteColumn}>
                {userVote === 'up' 
                    ? <BsArrowUpCircleFill className={styles.voteButtonActive} onClick={() => handleVote('up')} /> 
                    : <BsArrowUpCircle className={styles.voteButton} onClick={() => handleVote('up')} />}
                <span className={styles.voteCount}>{votes}</span>
                {userVote === 'down' 
                    ? <BsArrowDownCircleFill className={styles.voteButtonActive} onClick={() => handleVote('down')} /> 
                    : <BsArrowDownCircle className={styles.voteButton} onClick={() => handleVote('down')} />}
            </div>
            
            {/* 右側內容區塊 */}
            <div className={styles.contentColumn}>
                {/* 文章頭部信息 */}
                <div className={styles.articleMeta}>
                    <div className={styles.categoryPill}>r/{category}</div>
                    <div className={styles.postedBy}>
                        Posted by u/{author} • {getTimeAgo(publishedAt)}
                    </div>
                </div>
                
                {/* 文章標題 */}
                <h1 className={styles.articleTitle}>{title}</h1>
                
                {/* 文章內容 */}
                <div className={styles.articleContent}>
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
                
                {/* 互動按鈕 */}
                <div className={styles.interactionBar}>
                    <div className={styles.interactionButton}>
                        <FaRegComment /> <span>{commentCount} 評論</span>
                    </div>
                    <button className={styles.interactionButton} onClick={() => setShowShareOptions(!showShareOptions)}>
                        <FaShare /> <span>分享</span>
                        {showShareOptions && (
                            <div className={styles.shareOptions}>
                                <div className={styles.shareOption}>複製連結</div>
                                <div className={styles.shareOption}>分享到 Facebook</div>
                                <div className={styles.shareOption}>分享到 Twitter</div>
                                <div className={styles.shareOption}>分享到 LINE</div>
                            </div>
                        )}
                    </button>
                    <button className={styles.interactionButton} onClick={() => setBookmarked(!bookmarked)}>
                        {bookmarked ? <FaBookmark /> : <FaRegBookmark />} <span>收藏</span>
                    </button>
                    <div className={styles.interactionButton}>
                        <RiAwardLine /> <span>獎勵</span>
                    </div>
                    <div className={styles.interactionButton}>
                        <FaEllipsisH />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleBody;