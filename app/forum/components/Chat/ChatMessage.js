'use client';

import React from 'react';
import { MessageBox } from 'react-chat-elements';

const ChatMessage = ({ message }) => {
    return (
        <MessageBox
            position={message.position}
            type={message.type}
            text={message.text}
            title={message.user}
            date={new Date(message.date).toLocaleString()}
        />
    );
};

export default ChatMessage;