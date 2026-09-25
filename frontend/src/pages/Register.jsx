import { useState } from "react";
import { registerUser } from "../services/api";

function Register() {

    const [formData, setFormData] = useState({
        name: "",
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

        await registerUser(formData);

        setMessage("Account created successfully!");

    } catch (error) {

        setMessage(
            "Registration failed. Please try again."
        );

    }
}

    return (
        <main className="auth-page">

            <div className="auth-container">

                <div className="auth-header">
                    <p className="hero-label">
                        PGRKAM EMPLOYMENT SERVICES
                    </p>

                    <h1>Create Your Account</h1>

                    <p>
                        Register to explore employment opportunities,
                        manage your profile and track applications.
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label htmlFor="name">
                            Full Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

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
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="primary-button auth-submit"
                    >
                        Create Account
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

export default Register;