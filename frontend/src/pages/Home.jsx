
import { useState } from "react";
import { Link } from "react-router-dom";

function Home() {
    const [showUpdates, setShowUpdates] = useState(
        () => sessionStorage.getItem("pgrkamUpdatesDismissed") !== "true"
    );

    const loggedInUser = JSON.parse(
        localStorage.getItem("loggedInUser") || "null"
    );

    function closeUpdates() {
        sessionStorage.setItem("pgrkamUpdatesDismissed", "true");
        setShowUpdates(false);
    }

    const services = [
        {
            icon: "⌕",
            title: "Explore Jobs",
            description: "Discover employment opportunities across different sectors and locations.",
            link: "/jobs",
            color: "blue"
        },
        {
            icon: "◎",
            title: "Build Your Profile",
            description: "Add your educational qualifications, skills and work experience.",
            link: "/profile",
            color: "mint"
        },
        {
            icon: "✧",
            title: "Recommended Jobs",
            description: "Discover opportunities matched to your skills and qualifications.",
            link: "/job-matches",
            color: "lavender"
        },
        {
            icon: "▤",
            title: "Track Applications",
            description: "View your submitted job applications and their current status.",
            link: "/applications",
            color: "peach"
        }
    ];

    return (
        <main className="home-page">

            {/* Announcement strip */}
            <div className="home-announcement">
                <div className="home-announcement-inner">
                    <span className="announcement-badge">NOTICE</span>
                    <p>
                        Welcome to Punjab Government Employment Services.
                        Explore the latest employment opportunities.
                    </p>
                    <button onClick={() => setShowUpdates(true)}>
                        View Updates →
                    </button>
                </div>
            </div>

            {/* Hero section */}
            <section className="home-hero">
                <div className="home-hero-content">

                    <div className="home-hero-text">
                        <span className="home-eyebrow">
                            PUNJAB GOVERNMENT EMPLOYMENT SERVICES
                        </span>

                        <h1>
                            Your Career Journey
                            <br />
                            <span>Starts Here.</span>
                        </h1>

                        <p>
                            Discover employment opportunities, build your
                            professional profile and find jobs that match
                            your skills and qualifications through PGRKAM.
                        </p>

                        <div className="home-hero-actions">
                            <Link to="/jobs" className="home-primary-button">
                                Explore Opportunities →
                            </Link>

                            {!loggedInUser && (
                                <Link to="/register" className="home-secondary-button">
                                    Create an Account
                                </Link>
                            )}
                        </div>

                        <div className="home-trust-note">
                            <span>✓</span>
                            A single platform for employment services
                        </div>
                    </div>

                    <div className="home-hero-visual">
                        <div className="hero-visual-decoration decoration-one"></div>
                        <div className="hero-visual-decoration decoration-two"></div>

                        <div className="hero-feature-card">
                            <div className="hero-feature-icon">★</div>
                            <span>EMPLOYMENT SERVICES</span>
                            <h2>Find the right opportunity for your future.</h2>
                            <p>
                                Search jobs, manage your profile and receive
                                skill-based job recommendations.
                            </p>
                            <Link to="/jobs">Browse Available Jobs →</Link>
                        </div>

                        <div className="hero-floating-card">
                            <span>✓</span>
                            <div>
                                <strong>Personalised Matching</strong>
                                <p>Opportunities based on your skills</p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Quick services */}
            <section className="home-services">
                <div className="home-section-heading">
                    <span>OUR SERVICES</span>
                    <h2>Everything you need, in one place.</h2>
                    <p>
                        Access employment services and manage your career
                        journey through a single platform.
                    </p>
                </div>

                <div className="home-service-grid">
                    {services.map((service) => (
                        <Link
                            to={service.link}
                            className={`home-service-card ${service.color}`}
                            key={service.title}
                        >
                            <div className="home-service-icon">
                                {service.icon}
                            </div>

                            <h3>{service.title}</h3>
                            <p>{service.description}</p>

                            <span className="home-service-link">
                                Explore Service →
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="home-how-section">
                <div className="home-how-content">
                    <div>
                        <span className="home-eyebrow">GETTING STARTED</span>
                        <h2>Your next opportunity is just a few steps away.</h2>
                        <p>
                            Create your profile, explore employment
                            opportunities and discover jobs that align
                            with your qualifications and skills.
                        </p>

                        <Link to={loggedInUser ? "/profile" : "/register"}
                              className="home-primary-button">
                            {loggedInUser ? "Complete Your Profile →" : "Get Started →"}
                        </Link>
                    </div>

                    <div className="home-steps">
                        <div className="home-step">
                            <span>01</span>
                            <div>
                                <h3>Create Your Account</h3>
                                <p>Register and access your employment profile.</p>
                            </div>
                        </div>

                        <div className="home-step">
                            <span>02</span>
                            <div>
                                <h3>Build Your Profile</h3>
                                <p>Add your education, skills and resume.</p>
                            </div>
                        </div>

                        <div className="home-step">
                            <span>03</span>
                            <div>
                                <h3>Discover Opportunities</h3>
                                <p>Explore jobs and receive personalised recommendations.</p>
                            </div>
                        </div>

                        <div className="home-step">
                            <span>04</span>
                            <div>
                                <h3>Apply and Track</h3>
                                <p>Submit applications and monitor their status.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="home-footer-content">
                    <div>
                        <h2>PGRKAM</h2>
                        <p>Punjab Government Employment Services</p>
                    </div>

                    <div className="home-footer-links">
                        <Link to="/">Home</Link>
                        <Link to="/jobs">Find Jobs</Link>
                        <Link to="/profile">My Profile</Link>
                        <Link to="/login">Login</Link>
                    </div>
                </div>

                <div className="home-footer-bottom">
                    © {new Date().getFullYear()} PGRKAM Employment Portal
                    <span>Designed for employment assistance and services</span>
                </div>
            </footer>

            {/* Latest updates popup */}
            {showUpdates && (
                <div className="updates-overlay" onClick={closeUpdates}>
                    <div
                        className="updates-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="updates-close"
                            onClick={closeUpdates}
                            aria-label="Close updates"
                        >
                            ×
                        </button>

                        <div className="updates-modal-header">
                            <span className="updates-icon">✦</span>
                            <span>PORTAL INFORMATION</span>
                            <h2>Welcome to PGRKAM</h2>
                            <p>
                                Explore employment services and stay informed
                                about portal announcements.
                            </p>
                        </div>

                        <div className="updates-list">
                            <div className="update-item">
                                <span className="update-dot blue-dot"></span>
                                <div>
                                    <strong>Employment Opportunities</strong>
                                    <p>
                                        Explore available job openings and
                                        their eligibility requirements.
                                    </p>
                                </div>
                            </div>

                            <div className="update-item">
                                <span className="update-dot green-dot"></span>
                                <div>
                                    <strong>Profile and Resume</strong>
                                    <p>
                                        Complete your profile and upload your
                                        resume to receive job recommendations.
                                    </p>
                                </div>
                            </div>

                            <div className="update-item">
                                <span className="update-dot purple-dot"></span>
                                <div>
                                    <strong>Personalised Job Matching</strong>
                                    <p>
                                        Discover opportunities based on your
                                        qualifications and skills.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="updates-modal-actions">
                            <button
                                className="updates-dismiss"
                                onClick={closeUpdates}
                            >
                                Continue Browsing
                            </button>

                            {loggedInUser ? (
                                <Link to="/dashboard" className="updates-login"
                                      onClick={closeUpdates}>
                                    My Dashboard
                                </Link>
                            ) : (
                                <Link to="/login" className="updates-login"
                                      onClick={closeUpdates}>
                                    Login to Portal
                                </Link>
                            )}
                        </div>

                        {!loggedInUser && (
                            <p className="updates-register">
                                New here? <Link to="/register" onClick={closeUpdates}>
                                    Create an account
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            )}

        </main>
    );
}

export default Home;
