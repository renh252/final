'use client';
import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';

const NavTabs = ({ onTabSelect }) => {
    const [activeTab, setActiveTab] = useState('popular');

    const handleSelect = (tab) => {
        setActiveTab(tab);
        onTabSelect(tab);
    };

    return (
        <Nav variant="tabs" defaultActiveKey="popular">
            <Nav.Item>
                <Nav.Link 
                    eventKey="popular" 
                    active={activeTab === 'popular'} 
                    onClick={() => handleSelect('popular')}
                >
                    熱門
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link 
                    eventKey="latest" 
                    active={activeTab === 'latest'} 
                    onClick={() => handleSelect('latest')}
                >
                    最新
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link 
                    eventKey="rules" 
                    active={activeTab === 'rules'} 
                    onClick={() => handleSelect('rules')}
                >
                    板規
                </Nav.Link>
            </Nav.Item>
        </Nav>
    );
};

export default NavTabs;