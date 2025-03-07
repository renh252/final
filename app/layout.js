import localFont from 'next/font/local'
import Menubar from './_components/menubar'
import Footer from './_components/footer'
import BannerWrapper from './_components/banner-wrapper'
import { Container } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'

const fontIansui = localFont({
  src: '../public/fonts/Iansui-Regular.ttf',
  variable: '--font-iansui',
  weight: '100 900',
})

export const metadata = {
  title: '毛孩之家',
  description:
    '這是一個寵物領養網站，旨在提供寵物領養服務，讓更多毛孩能有溫暖的家。',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-hant-tw">
      <body
        className={`${fontIansui.variable}`}
        style={{
          display: 'flex',
          'flex-direction': 'column',
          minHeight: '100vh',
        }}
      >
        <Menubar />
        <BannerWrapper />
        <Container fluid="lg" className="flex-grow-1 px-3 py-4">
          {children}
        </Container>
        <Footer />
      </body>
    </html>
  )
}
