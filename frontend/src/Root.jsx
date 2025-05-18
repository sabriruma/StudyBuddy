import { Outlet, Link } from 'react-router-dom';
import './Root.css';

export function Root() {
    return (
        <div>
            <nav className="navbar">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/matching" className="nav-link">Matching</Link>
                <Link to="/chat" className="nav-link">Chat</Link>
            </nav>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}