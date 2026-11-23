
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getJobs } from "../services/api";

function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [locationFilter, setLocationFilter] = useState("All Locations");
    const [experienceFilter, setExperienceFilter] = useState("All Experience");
    const [sortBy, setSortBy] = useState("latest");

    useEffect(() => {
        loadJobs();
    }, []);

    async function loadJobs() {
        try {
            const data = await getJobs();
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Unable to load jobs:", err);
            setError("Unable to load jobs. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const locations = useMemo(() => {
        return [
            "All Locations",
            ...new Set(
                jobs
                    .map(job => job.location)
                    .filter(Boolean)
            )
        ];
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        let result = [...jobs];

        const query = search.trim().toLowerCase();

        if (query) {
            result = result.filter(job => {
                const searchableText = [
                    job.title,
                    job.organization,
                    job.location,
                    job.description,
                    job.requiredSkills,
                    job.educationRequirement
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(query);
            });
        }

        if (locationFilter !== "All Locations") {
            result = result.filter(
                job => job.location === locationFilter
            );
        }

        if (experienceFilter === "Entry Level (0 years)") {
            result = result.filter(
                job => Number(job.experienceRequirement) === 0
            );
        } else if (experienceFilter === "1–2 years") {
            result = result.filter(job => {
                const years = Number(job.experienceRequirement);
                return years >= 1 && years <= 2;
            });
        } else if (experienceFilter === "3+ years") {
            result = result.filter(
                job => Number(job.experienceRequirement) >= 3
            );
        }

        if (sortBy === "salary-high") {
            result.sort(
                (a, b) => Number(b.salary || 0) - Number(a.salary || 0)
            );
        } else if (sortBy === "salary-low") {
            result.sort(
                (a, b) => Number(a.salary || 0) - Number(b.salary || 0)
            );
        } else if (sortBy === "title") {
            result.sort((a, b) =>
                (a.title || "").localeCompare(b.title || "")
            );
        }

        return result;
    }, [jobs, search, locationFilter, experienceFilter, sortBy]);

    function clearFilters() {
        setSearch("");
        setLocationFilter("All Locations");
        setExperienceFilter("All Experience");
        setSortBy("latest");
    }

    const cardColors = [
        "job-card-blue",
        "job-card-mint",
        "job-card-lavender",
        "job-card-peach",
        "job-card-sky",
        "job-card-pink"
    ];

    if (loading) {
        return (
            <main className="jobs-page">
                <div className="jobs-loading">
                    Loading employment opportunities...
                </div>
            </main>
        );
    }

    return (
        <main className="jobs-page">

            <section className="jobs-heading">
                <div>
                    <p className="jobs-eyebrow">
                        PUNJAB GOVERNMENT EMPLOYMENT SERVICES
                    </p>
                    <h1>Explore Employment Opportunities</h1>
                    <p>
                        Discover career opportunities that match your
                        qualifications, experience and skills.
                    </p>
                </div>
                <div className="jobs-heading-icon">★</div>
            </section>

            <section className="jobs-search-panel">
                <div className="jobs-search-input">
                    <span>⌕</span>
                    <input
                        type="text"
                        placeholder="Search job titles, skills or departments..."
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                    />
                </div>

                <div className="jobs-search-location">
                    <span>⌖</span>
                    <select
                        value={locationFilter}
                        onChange={event => setLocationFilter(event.target.value)}
                    >
                        {locations.map(location => (
                            <option key={location} value={location}>
                                {location}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    className="jobs-search-button"
                    onClick={() => {}}
                >
                    Search Jobs
                </button>
            </section>

            <section className="jobs-results-layout">

                <aside className="jobs-filter-sidebar">
                    <div className="filter-heading">
                        <h2>Filters</h2>
                        <button onClick={clearFilters}>Clear All</button>
                    </div>

                    <div className="filter-group">
                        <h3>Location</h3>
                        {locations.map(location => (
                            <label className="filter-option" key={location}>
                                <input
                                    type="radio"
                                    name="location"
                                    checked={locationFilter === location}
                                    onChange={() => setLocationFilter(location)}
                                />
                                <span>{location}</span>
                            </label>
                        ))}
                    </div>

                    <div className="filter-group">
                        <h3>Experience</h3>
                        {[
                            "All Experience",
                            "Entry Level (0 years)",
                            "1–2 years",
                            "3+ years"
                        ].map(option => (
                            <label className="filter-option" key={option}>
                                <input
                                    type="radio"
                                    name="experience"
                                    checked={experienceFilter === option}
                                    onChange={() => setExperienceFilter(option)}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>

                    <div className="filter-note">
                        <span>ⓘ</span>
                        <p>
                            Use your profile and resume to discover
                            personalised job recommendations.
                        </p>
                        <Link to="/job-matches">View Recommended Jobs</Link>
                    </div>
                </aside>

                <div className="jobs-results">

                    <div className="jobs-results-header">
                        <div>
                            <h2>Available Opportunities</h2>
                            <p>
                                Showing <strong>{filteredJobs.length}</strong> of{" "}
                                <strong>{jobs.length}</strong> available jobs
                            </p>
                        </div>

                        <div className="jobs-sort">
                            <label htmlFor="sort-jobs">Sort by</label>
                            <select
                                id="sort-jobs"
                                value={sortBy}
                                onChange={event => setSortBy(event.target.value)}
                            >
                                <option value="latest">Default</option>
                                <option value="salary-high">Highest Salary</option>
                                <option value="salary-low">Lowest Salary</option>
                                <option value="title">Job Title</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="jobs-empty-state">
                            <h3>Unable to load jobs</h3>
                            <p>{error}</p>
                            <button
                                className="jobs-search-button"
                                onClick={() => {
                                    setLoading(true);
                                    setError("");
                                    loadJobs();
                                }}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!error && filteredJobs.length === 0 && (
                        <div className="jobs-empty-state">
                            <div>⌕</div>
                            <h3>No matching opportunities found</h3>
                            <p>
                                Try changing your search or removing some filters.
                            </p>
                            <button
                                className="jobs-search-button"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    <div className="jobs-card-grid">
                        {filteredJobs.map((job, index) => {
                            const skills = (job.requiredSkills || "")
                                .split(",")
                                .map(skill => skill.trim())
                                .filter(Boolean);

                            return (
                                <article
                                    className={`modern-job-card ${
                                        cardColors[index % cardColors.length]
                                    }`}
                                    key={job.id}
                                >
                                    <div className="modern-job-card-top">
                                        <div className="job-organization-icon">
                                            P
                                        </div>
                                        <span className="government-tag">
                                            Government
                                        </span>
                                    </div>

                                    <div className="modern-job-card-content">
                                        <p className="job-department">
                                            {job.organization || "PGRKAM Employment Services"}
                                        </p>

                                        <h3>{job.title}</h3>

                                        <p className="job-card-description">
                                            {job.description ||
                                                "Explore this employment opportunity and review the eligibility requirements."}
                                        </p>

                                        <div className="job-card-meta">
                                            <span>⌖ {job.location || "Location not specified"}</span>
                                            <span>
                                                ◷ {job.experienceRequirement ?? 0} years experience
                                            </span>
                                        </div>

                                        <div className="job-card-skills">
                                            {skills.slice(0, 4).map(skill => (
                                                <span key={skill}>{skill}</span>
                                            ))}
                                            {skills.length > 4 && (
                                                <span>+{skills.length - 4} more</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="modern-job-card-footer">
                                        <div className="job-salary">
                                            <span>Monthly Salary</span>
                                            <strong>
                                                {job.salary != null
                                                    ? `₹${Number(job.salary).toLocaleString("en-IN")}`
                                                    : "As per notification"}
                                            </strong>
                                        </div>

                                        <div className="job-card-actions">
                                            <Link
                                                to={`/jobs/${job.id}`}
                                                className="job-details-button"
                                            >
                                                Details
                                            </Link>
                                            <Link
                                                to={`/jobs/${job.id}`}
                                                className="job-apply-button"
                                            >
                                                Apply Now
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Jobs;
