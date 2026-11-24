
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRequestOtp(event) {
        event.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/forgot-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                }
            );

            const data = await response.text();

            if (!response.ok) {
                throw new Error(data || "Unable to send OTP.");
            }

            setMessage(data);
            setStep(2);
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp(event) {
        event.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/verify-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, otp })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Invalid or expired OTP.");
            }

            if (!data.resetToken) {
                throw new Error("Reset authorization token was not received.");
            }

            setResetToken(data.resetToken);
            setMessage(data.message || "OTP verified successfully.");
            setStep(3);
        } catch (err) {
            setError(err.message || "Unable to verify OTP.");
        } finally {
            setLoading(false);
        }
    }

    async function handleResetPassword(event) {
        event.preventDefault();

        setMessage("");
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        resetToken,
                        newPassword
                    })
                }
            );

            const data = await response.text();

            if (!response.ok) {
                throw new Error(data || "Unable to reset password.");
            }

            setMessage("Password reset successfully!");

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            setError(err.message || "Unable to reset password.");
        } finally {
            setLoading(false);
        }
    }

    const stepDetails = [
        {
            number: "01",
            title: "Verify your email",
            description: "Enter your registered email address."
        },
        {
            number: "02",
            title: "Verify OTP",
            description: "Enter the six-digit code sent to you."
        },
        {
            number: "03",
            title: "Create password",
            description: "Choose a new password for your account."
        }
    ];

    return (
        <main className="auth-v2-page forgot-v2-page">
            <div className="auth-v2-background-shape auth-v2-shape-one"></div>
            <div className="auth-v2-background-shape auth-v2-shape-two"></div>

            <div className="auth-v2-layout forgot-v2-layout">

                {/* Left information panel */}
                <section className="auth-v2-intro forgot-v2-intro">
                    <div className="auth-v2-brand-mark">P</div>

                    <span className="auth-v2-intro-label">
                        ACCOUNT RECOVERY
                    </span>

                    <h1>Let's get you back on track.</h1>

                    <p>
                        Forgot your password? Don't worry. Follow these
                        simple steps to securely regain access to your
                        PGRKAM Employment Services account.
                    </p>

                    <div className="forgot-v2-steps">
                        {stepDetails.map((item, index) => (
                            <div
                                className={`forgot-v2-step ${
                                    step === index + 1
                                        ? "active"
                                        : step > index + 1
                                        ? "completed"
                                        : ""
                                }`}
                                key={item.number}
                            >
                                <div className="forgot-v2-step-number">
                                    {step > index + 1 ? "✓" : item.number}
                                </div>

                                <div>
                                    <strong>{item.title}</strong>
                                    <span>{item.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="auth-v2-intro-footer">
                        PGRKAM EMPLOYMENT SERVICES
                    </div>
                </section>

                {/* Right form card */}
                <section className="auth-v2-card forgot-v2-card">

                    <div className="forgot-v2-progress">
                        <div
                            className="forgot-v2-progress-fill"
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>

                    <div className="auth-v2-card-heading">
                        <span className="auth-v2-eyebrow">
                            STEP {step} OF 3
                        </span>

                        <h2>
                            {step === 1 && "Forgot Password?"}
                            {step === 2 && "Verify Your Email"}
                            {step === 3 && "Create New Password"}
                        </h2>

                        <p>
                            {step === 1 &&
                                "Enter your registered email address and we'll send you a password reset OTP."}

                            {step === 2 &&
                                `We've sent a six-digit verification code to ${email}. Enter it below to continue.`}

                            {step === 3 &&
                                "Your email has been verified. Set a new password for your account."}
                        </p>
                    </div>

                    {/* STEP 1: EMAIL */}
                    {step === 1 && (
                        <form
                            className="auth-v2-form"
                            onSubmit={handleRequestOtp}
                        >
                            <div className="auth-v2-form-group">
                                <label htmlFor="email">
                                    Registered Email Address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="Enter your registered email"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="auth-v2-submit"
                                disabled={loading}
                            >
                                {loading ? "Sending OTP..." : "Send OTP"}
                                {!loading && <span>→</span>}
                            </button>
                        </form>
                    )}

                    {/* STEP 2: OTP */}
                    {step === 2 && (
                        <form
                            className="auth-v2-form"
                            onSubmit={handleVerifyOtp}
                        >
                            <div className="auth-v2-form-group">
                                <label htmlFor="otp">
                                    Six-Digit Verification Code
                                </label>

                                <input
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(event) =>
                                        setOtp(
                                            event.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    placeholder="Enter 6-digit OTP"
                                    autoComplete="one-time-code"
                                    required
                                />

                                <span className="forgot-v2-field-note">
                                    Your OTP is valid for 5 minutes.
                                </span>
                            </div>

                            <button
                                type="submit"
                                className="auth-v2-submit"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                                {!loading && <span>→</span>}
                            </button>

                            <button
                                type="button"
                                className="forgot-v2-secondary-button"
                                onClick={() => {
                                    setStep(1);
                                    setOtp("");
                                    setMessage("");
                                    setError("");
                                }}
                            >
                                ← Change Email Address
                            </button>
                        </form>
                    )}

                    {/* STEP 3: NEW PASSWORD */}
                    {step === 3 && (
                        <form
                            className="auth-v2-form"
                            onSubmit={handleResetPassword}
                        >
                            <div className="auth-v2-form-group">
                                <label htmlFor="newPassword">
                                    New Password
                                </label>

                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(event.target.value)
                                    }
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="auth-v2-form-group">
                                <label htmlFor="confirmPassword">
                                    Confirm New Password
                                </label>

                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(event.target.value)
                                    }
                                    placeholder="Re-enter new password"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="auth-v2-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Resetting Password..."
                                    : "Reset Password"}
                                {!loading && <span>→</span>}
                            </button>
                        </form>
                    )}

                    {message && (
                        <p className="auth-v2-message success">
                            {message}
                        </p>
                    )}

                    {error && (
                        <p className="auth-v2-message error">
                            {error}
                        </p>
                    )}

                    <div className="auth-v2-card-footer">
                        Remembered your password?
                        <Link to="/login"> Back to Login</Link>
                    </div>

                    <div className="auth-v2-security-note">
                        <span>✓</span>
                        Secure password recovery
                    </div>
                </section>
            </div>
        </main>
    );
}

export default ForgotPassword;
