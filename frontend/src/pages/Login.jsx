import { useState } from "react";

function Login() {

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
    }

    async function handleSubmit(event) {
    event.preventDefault();

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

            setMessage("Login successful!");

            window.location.href = "/profile";

        } else {

            const errorMessage = await response.text();

            setMessage(errorMessage);
        }

    } catch (error) {

        console.error("Login error:", error);

        setMessage("Unable to connect to the server.");
    }
}

    return (

        <main className="auth-page">

            <div className="auth-container">

                <div className="auth-header">

                    <p className="hero-label">
                        PGRKAM EMPLOYMENT SERVICES
                    </p>

                    <h1>Sign In</h1>

                    <p>
                        Sign in to access your profile,
                        applications and employment services.
                    </p>

                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="primary-button auth-submit"
                    >
                        Login
                    </button>

                    {message && (
                        <p className="status-message">
                            {message}
                        </p>
                    )}

                </form>

            </div>

        </main>
    );
}

export default Login;