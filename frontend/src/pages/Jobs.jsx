import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobs } from "../services/api";

function Jobs() {

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadJobs();
    }, []);

    async function loadJobs() {
        try {
            const data = await getJobs();
            setJobs(data);
        } catch (err) {
            setError("Unable to load jobs. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="jobs-page">

            <section className="page-header">
                <div>
                    <p className="hero-label">
                        EMPLOYMENT OPPORTUNITIES
                    </p>

                    <h1>Available Jobs</h1>

                    <p>
                        Explore employment opportunities available
                        through the PGRKAM portal.
                    </p>
                </div>
            </section>

            <section className="jobs-container">

                {loading && (
                    <p className="status-message">
                        Loading available jobs...
                    </p>
                )}

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                {!loading && !error && jobs.length === 0 && (
                    <p className="status-message">
                        No jobs are currently available.
                    </p>
                )}

                <div className="jobs-grid">

                    {jobs.map((job) => (
                        <article className="job-card" key={job.id}>

                            <div className="job-card-header">
                                <h2>{job.title}</h2>
                                <span>{job.organization}</span>
                            </div>

                            <div className="job-info">
                                <p>
                                    <strong>Location:</strong>{" "}
                                    {job.location}
                                </p>

                                <p>
                                    <strong>Education:</strong>{" "}
                                    {job.educationRequirement}
                                </p>

                                <p>
                                    <strong>Experience:</strong>{" "}
                                    {job.experienceRequirement} years
                                </p>
                            </div>

                            <div className="job-skills">
                                {job.requiredSkills}
                            </div>

                            <Link
                                to={`/jobs/${job.id}`}
                                className="primary-button"
                            >
                                View Details
                            </Link>

                        </article>
                    ))}

                </div>

            </section>

        </main>
    );
}

export default Jobs;