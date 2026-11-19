
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

    return (
        <main className="auth-page">
            <div className="auth-container">

                <div className="auth-header">
                    <p className="hero-label">
                        PGRKAM EMPLOYMENT SERVICES
                    </p>

                    <h1>Forgot Password?</h1>

                    <p>
                        {step === 1 &&
                            "Enter your registered email address to receive a password reset OTP."}

                        {step === 2 &&
                            "Enter the six-digit OTP sent to your email address."}

                        {step === 3 &&
                            "Create a new password for your account."}
                    </p>
                </div>

                {step === 1 && (
                    <form
                        className="auth-form"
                        onSubmit={handleRequestOtp}
                    >
                        <div className="form-group">
                            <label htmlFor="email">
                                Email Address
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
                            className="primary-button auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form
                        className="auth-form"
                        onSubmit={handleVerifyOtp}
                    >
                        <div className="form-group">
                            <label htmlFor="otp">
                                Enter OTP
                            </label>

                            <input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                maxLength="6"
                                value={otp}
                                onChange={(event) =>
                                    setOtp(event.target.value.replace(/\D/g, ""))
                                }
                                placeholder="Enter 6-digit OTP"
                                required
                            />
                        </div>
                        <p className="otp-expiry-note">
                            Your OTP is valid for 5 minutes.
                        </p>

                        <button
                            type="submit"
                            className="primary-button auth-submit"
                            disabled={loading || otp.length !== 6}
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => {
                                setStep(1);
                                setOtp("");
                                setMessage("");
                                setError("");
                            }}
                        >
                            Change Email
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form
                        className="auth-form"
                        onSubmit={handleResetPassword}
                    >
                        <div className="form-group">
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
                                required
                            />
                        </div>

                        <div className="form-group">
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
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="primary-button auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Resetting Password..." : "Reset Password"}
                        </button>
                    </form>
                )}

                {message && (
                    <p className="status-message">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <div className="forgot-back-link">
                    <Link to="/login">
                        Back to Login
                    </Link>
                </div>

            </div>
        </main>
    );
}

export default ForgotPassword;
