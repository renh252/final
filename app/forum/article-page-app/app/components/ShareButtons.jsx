import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaPinterest } from 'react-icons/fa';

const ShareButtons = ({ articleTitle, articleUrl }) => {
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const shareOnPinterest = () => {
    window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(articleUrl)}&description=${encodeURIComponent(articleTitle)}`, '_blank');
  };

  return (
    <div className="share-buttons">
      <button onClick={shareOnFacebook} aria-label="Share on Facebook">
        <FaFacebook />
      </button>
      <button onClick={shareOnTwitter} aria-label="Share on Twitter">
        <FaTwitter />
      </button>
      <button onClick={shareOnLinkedIn} aria-label="Share on LinkedIn">
        <FaLinkedin />
      </button>
      <button onClick={shareOnPinterest} aria-label="Share on Pinterest">
        <FaPinterest />
      </button>
    </div>
  );
};

export default ShareButtons;