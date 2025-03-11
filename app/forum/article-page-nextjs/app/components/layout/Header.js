import Link from 'next/link';

const Header = () => {
    return (
        <header className="header">
            <div className="container">
                <h1 className="logo">
                    <Link href="/">My Blog</Link>
                </h1>
                <nav className="navigation">
                    <ul>
                        <li>
                            <Link href="/">Home</Link>
                        </li>
                        <li>
                            <Link href="/about">About</Link>
                        </li>
                        <li>
                            <Link href="/contact">Contact</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;