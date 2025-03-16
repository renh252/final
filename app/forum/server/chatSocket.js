'use client';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./models/Message'); // 假設有一個 Message 模型

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 連接到 MongoDB
mongoose.connect('mongodb://localhost:27017/myforum', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// 當有新的連線時
io.on('connection', (socket) => {
    console.log('A user connected');

    // 當接收到訊息時
    socket.on('sendMessage', async (messageData) => {
        const message = new Message(messageData);
        await message.save(); // 儲存訊息到 MongoDB

        // 廣播訊息給所有連線的客戶端
        io.emit('newMessage', message);
    });

    // 當用戶斷開連線時
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// 啟動伺服器
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});