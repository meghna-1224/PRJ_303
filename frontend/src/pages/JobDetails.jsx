import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getJobById } from "../services/api";

function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [applyMessage, setApplyMessage] = useState("");
    const [applying, setApplying] = useState(false);

    const loggedInUser = JSON.parse(
        localStorage.getItem("loggedInUser")
    );

    useEffect(() => {
        loadJob();
    }, [id]);

    async function loadJob() {
        try {
            const data = await getJobById(id);
            setJob(data);
        } catch (err) {
            setError("Unable to load job details.");
        } finally {
            setLoading(false);
        }
    }

    async function handleApply() {
        if (!loggedInUser) {
            navigate("/login");
            return;
        }

        if (!loggedInUser.id) {
            setApplyMessage(
                "Unable to identify your account. Please log in again."
            );
            return;
        }

        setApplying(true);
        setApplyMessage("");

        try {
            const response = await fetch(
                `http://localhost:8080/api/applications/apply?userId=${loggedInUser.id}&jobId=${job.id}`,
                {
                    method: "POST"
                }
            );

            if (response.ok) {
                setApplyMessage("Application submitted successfully!");
            } else {
    const message = await response.text();

    if (response.status === 409) {
        setApplyMessage(
            "You have already applied to this job."
        );
    } else {
        setApplyMessage(
            message || "Unable to submit application. Please try again."
        );
    }
}
        } catch (error) {
            console.error("Application error:", error);
            setApplyMessage(
                "Unable to connect to the server."
            );
        } finally {
            setApplying(false);
        }
    }

    if (loading) {
        return (
            <main className="job-details-page">
                <p className="status-message">
                    Loading job details...
                </p>
            </main>
        );
    }

    if (error || !job) {
        return (
            <main className="job-details-page">
                <p className="error-message">
                    {error || "Job not found."}
                </p>

                <Link
                    to="/jobs"
                    className="primary-button"
                >
                    Back to Jobs
                </Link>
            </main>
        );
    }

    return (
        <main className="job-details-page">

            <section className="page-header">
                <div>
                    <p className="hero-label">
                        EMPLOYMENT OPPORTUNITY
                    </p>

                    <h1>{job.title}</h1>

                    <p>
                        {job.organization} · {job.location}
                    </p>
                </div>
            </section>

            <section className="job-details-container">

                <div className="job-details-main">

                    <div className="details-section">
                        <h2>Job Description</h2>
                        <p>{job.description}</p>
                    </div>

                    <div className="details-section">
                        <h2>Eligibility</h2>

                        <p>
                            <strong>Education:</strong>{" "}
                            {job.educationRequirement}
                        </p>

                        <p>
                            <strong>Experience:</strong>{" "}
                            {job.experienceRequirement} years
                        </p>
                    </div>

                    <div className="details-section">
                        <h2>Required Skills</h2>
                        <p>{job.requiredSkills}</p>
                    </div>

                    <div className="details-section">
                        <h2>Additional Information</h2>

                        <p>
                            <strong>Salary:</strong>{" "}
                            ₹{job.salary}
                        </p>

                        <p>
                            <strong>Location:</strong>{" "}
                            {job.location}
                        </p>

                        <p>
                            <strong>Application Deadline:</strong>{" "}
                            {job.deadline}
                        </p>
                    </div>

                </div>

                <aside className="application-panel">

                    <h2>
                        Interested in this opportunity?
                    </h2>

                    {!loggedInUser ? (
                        <>
                            <p>
                                Sign in to your PGRKAM account
                                to apply for this position.
                            </p>

                            <Link
                                to="/login"
                                className="primary-button"
                            >
                                Login to Apply
                            </Link>

                            <Link
                                to="/register"
                                className="secondary-button"
                            >
                                Create Account
                            </Link>
                        </>
                    ) : (
                        <>
                            <p>
                                You are signed in as{" "}
                                <strong>
                                    {loggedInUser.name ||
                                        loggedInUser.email}
                                </strong>
                            </p>

                            <button
                                type="button"
                                className="primary-button"
                                onClick={handleApply}
                                disabled={applying}
                            >
                                {applying
                                    ? "Applying..."
                                    : "Apply Now"}
                            </button>

                            {applyMessage && (
                                <p className="status-message">
                                    {applyMessage}
                                </p>
                            )}

                            {applyMessage ===
                                "Application submitted successfully!" && (
                                <Link
                                    to="/applications"
                                    className="secondary-button"
                                >
                                    View My Applications
                                </Link>
                            )}
                        </>
                    )}

                </aside>

            </section>

        </main>
    );
}

export default JobDetails;