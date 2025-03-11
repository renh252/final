import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <p className="text-center">© {new Date().getFullYear()} Your Website Name. All rights reserved.</p>
                <ul className="social-links text-center">
                    <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                    <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
                    <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;