'use client';

import React from 'react';
import ChatBox from '../components/Chat/ChatBox';
import ChatButton from '../components/ChatButton';
import { ChatProvider } from '../context/ChatContext';

const ChatPage = () => {
    return (
        <ChatProvider>
            <div className="chat-page">
                <ChatButton />
                <ChatBox />
            </div>
        </ChatProvider>
    );
};

export default ChatPage;