import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-light py-3">
      <div className="container">
        <h1 className="text-center">文章頁面</h1>
        <nav className="d-flex justify-content-center">
          <Link href="/" className="mx-3">首頁</Link>
          <Link href="/article" className="mx-3">文章列表</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;