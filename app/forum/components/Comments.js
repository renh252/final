'use client';
import { useEffect, useState } from 'react';

const Comments = ({ articleId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`/api/forum/article/${articleId}/comments`);
                if (!response.ok) {
                    throw new Error('Failed to fetch comments');
                }
                const data = await response.json();
                setComments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [articleId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment) return;

        try {
            const response = await fetch(`/api/forum/article/${articleId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit comment');
            }

            const addedComment = await response.json();
            setComments((prevComments) => [...prevComments, addedComment]);
            setNewComment('');
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p>Loading comments...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="comments-section">
            <h3>Comments</h3>
            <form onSubmit={handleCommentSubmit}>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    required
                />
                <button type="submit">Submit</button>
            </form>
            <ul>
                {comments.map((comment) => (
                    <li key={comment.id}>
                        <p>{comment.content}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Comments;