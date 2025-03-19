import '../styles/globals.css'
import { EditorProvider } from '../context/EditorContext'

function MyApp({ Component, pageProps }) {
  return (
    <EditorProvider>
      <Component {...pageProps} />
    </EditorProvider>
  )
}

export default MyApp