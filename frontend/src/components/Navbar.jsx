import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("loggedInUser");

        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch {
                return null;
            }
        }

        return null;
    });

    const [dropdownOpen, setDropdownOpen] = useState(false);

    function handleLogout() {
        localStorage.removeItem("loggedInUser");
        setUser(null);
        setDropdownOpen(false);
        navigate("/");
    }

    return (
        <header className="navbar">

            <div className="navbar-container">

                {/* BRAND */}
                <Link to="/" className="brand">

                    <div className="brand-title">
                        PGRKAM
                    </div>

                    <div className="brand-subtitle">
                        Punjab Government Employment Services
                    </div>

                </Link>


                {/* MAIN NAVIGATION */}
                <nav className="nav-links">

                    <Link to="/">
                        Home
                    </Link>

                    <Link to="/jobs">
                        Jobs
                    </Link>

                    <Link to="/">
                        Employment Services
                    </Link>

                    <Link to="/">
                        About Us
                    </Link>

                </nav>


                {/* ACCOUNT AREA */}
                <div className="nav-actions">

                    {user ? (

                        <div className="profile-menu">

                            <button
                                className="profile-button"
                                onClick={() =>
                                    setDropdownOpen(!dropdownOpen)
                                }
                            >

                                <span className="profile-avatar">
                                    {user.name
                                        ? user.name
                                            .charAt(0)
                                            .toUpperCase()
                                        : "U"}
                                </span>

                                <span className="profile-name">
                                    {user.name}
                                </span>

                                <span className="profile-arrow">
                                    {dropdownOpen ? "▲" : "▼"}
                                </span>

                            </button>


                            {dropdownOpen && (

                                <div className="profile-dropdown">

                                    <div className="dropdown-user">

                                        <strong>
                                            {user.name}
                                        </strong>

                                        <span>
                                            {user.email}
                                        </span>

                                    </div>


                                    <div className="dropdown-divider"></div>


                                    <Link
                                        to="/profile"
                                        onClick={() =>
                                            setDropdownOpen(false)
                                        }
                                    >
                                        My Profile
                                    </Link>


                                    <Link
                                        to="/applications"
                                        onClick={() =>
                                            setDropdownOpen(false)
                                        }
                                    >
                                        My Applications
                                    </Link>


                                    <button
                                        className="logout-button"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>

                                </div>

                            )}

                        </div>

                    ) : (

                        <>
                            <Link
                                to="/login"
                                className="login-button"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="register-button"
                            >
                                Register
                            </Link>
                        </>

                    )}

                </div>

            </div>

        </header>
    );
}

export default Navbar;