import React from 'react';
import styles from '../styles/article.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container text-center">
        <p>&copy; {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        <nav>
          <a href="/privacy-policy" className={styles.link}>Privacy Policy</a>
          <a href="/terms-of-service" className={styles.link}>Terms of Service</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;