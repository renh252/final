import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { database } from '@/app/api/_lib/db'; // 引入您的資料庫連接

dotenv.config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export async function POST(request) {
    const { action, email, otp, newPassword } = await request.json();

    if (!action) {
        return NextResponse.json({ message: '缺少操作類型 (action)' }, { status: 400 });
    }

    const db = await database(); // 建立資料庫連線 (根據您的 db.js 實作方式調整)

    if (!db) {
        console.error('資料庫連線失敗');
        return NextResponse.json({ message: '資料庫連線失敗，請稍後重試' }, { status: 500 });
    }

    try {
        switch (action) {
            case 'request-otp':
                if (!email || !/\S+@\S+\.\S+/.test(email)) {
                    return NextResponse.json({ message: '請輸入有效的電子郵件地址' }, { status: 400 });
                }
                try {
                    const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
                    if (users.length === 0) {
                        return NextResponse.json({ message: '該電子郵件地址未註冊' }, { status: 404 });
                    }

                    const newOtp = crypto.randomInt(100000, 999999).toString();
                    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 分鐘後過期

                    // 儲存明碼 OTP 到資料庫 (不安全 - 僅供開發)
                    await db.execute(
                        'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)',
                        [email, newOtp, expiresAt]
                    );

                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: '[您的應用程式名稱] 忘記密碼驗證碼',
                        html: `<p>您請求了重設您在 [您的應用程式名稱] 的密碼。</p><p>您的驗證碼是： <strong>${newOtp}</strong></p><p>請在 10 分鐘內使用此驗證碼設定您的新密碼。</p><p>如果您沒有請求重設密碼，請忽略此郵件。</p>`,
                    };

                    try {
                        const info = await transporter.sendMail(mailOptions);
                        console.log('郵件已發送:', info.response);
                        return NextResponse.json({ message: '驗證碼已發送到您的電子郵件' }, { status: 200 });
                    } catch (error) {
                        console.error('發送郵件失敗:', error);
                        return NextResponse.json({ message: '發送驗證碼郵件失敗，請稍後重試' }, { status: 500 });
                    }
                } catch (error) {
                    console.error('請求驗證碼時發生錯誤:', error);
                    return NextResponse.json({ message: '伺服器錯誤，請稍後重試' }, { status: 500 });
                }
                break;

            case 'verify-otp':
                if (!email || !otp || !/^\d{6}$/.test(otp)) {
                    return NextResponse.json({ message: '請提供電子郵件和有效的 6 位數驗證碼' }, { status: 400 });
                }
                try {
                    const [tokens] = await db.execute('SELECT token, expires_at FROM password_reset_tokens WHERE email = ?', [email]);
                    if (tokens.length === 0) {
                        return NextResponse.json({ message: '無效的電子郵件或驗證碼' }, { status: 400 });
                    }

                    const tokenData = tokens[0];
                    if (new Date(tokenData.expires_at).getTime() < Date.now()) {
                        return NextResponse.json({ message: '驗證碼已過期' }, { status: 400 });
                    }

                    // 比對明碼 OTP (不安全)
                    if (tokenData.token !== otp) {
                        return NextResponse.json({ message: '驗證碼錯誤' }, { status: 400 });
                    }

                    return NextResponse.json({ message: '驗證碼驗證成功，請設定新密碼' }, { status: 200 });
                } catch (error) {
                    console.error('驗證驗證碼時發生錯誤:', error);
                    return NextResponse.json({ message: '伺服器錯誤，請稍後重試' }, { status: 500 });
                }
                break;

            case 'reset-password':
                if (!email || !otp || !newPassword || newPassword.length < 6) {
                    return NextResponse.json({ message: '請提供電子郵件、驗證碼和長度至少為 6 個字元的新密碼' }, { status: 400 });
                }
                try {
                    const [tokens] = await db.execute('SELECT token, expires_at FROM password_reset_tokens WHERE email = ?', [email]);
                    if (tokens.length === 0) {
                        return NextResponse.json({ message: '無效的電子郵件或驗證碼' }, { status: 400 });
                    }

                    const tokenData = tokens[0];
                    if (new Date(tokenData.expires_at).getTime() < Date.now()) {
                        return NextResponse.json({ message: '驗證碼已過期' }, { status: 400 });
                    }

                    // 比對明碼 OTP (不安全)
                    if (tokenData.token !== otp) {
                        return NextResponse.json({ message: '驗證碼錯誤' }, { status: 400 });
                    }

                    // 直接儲存明碼密碼 (非常不安全)
                    const result = await db.execute('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);

                    if (result.affectedRows > 0) {
                        await db.execute('DELETE FROM password_reset_tokens WHERE email = ?', [email]);
                        return NextResponse.json({ message: '密碼已成功重設' }, { status: 200 });
                    } else {
                        return NextResponse.json({ message: '重設密碼失敗，請稍後重試' }, { status: 500 });
                    }
                } catch (error) {
                    console.error('重設密碼時發生錯誤:', error);
                    return NextResponse.json({ message: '伺服器錯誤，請稍後重試' }, { status: 500 });
                }
                break;

            default:
                return NextResponse.json({ message: '無效的操作類型' }, { status: 400 });
        }
    } finally {
        if (db && typeof db.end === 'function') {
            await db.end(); // 關閉資料庫連線 (如果您的 db.js 需要手動關閉)
        }
    }
}