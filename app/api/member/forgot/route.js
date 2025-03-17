// pages/api/send-code.js

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email } = req.body;
        const verificationCode = generateVerificationCode();

        // 創建郵件傳輸對象
        const transporter = nodemailer.createTransport({
            service: 'gmail', // 或其他郵件服務提供商
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // 發送郵件
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '您的驗證碼',
            text: `您的驗證碼是：${verificationCode}`,
        };

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: '驗證碼已發送' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '發送驗證碼失敗' });
        }
    } else {
        res.status(405).json({ message: '不允許的請求方法' });
    }
}

// 生成驗證碼
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};