import React from 'react';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <h2>熱門文章</h2>
            <ul>
                {/* 這裡可以動態生成熱門文章列表 */}
                <li><a href="#">文章標題 1</a></li>
                <li><a href="#">文章標題 2</a></li>
                <li><a href="#">文章標題 3</a></li>
            </ul>
            <h2>分類</h2>
            <ul>
                {/* 這裡可以動態生成分類列表 */}
                <li><a href="#">分類 1</a></li>
                <li><a href="#">分類 2</a></li>
                <li><a href="#">分類 3</a></li>
            </ul>
        </aside>
    );
};

export default Sidebar;