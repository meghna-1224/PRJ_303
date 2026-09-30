
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobMatches } from "../services/api";

function JobMatches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadMatches() {
            try {
                const loggedInUser = JSON.parse(
                    localStorage.getItem("loggedInUser")
                );

                if (!loggedInUser || !loggedInUser.id) {
                    setError("Please log in to view your job matches.");
                    return;
                }

                const data = await getJobMatches(loggedInUser.id);

                setMatches(data.matches || []);
            } catch (err) {
                console.error(err);
                setError(
                    "Unable to load job matches. Please try again."
                );
            } finally {
                setLoading(false);
            }
        }

        loadMatches();
    }, []);

    return (
        <main className="jobs-page">
            <section className="page-header">
                <div>
                    <p className="hero-label">
                        PGRKAM EMPLOYMENT SERVICES
                    </p>

                    <h1>Recommended Jobs</h1>

                    <p>
                        Explore employment opportunities ranked
                        according to your skills and profile.
                    </p>
                </div>
            </section>

            <section className="jobs-container">
                {loading && (
                    <p className="status-message">
                        Finding jobs that match your profile...
                    </p>
                )}

                {error && (
                    <p className="error-message">{error}</p>
                )}

                {!loading && !error && matches.length === 0 && (
                    <p className="status-message">
                        No matching jobs found. Update your
                        profile with your skills and try again.
                    </p>
                )}

                <div className="jobs-grid">
    {matches.map((match) => {
        const jobId = match.jobId ?? match.id;

        return (
            <article
                className="job-card"
                key={jobId}
            >
                <div className="job-card-header">
                    <h2>{match.title}</h2>

                    <span>
                        Match:{" "}
                        {(match.similarityScore * 100).toFixed(1)}%
                    </span>
                </div>

                <p>Job ID: {jobId}</p>

                <p>
                    Based on your profile and required job skills.
                </p>

                <Link
                    to={`/jobs/${jobId}`}
                    className="primary-button"
                >
                    View Details
                </Link>
            </article>
        );
    })}
</div>
            </section>
        </main>
    );
}

export default JobMatches;