import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { database } from '@/app/api/_lib/db'; // 引入您的資料庫物件

dotenv.config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('缺少必要的環境變量');
    process.exit(1);
}

export async function POST(request) {
    const { action, email, otp, newPassword } = await request.json();

    if (!action) {
        return NextResponse.json({ message: '缺少操作類型 (action)' }, { status: 400 });
    }
    console.log(`正在處理 ${action} 操作，用戶郵箱: ${email}`);

    try {
        switch (action) {
            case 'request-otp':
                if (!email || !/\S+@\S+\.\S+/.test(email)) {
                    return NextResponse.json({ message: '請輸入有效的電子郵件地址' }, { status: 400 });
                }
                try {
                    const [users] = await database.execute('SELECT user_id FROM users WHERE user_email = ?', [email]);
                    if (users && users.length === 0) {
                        return NextResponse.json({ message: '該電子郵件地址未註冊' }, { status: 404 });
                    }

                    // 生成 OTP
                    const newOtp = crypto.randomInt(100000, 999999).toString().padStart(6, '0');
                    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 分鐘後過期

                    // 儲存 OTP 到資料庫
                    await database.execute(
                        'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)',
                        [email, newOtp, expiresAt]
                    );

                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: '[毛孩之家] 忘記密碼驗證碼',
                        html: `<p>[毛孩之家] 密碼重設請先輸入驗證碼，您的驗證碼是： <strong>${newOtp}</strong>，請於十分鐘內完成驗證，若非本人請忽略此訊息。</p>`,
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
                    const [tokens] = await database.execute('SELECT token, expires_at FROM password_reset_tokens WHERE user_email = ?', [email]);
                    if (tokens && tokens.length === 0) {
                        return NextResponse.json({ message: '無效的電子郵件或驗證碼' }, { status: 400 });
                    }

                    const tokenData = tokens && tokens[0];
                    if (tokenData && new Date(tokenData.expires_at).getTime() < Date.now()) {
                        return NextResponse.json({ message: '驗證碼已過期' }, { status: 400 });
                    }

                    if (tokenData && tokenData.token !== otp) {
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
                    const [tokens] = await database.execute('SELECT token, expires_at FROM password_reset_tokens WHERE user_email = ?', [email]);
                    if (tokens && tokens.length === 0) {
                        return NextResponse.json({ message: '無效的電子郵件或驗證碼' }, { status: 400 });
                    }

                    const tokenData = tokens && tokens[0];
                    if (tokenData && new Date(tokenData.expires_at).getTime() < Date.now()) {
                        return NextResponse.json({ message: '驗證碼已過期' }, { status: 400 });
                    }

                    if (tokenData && tokenData.token !== otp) {
                        return NextResponse.json({ message: '驗證碼錯誤' }, { status: 400 });
                    }

                    const [result] = await database.execute('UPDATE users SET user_password = ? WHERE user_email = ?', [newPassword, email]);

                    if (result && result.affectedRows > 0) {
                        await database.execute('DELETE FROM password_reset_tokens WHERE email = ?', [email]);
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
    } catch (error) {
        console.error('處理請求時發生錯誤:', error);
        return NextResponse.json({ message: '伺服器錯誤，請稍後重試' }, { status: 500 });
    }
} 
