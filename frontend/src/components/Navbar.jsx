
import { useEffect, useState } from "react";
import {
    NavLink,
    Link,
    useNavigate,
    useLocation
} from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("loggedInUser")) || null;
        } catch {
            return null;
        }
    });

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Keep the navbar updated after navigation/login
    useEffect(() => {
        try {
            setUser(
                JSON.parse(localStorage.getItem("loggedInUser")) || null
            );
        } catch {
            setUser(null);
        }

        setDropdownOpen(false);
        setMobileOpen(false);
    }, [location.pathname]);

    function closeMenus() {
        setDropdownOpen(false);
        setMobileOpen(false);
    }

    function handleLogout() {
        localStorage.removeItem("loggedInUser");
        setUser(null);
        closeMenus();
        navigate("/");
    }

    const navClass = ({ isActive }) =>
        `site-nav-link ${isActive ? "active" : ""}`;

    return (
        <header className="site-navbar">
            <div className="site-navbar-container">

                {/* BRAND */}
                <Link to="/" className="site-brand" onClick={closeMenus}>
                    <span className="site-brand-name">PGRKAM</span>
                    <span className="site-brand-subtitle">
                        Punjab Government Employment Services
                    </span>
                </Link>

                {/* MOBILE MENU BUTTON */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation"
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? "✕" : "☰"}
                </button>

                {/* NAVIGATION */}
                <nav className={`site-nav-links ${mobileOpen ? "mobile-open" : ""}`}>

                    <NavLink to="/" end className={navClass} onClick={closeMenus}>
                        Home
                    </NavLink>

                    <NavLink to="/jobs" className={navClass} onClick={closeMenus}>
                        Find Jobs
                    </NavLink>

                    {user && (
                        <NavLink
                            to="/job-matches"
                            className={navClass}
                            onClick={closeMenus}
                        >
                            Recommended Jobs
                        </NavLink>
                    )}

                    {/* MOBILE ACCOUNT LINKS */}
                    {user && (
                        <div className="mobile-account-links">
                            <Link to="/dashboard" onClick={closeMenus}>Dashboard</Link>
                            <Link to="/profile" onClick={closeMenus}>My Profile</Link>
                            <Link to="/applications" onClick={closeMenus}>My Applications</Link>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    )}

                    {!user && (
                        <div className="mobile-account-links">
                            <Link to="/login" onClick={closeMenus}>Login</Link>
                            <Link to="/register" onClick={closeMenus}>Register</Link>
                        </div>
                    )}
                </nav>

                {/* ACCOUNT AREA */}
                <div className="site-account-area">
                    {user ? (
                        <div className="site-profile-menu">

                            <button
                                className="site-profile-button"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <span className="site-avatar">
                                    {user.name
                                        ? user.name.charAt(0).toUpperCase()
                                        : "U"}
                                </span>

                                <span className="site-profile-name">
                                    {user.name || "User"}
                                </span>

                                <span className="site-profile-arrow">
                                    {dropdownOpen ? "▲" : "▼"}
                                </span>
                            </button>

                            {dropdownOpen && (
                                <div className="site-profile-dropdown">

                                    <div className="site-dropdown-user">
                                        <strong>{user.name || "User"}</strong>
                                        <span>{user.email}</span>
                                    </div>

                                    <div className="site-dropdown-divider" />

                                    <Link to="/dashboard" onClick={closeMenus}>
                                        Dashboard
                                    </Link>

                                    <Link to="/profile" onClick={closeMenus}>
                                        My Profile
                                    </Link>

                                    <Link to="/applications" onClick={closeMenus}>
                                        My Applications
                                    </Link>

                                    <button
                                        className="site-logout-button"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="site-auth-buttons">
                            <Link to="/login" className="site-login-button">
                                Login
                            </Link>

                            <Link to="/register" className="site-register-button">
                                Register
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}

export default Navbar;
