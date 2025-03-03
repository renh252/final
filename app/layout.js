// import '@/styles/globals.css'

// 3.在最外(上)層元件階層包裹提供者元件，讓父母元件可以提供它
// import Providers from './providers'

export const metadata = {
  title: '毛孩之家',
  description: '網站描述xxxx',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
