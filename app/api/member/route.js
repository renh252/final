//會員登入功能
import { verifyCredentials } from '../../lib/auth'; // 假設您有一個驗證憑證的函數

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      const user = await verifyCredentials(email, password); // 驗證憑證

      if (user) {
        // 在這裡，您可以生成一個 JWT 或設置一個 session cookie
        // 為了簡單起見，我們只返回一個成功響應
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}