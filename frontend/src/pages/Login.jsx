
import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setMessage("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setLoading(true);
        setMessage("");
        setMessageType("");

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            if (response.ok) {
                const user = await response.json();

                console.log("Logged in user:", user);

                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(user)
                );

                setMessage("Login successful! Redirecting...");
                setMessageType("success");

                window.location.href = "/profile";
            } else {
                const errorMessage = await response.text();

                setMessage(
                    errorMessage || "Invalid email or password. Please try again."
                );
                setMessageType("error");
            }
        } catch (error) {
            console.error("Login error:", error);

            setMessage("Unable to connect to the server. Please try again.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-v2-page">

            <div className="auth-v2-background-shape auth-v2-shape-one" />
            <div className="auth-v2-background-shape auth-v2-shape-two" />

            <section className="auth-v2-layout">

                {/* Left information panel */}
                <div className="auth-v2-intro">
                    <div className="auth-v2-brand-mark">P</div>

                    <span className="auth-v2-intro-label">
                        PGRKAM EMPLOYMENT SERVICES
                    </span>

                    <h1>Welcome back!</h1>

                    <p>
                        Your next career opportunity could be just
                        around the corner. Sign in to continue your
                        employment journey with PGRKAM.
                    </p>

                    <div className="auth-v2-benefits">
                        <div>
                            <span className="auth-v2-benefit-icon">✓</span>
                            <span>Explore employment opportunities</span>
                        </div>

                        <div>
                            <span className="auth-v2-benefit-icon">✓</span>
                            <span>Discover jobs matching your skills</span>
                        </div>

                        <div>
                            <span className="auth-v2-benefit-icon">✓</span>
                            <span>Manage and track your applications</span>
                        </div>
                    </div>

                    <div className="auth-v2-intro-footer">
                        Punjab Government Employment Services
                    </div>
                </div>

                {/* Login form */}
                <div className="auth-v2-card">

                    <div className="auth-v2-card-heading">
                        <span className="auth-v2-eyebrow">
                            YOUR CAREER JOURNEY
                        </span>

                        <h2>Sign In</h2>

                        <p>
                            Enter your account details to access
                            your profile and employment services.
                        </p>
                    </div>

                    <form className="auth-v2-form" onSubmit={handleSubmit}>

                        <div className="auth-v2-form-group">
                            <label htmlFor="login-email">
                                Email Address
                            </label>

                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="auth-v2-form-group">
                            <label htmlFor="login-password">
                                Password
                            </label>

                            <div className="auth-v2-password-wrapper">
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="auth-v2-password-toggle"
                                    onClick={() => setShowPassword((previous) => !previous)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <div className="auth-v2-forgot-link">
                                <Link to="/forgot-password">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="auth-v2-submit"
                            disabled={loading}
                        >
                            {loading ? "Signing In..." : "Login to Your Account →"}
                        </button>

                        {message && (
                            <div
                                className={`auth-v2-message ${messageType}`}
                                role="status"
                            >
                                {message}
                            </div>
                        )}
                    </form>

                    <div className="auth-v2-card-footer">
                        Don't have an account?
                        <Link to="/register"> Create Account</Link>
                    </div>

                    <div className="auth-v2-security-note">
                        <span>ⓘ</span>
                        Your account information is securely handled.
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Login;
