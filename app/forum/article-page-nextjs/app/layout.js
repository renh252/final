'use client';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import './styles/globals.css';

const Layout = ({ children }) => {
    return (
        <div>
            <Header />
            <main>{children}</main>
            <Footer />
        </div>
    );
};

export default Layout;