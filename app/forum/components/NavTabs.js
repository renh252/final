'use client';
import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';

const NavTabs = ({ onTabSelect }) => {
    const [activeTab, setActiveTab] = useState('popular');

    const handleSelect = (tab) => {
        setActiveTab(tab);
        if (onTabSelect) {
            onTabSelect(tab);
        }
    };

    const activeStyle = {
        backgroundColor: '#C79650',
        color: 'white',
        borderColor: '#C79650'
    };

    const inactiveStyle = {
        color: 'black'  // 未選中的標籤使用黑色字體
    };

    return (
        <Nav variant="tabs" defaultActiveKey="popular">
            <Nav.Item>
                <Nav.Link 
                    eventKey="popular" 
                    active={activeTab === 'popular'}
                    onClick={() => handleSelect('popular')}
                    style={activeTab === 'popular' ? activeStyle : inactiveStyle}
                >
                    熱門
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link 
                    eventKey="latest" 
                    active={activeTab === 'latest'}
                    onClick={() => handleSelect('latest')}
                    style={activeTab === 'latest' ? activeStyle : inactiveStyle}
                >
                    最新
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link 
                    eventKey="rules" 
                    active={activeTab === 'rules'}
                    onClick={() => handleSelect('rules')}
                    style={activeTab === 'rules' ? activeStyle : inactiveStyle}
                >
                    板規
                </Nav.Link>
            </Nav.Item>
        </Nav>
    );
};

export default NavTabs;