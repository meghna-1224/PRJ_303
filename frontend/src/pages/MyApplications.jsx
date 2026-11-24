
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthHeaders } from "../services/api";

function getLoggedInUser() {
    try {
        return JSON.parse(localStorage.getItem("loggedInUser") || "null");
    } catch {
        return null;
    }
}

function formatDate(value) {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function getStatusClass(status) {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "APPLIED") return "applications-v2-status-applied";
    if (normalized === "SHORTLISTED") return "applications-v2-status-shortlisted";
    if (normalized === "REJECTED") return "applications-v2-status-rejected";

    return "applications-v2-status-default";
}

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadApplications() {
            try {
                const loggedInUser = getLoggedInUser();

                if (!loggedInUser?.id) {
                    if (isMounted) {
                        setError("Please log in to view your applications.");
                        setLoading(false);
                    }
                    return;
                }

                const response = await fetch(
                    `http://localhost:8080/api/applications/user/${loggedInUser.id}`,
                    {
                        headers: getAuthHeaders()
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to load applications.");
                }

                const data = await response.json();

                if (isMounted) {
                    setApplications(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Application loading error:", err);

                if (isMounted) {
                    setError("Unable to load your applications. Please try again.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadApplications();

        return () => {
            isMounted = false;
        };
    }, []);

    const sortedApplications = [...applications].sort((a, b) => {
        const dateA = new Date(a.appliedAt || 0).getTime();
        const dateB = new Date(b.appliedAt || 0).getTime();

        return dateB - dateA;
    });

    const appliedCount = applications.filter(
        (application) =>
            String(application.status || "").toUpperCase() === "APPLIED"
    ).length;

    const shortlistedCount = applications.filter(
        (application) =>
            String(application.status || "").toUpperCase() === "SHORTLISTED"
    ).length;

    const rejectedCount = applications.filter(
        (application) =>
            String(application.status || "").toUpperCase() === "REJECTED"
    ).length;

    if (loading) {
        return (
            <main className="applications-v2-page">
                <div className="applications-v2-loading">
                    <div className="applications-v2-loader" />
                    <p>Loading your applications...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="applications-v2-page">

            {/* Page header */}
            <section className="applications-v2-hero">
                <div className="applications-v2-hero-inner">
                    <span className="applications-v2-eyebrow">
                        PGRKAM EMPLOYMENT SERVICES
                    </span>

                    <h1>My Applications</h1>

                    <p>
                        Keep track of the employment opportunities you have
                        applied for and stay updated on your application status.
                    </p>

                    <Link to="/jobs" className="applications-v2-hero-button">
                        Explore More Jobs →
                    </Link>
                </div>
            </section>

            <section className="applications-v2-container">

                {error && (
                    <div className="applications-v2-error">
                        {error}
                        {error.startsWith("Please log in") && (
                            <Link to="/login">Login to Continue →</Link>
                        )}
                    </div>
                )}

                {!error && (
                    <>
                        {/* Statistics */}
                        <div className="applications-v2-heading">
                            <div>
                                <span className="applications-v2-eyebrow">
                                    APPLICATION OVERVIEW
                                </span>
                                <h2>Your Activity</h2>
                            </div>

                            <span className="applications-v2-total-label">
                                {applications.length} application
                                {applications.length === 1 ? "" : "s"} in total
                            </span>
                        </div>

                        <div className="applications-v2-stats">
                            <div className="applications-v2-stat-card">
                                <div className="applications-v2-stat-icon stat-blue">
                                    ▤
                                </div>
                                <div>
                                    <span>Total Applications</span>
                                    <strong>{applications.length}</strong>
                                    <small>All submitted applications</small>
                                </div>
                            </div>

                            <div className="applications-v2-stat-card">
                                <div className="applications-v2-stat-icon stat-mint">
                                    ✓
                                </div>
                                <div>
                                    <span>Applied</span>
                                    <strong>{appliedCount}</strong>
                                    <small>Applications submitted</small>
                                </div>
                            </div>

                            <div className="applications-v2-stat-card">
                                <div className="applications-v2-stat-icon stat-purple">
                                    ★
                                </div>
                                <div>
                                    <span>Shortlisted</span>
                                    <strong>{shortlistedCount}</strong>
                                    <small>Applications shortlisted</small>
                                </div>
                            </div>

                            <div className="applications-v2-stat-card">
                                <div className="applications-v2-stat-icon stat-orange">
                                    ×
                                </div>
                                <div>
                                    <span>Rejected</span>
                                    <strong>{rejectedCount}</strong>
                                    <small>Applications rejected</small>
                                </div>
                            </div>
                        </div>

                        {/* Application list */}
                        <div className="applications-v2-heading applications-v2-list-heading">
                            <div>
                                <span className="applications-v2-eyebrow">
                                    YOUR SUBMISSIONS
                                </span>
                                <h2>Application History</h2>
                            </div>
                        </div>

                        {applications.length === 0 ? (
                            <div className="applications-v2-empty">
                                <div className="applications-v2-empty-icon">▤</div>
                                <h2>No Applications Yet</h2>
                                <p>
                                    You haven't applied for any employment
                                    opportunities yet. Explore available jobs
                                    and find an opportunity that matches your skills.
                                </p>
                                <Link to="/jobs" className="applications-v2-button">
                                    Browse Jobs →
                                </Link>
                            </div>
                        ) : (
                            <div className="applications-v2-list">
                                {sortedApplications.map((application, index) => {
                                    const job = application.job || {};
                                    const status = application.status || "PENDING";

                                    return (
                                        <article
                                            className="applications-v2-card"
                                            key={application.id || index}
                                        >
                                            <div className="applications-v2-card-top">
                                                <div className="applications-v2-job-heading">
                                                    <div className="applications-v2-job-icon">
                                                        {job.title?.charAt(0)?.toUpperCase() || "J"}
                                                    </div>

                                                    <div>
                                                        <span className="applications-v2-card-label">
                                                            APPLICATION #{index + 1}
                                                        </span>

                                                        <h3>
                                                            {job.title || "Job Opportunity"}
                                                        </h3>

                                                        <p>
                                                            {job.organization || "Organization not specified"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`applications-v2-status ${getStatusClass(status)}`}
                                                >
                                                    {status.replaceAll("_", " ")}
                                                </span>
                                            </div>

                                            <div className="applications-v2-card-details">
                                                <div>
                                                    <span>Location</span>
                                                    <strong>
                                                        {job.location || "Not specified"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Applied On</span>
                                                    <strong>
                                                        {formatDate(application.appliedAt)}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Job Type</span>
                                                    <strong>Employment Opportunity</strong>
                                                </div>
                                            </div>

                                            <div className="applications-v2-card-footer">
                                                <span>
                                                    <span className="applications-v2-status-dot" />
                                                    Application recorded
                                                </span>

                                                {job.id ? (
                                                    <Link
                                                        to={`/jobs/${job.id}`}
                                                        className="applications-v2-view-link"
                                                    >
                                                        View Job Details →
                                                    </Link>
                                                ) : (
                                                    <span className="applications-v2-view-link-disabled">
                                                        Job details unavailable
                                                    </span>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                        {/* Bottom help section */}
                        <section className="applications-v2-help">
                            <div className="applications-v2-help-icon">ⓘ</div>
                            <div>
                                <h3>Looking for more opportunities?</h3>
                                <p>
                                    Explore available jobs or check your
                                    personalized recommendations to discover
                                    positions that match your profile.
                                </p>
                            </div>

                            <div className="applications-v2-help-actions">
                                <Link to="/jobs">Find Jobs</Link>
                                <Link to="/job-matches">Recommended Jobs</Link>
                            </div>
                        </section>
                    </>
                )}
            </section>
        </main>
    );
}

export default MyApplications;
