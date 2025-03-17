'use client';

import React, { useState, useEffect, useContext } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from '../Chat/ChatInput';
import { ChatContext } from '../../context/ChatContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const ChatBox = () => {
  const { messages, sendMessage, user } = useContext(ChatContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatBox = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`chat-box ${isOpen ? 'open' : 'closed'}`}>
      <button className="btn btn-primary" onClick={toggleChatBox}>
        {isOpen ? 'Close Chat' : 'Open Chat'}
      </button>
      {isOpen && (
        <div className="chat-content">
          <div className="messages">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
          </div>
          {user ? (
            <ChatInput sendMessage={sendMessage} />
          ) : (
            <div className="alert alert-warning">
              Please log in to send messages.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBox;