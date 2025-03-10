import '../styles/globals.css';
import { ArticleProvider } from '../context/ArticleContext';

function MyApp({ Component, pageProps }) {
  return (
    <ArticleProvider>
      <Component {...pageProps} />
    </ArticleProvider>
  );
}

export default MyApp;