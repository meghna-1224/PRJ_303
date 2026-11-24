
import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);

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
            await registerUser(formData);

            setMessage("Your account has been created successfully!");
            setMessageType("success");
            setRegistered(true);
        } catch (error) {
            console.error("Registration error:", error);

            setMessage(
                error.message || "Registration failed. Please try again."
            );
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

                    <h1>Start your career journey.</h1>

                    <p>
                        Create your account and take the first step
                        towards discovering employment opportunities
                        that match your qualifications and skills.
                    </p>

                    <div className="auth-v2-benefits">
                        <div>
                            <span className="auth-v2-benefit-icon">✓</span>
                            <span>Build your candidate profile</span>
                        </div>

                        <div>
                            <span className="auth-v2-benefit-icon">✓</span>
                            <span>Upload your resume and highlight your skills</span>
                        </div>

                        <div>
                            <span className="auth-v2-benefit-icon">✓</span>
                            <span>Find and apply for suitable jobs</span>
                        </div>
                    </div>

                    <div className="auth-v2-intro-footer">
                        Punjab Government Employment Services
                    </div>
                </div>

                {/* Registration form */}
                <div className="auth-v2-card">

                    <div className="auth-v2-card-heading">
                        <span className="auth-v2-eyebrow">
                            JOIN PGRKAM
                        </span>

                        <h2>Create Account</h2>

                        <p>
                            Register to explore opportunities,
                            manage your profile and track applications.
                        </p>
                    </div>

                    {registered ? (
                        <div className="auth-v2-registration-success">
                            <div className="auth-v2-success-icon">✓</div>

                            <h3>You're all set!</h3>

                            <p>{message}</p>

                            <Link
                                to="/login"
                                className="auth-v2-submit auth-v2-success-link"
                            >
                                Continue to Login →
                            </Link>
                        </div>
                    ) : (
                        <form className="auth-v2-form" onSubmit={handleSubmit}>

                            <div className="auth-v2-form-group">
                                <label htmlFor="register-name">
                                    Full Name
                                </label>

                                <input
                                    id="register-name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            <div className="auth-v2-form-group">
                                <label htmlFor="register-email">
                                    Email Address
                                </label>

                                <input
                                    id="register-email"
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
                                <label htmlFor="register-password">
                                    Password
                                </label>

                                <div className="auth-v2-password-wrapper">
                                    <input
                                        id="register-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a password"
                                        autoComplete="new-password"
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
                            </div>

                            <button
                                type="submit"
                                className="auth-v2-submit"
                                disabled={loading}
                            >
                                {loading ? "Creating Account..." : "Create Account →"}
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
                    )}

                    {!registered && (
                        <div className="auth-v2-card-footer">
                            Already have an account?
                            <Link to="/login"> Sign In</Link>
                        </div>
                    )}

                    <div className="auth-v2-security-note">
                        <span>ⓘ</span>
                        Your account information is securely handled.
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Register;
