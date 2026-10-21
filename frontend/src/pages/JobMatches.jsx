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
                    setError(
                        "Please log in to view your job matches."
                    );
                    setLoading(false);
                    return;
                }

                const data = await getJobMatches(
                    loggedInUser.id
                );

                setMatches(data.matches || []);
            } catch (err) {
                console.error(
                    "Error loading job matches:",
                    err
                );

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

            {/* Page Header */}
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

            {/* Job Matches */}
            <section className="jobs-container">

                {loading && (
                    <p className="status-message">
                        Finding jobs that match your profile...
                    </p>
                )}

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                {!loading &&
                    !error &&
                    matches.length === 0 && (
                        <p className="status-message">
                            No matching jobs found. Update your
                            profile or upload a resume and try again.
                        </p>
                    )}

                {!loading &&
                    !error &&
                    matches.length > 0 && (
                        <div className="jobs-grid">

                            {matches.map((match) => {

                                const jobId =
                                    match.jobId ?? match.id;

                                const matchingSkills =
                                    match.matchingSkills || [];

                                const missingSkills =
                                    match.missingSkills || [];

                                return (
                                    <article
                                        className="job-card"
                                        key={jobId}
                                    >

                                        {/* Job title and score */}
                                        <div className="job-card-header">

                                            <h2>
                                                {match.title}
                                            </h2>

                                            <span>
                                                Match:{" "}
                                                {(
                                                    Number(
                                                        match.finalScore || 0
                                                    ) * 100
                                                ).toFixed(1)}
                                                %
                                            </span>

                                        </div>

                                        <p>
                                            Job ID: {jobId}
                                        </p>

                                        {/* Explainability */}
                                        <div className="match-explanation">

                                            <h3>
                                                Why this job matches
                                            </h3>

                                            {/* Matching skills */}
                                            {matchingSkills.length > 0 ? (
                                                <>
                                                    <p>
                                                        Matching skills:
                                                    </p>

                                                    <ul>
                                                        {matchingSkills.map(
                                                            (skill) => (
                                                                <li
                                                                    key={skill}
                                                                >
                                                                    {skill}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </>
                                            ) : (
                                                <p>
                                                    No direct skill matches
                                                    were identified.
                                                </p>
                                            )}

                                            {/* Missing skills */}
                                            <h3>
                                                Skills to improve
                                            </h3>

                                            {missingSkills.length > 0 ? (
                                                <>
                                                    <p>
                                                        Skills required by
                                                        this job that were
                                                        not found:
                                                    </p>

                                                    <ul>
                                                        {missingSkills.map(
                                                            (skill) => (
                                                                <li
                                                                    key={skill}
                                                                >
                                                                    {skill}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </>
                                            ) : (
                                                <p>
                                                    You have all the listed
                                                    required skills.
                                                </p>
                                            )}

                                            {/* Matching basis */}
                                            <p>
                                                Match based on your manually
                                                entered profile skills and
                                                skills extracted from your
                                                uploaded resume.
                                            </p>

                                            {/* Hybrid algorithm details */}
                                            <p>
                                                Final match score combines
                                                TF-IDF similarity, SBERT
                                                semantic similarity, and
                                                skill coverage.
                                            </p>

                                        </div>

                                        {/* Job details */}
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
                    )}

            </section>

        </main>
    );
}

export default JobMatches;