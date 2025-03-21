import './styles.css';
import React from 'react';

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="forum-layout">
      {children}
    </div>
  );
}
