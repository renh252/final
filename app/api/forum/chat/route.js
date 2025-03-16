'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const newSocket = io('http://localhost:4000'); // Adjust the URL as needed
        setSocket(newSocket);

        newSocket.on('message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        newSocket.on('connect', () => {
            setLoading(false);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [setSocket]);

    const sendMessage = (message) => {
        if (socket) {
            socket.emit('message', message);
        }
    };

    return (
        <ChatContext.Provider value={{ messages, sendMessage, loading }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    return useContext(ChatContext);
};