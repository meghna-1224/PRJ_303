
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getJobMatches } from "../services/api";

// Convert skills into an array, whether the backend sends
// them as an array or a comma-separated string.
function normalizeSkillList(value) {
    if (Array.isArray(value)) {
        return value.filter(skill => typeof skill === "string");
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map(skill => skill.trim())
            .filter(Boolean);
    }

    return [];
}

// Convert decimal scores into percentages.
function formatPercent(value) {
    return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

function JobMatches() {
    const [matches, setMatches] = useState([]);
    const [algorithm, setAlgorithm] = useState("");
    const [candidateSkills, setCandidateSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortBy, setSortBy] = useState("highest");

    // Load personalised job recommendations.
    useEffect(() => {
        async function loadMatches() {
            try {
                const loggedInUser = JSON.parse(
                    localStorage.getItem("loggedInUser") || "null"
                );

                if (!loggedInUser?.id) {
                    setError("Please log in to view your job matches.");
                    return;
                }

                const data = await getJobMatches(loggedInUser.id);

                setMatches(
                    Array.isArray(data.matches) ? data.matches : []
                );

                setAlgorithm(
                    data.algorithm || "Hybrid Job Matching"
                );

                setCandidateSkills(
                    normalizeSkillList(data.candidateSkills)
                );

            } catch (err) {
                console.error("Error loading job matches:", err);

                setError(
                    err.message || "Unable to load job recommendations."
                );

            } finally {
                setLoading(false);
            }
        }

        loadMatches();
    }, []);

    // Sort recommendations.
    const sortedMatches = useMemo(() => {
        const result = [...matches];

        if (sortBy === "highest") {
            result.sort(
                (a, b) =>
                    Number(b.finalScore || 0) -
                    Number(a.finalScore || 0)
            );
        } else if (sortBy === "lowest") {
            result.sort(
                (a, b) =>
                    Number(a.finalScore || 0) -
                    Number(b.finalScore || 0)
            );
        }

        return result;
    }, [matches, sortBy]);

    // Calculate recommendation statistics.
    const topMatch = matches.length
        ? Math.max(
            ...matches.map(match => Number(match.finalScore || 0))
        )
        : 0;

    const averageMatch = matches.length
        ? matches.reduce(
            (total, match) =>
                total + Number(match.finalScore || 0),
            0
        ) / matches.length
        : 0;

    return (
        <main className="matches-page">

            {/* Page heading */}
            <section className="matches-heading">
                <div>
                    <p className="matches-eyebrow">
                        PGRKAM EMPLOYMENT SERVICES
                    </p>

                    <h1>Recommended Jobs</h1>

                    <p>
                        Discover employment opportunities ranked
                        according to your skills, qualifications
                        and professional profile.
                    </p>
                </div>

                <div className="matches-heading-icon">★</div>
            </section>

            {/* Loading */}
            {loading && (
                <div className="matches-message">
                    <div className="matches-loader"></div>

                    <h3>Finding opportunities for you...</h3>

                    <p>
                        Analysing your profile and matching your skills.
                    </p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="matches-message matches-error">
                    <h3>Unable to load recommendations</h3>

                    <p>{error}</p>

                    <Link
                        to="/login"
                        className="matches-primary-button"
                    >
                        Login
                    </Link>
                </div>
            )}

            {/* No matches */}
            {!loading && !error && matches.length === 0 && (
                <div className="matches-message">
                    <div className="matches-empty-icon">⌕</div>

                    <h3>No recommendations available yet</h3>

                    <p>
                        Complete your profile, add your skills and upload
                        your resume to receive personalised job matches.
                    </p>

                    <Link
                        to="/profile"
                        className="matches-primary-button"
                    >
                        Complete Your Profile
                    </Link>
                </div>
            )}

            {/* Results */}
            {!loading && !error && matches.length > 0 && (
                <section className="matches-content">

                    {/* Summary cards */}
                    <div className="matches-stats-grid">

                        <div className="matches-stat-card stat-blue">
                            <span className="matches-stat-icon">▤</span>
                            <p>Total Recommendations</p>
                            <h2>{matches.length}</h2>
                        </div>

                        <div className="matches-stat-card stat-green">
                            <span className="matches-stat-icon">✦</span>
                            <p>Best Match</p>
                            <h2>{formatPercent(topMatch)}</h2>
                        </div>

                        <div className="matches-stat-card stat-purple">
                            <span className="matches-stat-icon">◉</span>
                            <p>Average Match</p>
                            <h2>{formatPercent(averageMatch)}</h2>
                        </div>

                    </div>

                    {/* Matching information */}
                    <div className="matches-info-panel">
                        <div>
                            <span className="matches-info-label">
                                YOUR MATCHING SYSTEM
                            </span>

                            <h3>Hybrid Recommendation Engine</h3>

                            <p>{algorithm}</p>
                        </div>

                        <div className="matches-weights">
                            <span>
                                TF-IDF <strong>30%</strong>
                            </span>

                            <span>
                                SBERT <strong>40%</strong>
                            </span>

                            <span>
                                Skill Coverage <strong>30%</strong>
                            </span>
                        </div>
                    </div>

                    {/* Candidate skills */}
                    {candidateSkills.length > 0 && (
                        <div className="matches-candidate-skills">
                            <h3>Your matching skill set</h3>

                            <div className="matches-skill-list">
                                {candidateSkills.map((skill, index) => (
                                    <span key={`${skill}-${index}`}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Results heading */}
                    <div className="matches-results-heading">
                        <div>
                            <h2>Opportunities for You</h2>

                            <p>
                                {matches.length} jobs ranked by your
                                compatibility score.
                            </p>
                        </div>

                        <div className="matches-sort">
                            <label htmlFor="match-sort">
                                Sort by
                            </label>

                            <select
                                id="match-sort"
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                            >
                                <option value="highest">
                                    Best Match
                                </option>

                                <option value="lowest">
                                    Lowest Match
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Job cards */}
                    <div className="matches-grid">
                        {sortedMatches.map((match, index) => {
                            const jobId = match.jobId ?? match.id;

                            const score = Number(match.finalScore || 0);

                            const matchingSkills = normalizeSkillList(
                                match.matchingSkills
                            );

                            const missingSkills = normalizeSkillList(
                                match.missingSkills
                            );

                            return (
                                <article
                                    className={`matches-job-card matches-card-${index % 4}`}
                                    key={jobId ?? index}
                                >

                                    <div className="matches-card-top">
                                        <div className="matches-company-icon">
                                            P
                                        </div>

                                        {index === 0 && (
                                            <span className="matches-top-badge">
                                                Top Recommendation
                                            </span>
                                        )}
                                    </div>

                                    <div className="matches-job-title">
                                        <div>
                                            <span className="matches-job-label">
                                                EMPLOYMENT OPPORTUNITY
                                            </span>

                                            <h3>{match.title}</h3>

                                            <p>Job ID: {jobId}</p>
                                        </div>

                                        <div className="matches-score">
                                            <strong>
                                                {formatPercent(score)}
                                            </strong>

                                            <span>Match Score</span>
                                        </div>
                                    </div>

                                    {/* Overall score bar */}
                                    <div className="matches-progress-track">
                                        <div
                                            className="matches-progress-fill"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    Math.max(0, score * 100)
                                                )}%`
                                            }}
                                        ></div>
                                    </div>

                                    {/* Score breakdown */}
                                    <div className="matches-breakdown">
                                        <h4>Matching Score Breakdown</h4>

                                        <div>
                                            <span>TF-IDF Similarity</span>

                                            <strong>
                                                {formatPercent(match.tfidfScore)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>SBERT Similarity</span>

                                            <strong>
                                                {formatPercent(match.sbertScore)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Skill Coverage</span>

                                            <strong>
                                                {formatPercent(match.skillCoverage)}
                                            </strong>
                                        </div>
                                    </div>

                                    {/* Matching skills */}
                                    <div className="matches-skills-section">
                                        <h4>
                                            <span className="skill-check">
                                                ✓
                                            </span>

                                            Matching Skills

                                            <span className="skill-count">
                                                {matchingSkills.length}
                                            </span>
                                        </h4>

                                        {matchingSkills.length > 0 ? (
                                            <div className="matches-skill-list">
                                                {matchingSkills.map(skill => (
                                                    <span key={skill}>
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="matches-no-skills">
                                                No direct skill matches found.
                                            </p>
                                        )}
                                    </div>

                                    {/* Missing skills */}
                                    <div className="matches-skills-section missing-section">
                                        <h4>
                                            <span className="skill-missing">
                                                ＋
                                            </span>

                                            Skills to Improve

                                            <span className="skill-count missing-count">
                                                {missingSkills.length}
                                            </span>
                                        </h4>

                                        {missingSkills.length > 0 ? (
                                            <div className="matches-skill-list missing-skills">
                                                {missingSkills.map(skill => (
                                                    <span key={skill}>
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="matches-no-skills">
                                                You have all the listed required skills!
                                            </p>
                                        )}
                                    </div>

                                    {/* Card footer */}
                                    <div className="matches-card-footer">
                                        <span>
                                            Personalised skill-based recommendation
                                        </span>

                                        <Link
                                            to={`/jobs/${jobId}`}
                                            className="matches-view-button"
                                        >
                                            View Details →
                                        </Link>
                                    </div>

                                </article>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    <div className="matches-footnote">
                        <strong>
                            How are these jobs recommended?
                        </strong>

                        <p>
                            Recommendations combine manually entered profile
                            skills and skills extracted from your uploaded
                            resume. The final score uses TF-IDF similarity
                            (30%), SBERT semantic similarity (40%) and
                            skill coverage (30%).
                        </p>
                    </div>

                </section>
            )}

        </main>
    );
}

export default JobMatches;
