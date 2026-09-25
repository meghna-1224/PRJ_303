import { useEffect, useState } from "react";

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadApplications();
    }, []);

    async function loadApplications() {
        try {
            const loggedInUser = JSON.parse(
                localStorage.getItem("loggedInUser")
            );

            if (!loggedInUser || !loggedInUser.id) {
                setError("Please log in to view your applications.");
                setLoading(false);
                return;
            }

            const response = await fetch(
                `http://localhost:8080/api/applications/user/${loggedInUser.id}`
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load applications"
                );
            }

            const data = await response.json();

            setApplications(data);

        } catch (error) {
            console.error(
                "Application loading error:",
                error
            );

            setError(
                "Unable to load your applications."
            );
        } finally {
            setLoading(false);
        }
    }

    function getStatusClass(status) {
        if (status === "APPLIED") {
            return "status-applied";
        }

        if (status === "SHORTLISTED") {
            return "status-shortlisted";
        }

        if (status === "REJECTED") {
            return "status-rejected";
        }

        return "status-default";
    }

    if (loading) {
        return (
            <main className="applications-page">
                <div className="page-content">
                    <p className="status-message">
                        Loading your applications...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="applications-page">

            <section className="page-header">
                <div>

                    <p className="hero-label">
                        PGRKAM EMPLOYMENT SERVICES
                    </p>

                    <h1>My Applications</h1>

                    <p>
                        Track the employment opportunities
                        you have applied for and monitor
                        their application status.
                    </p>

                </div>
            </section>

            <section className="applications-container">

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {!error &&
                    applications.length === 0 && (
                        <div className="empty-state">

                            <h2>
                                No Applications Yet
                            </h2>

                            <p>
                                You have not applied for
                                any employment opportunities
                                yet.
                            </p>

                        </div>
                    )}

                {!error &&
                    applications.length > 0 && (
                        <div className="applications-list">

                            {applications.map(
                                (application) => (
                                    <article
                                        className="application-card"
                                        key={application.id}
                                    >

                                        <div className="application-card-header">

                                            <div>

                                                <p className="application-label">
                                                    APPLICATION
                                                </p>

                                                <h2>
                                                    {application.job?.title}
                                                </h2>

                                                <p className="organization-name">
                                                    {
                                                        application.job
                                                            ?.organization
                                                    }
                                                </p>

                                            </div>

                                            <span
                                                className={`application-status ${getStatusClass(
                                                    application.status
                                                )}`}
                                            >
                                                {application.status}
                                            </span>

                                        </div>

                                        <div className="application-details">

                                            <div>
                                                <strong>
                                                    Location
                                                </strong>

                                                <span>
                                                    {
                                                        application.job
                                                            ?.location
                                                    }
                                                </span>
                                            </div>

                                            <div>
                                                <strong>
                                                    Applied On
                                                </strong>

                                                <span>
                                                    {application.appliedAt
                                                        ? new Date(
                                                              application.appliedAt
                                                          ).toLocaleDateString()
                                                        : "N/A"}
                                                </span>
                                            </div>

                                            <div>
                                                <strong>
                                                    Job Type
                                                </strong>

                                                <span>
                                                    Employment Opportunity
                                                </span>
                                            </div>

                                        </div>

                                    </article>
                                )
                            )}

                        </div>
                    )}

            </section>

        </main>
    );
}

export default MyApplications;