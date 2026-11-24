
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    getAuthHeaders,
    getJobById
} from "../services/api";

function getLoggedInUser() {
    try {
        return JSON.parse(localStorage.getItem("loggedInUser") || "null");
    } catch {
        return null;
    }
}

function formatSalary(salary) {
    if (salary === null || salary === undefined || salary === "") {
        return "Not specified";
    }

    return `₹${Number(salary).toLocaleString("en-IN")}`;
}

function formatDeadline(deadline) {
    if (!deadline) return "Not specified";

    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) return deadline;

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function getSkillList(skills) {
    if (!skills) return [];

    if (Array.isArray(skills)) {
        return skills.map((skill) => String(skill).trim()).filter(Boolean);
    }

    return String(skills)
        .split(/[,;\n]/)
        .map((skill) => skill.trim())
        .filter(Boolean);
}

function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [applyMessage, setApplyMessage] = useState("");
    const [applyMessageType, setApplyMessageType] = useState("");
    const [applying, setApplying] = useState(false);
    const [alreadyApplied, setAlreadyApplied] = useState(false);
    const [checkingApplication, setCheckingApplication] = useState(false);

    const loggedInUser = getLoggedInUser();

    useEffect(() => {
        let isMounted = true;

        async function loadJob() {
            setLoading(true);
            setError("");
            setJob(null);
            setAlreadyApplied(false);
            setApplyMessage("");
            setApplyMessageType("");

            try {
                const data = await getJobById(id);

                if (isMounted) {
                    setJob(data);
                }
            } catch (err) {
                console.error("Failed to load job:", err);

                if (isMounted) {
                    setError("Unable to load job details. Please try again.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadJob();

        return () => {
            isMounted = false;
        };
    }, [id]);

    // Check whether the logged-in candidate has already applied.
    useEffect(() => {
        if (!loggedInUser?.id || !id) {
            setCheckingApplication(false);
            return;
        }

        let isMounted = true;

        async function checkExistingApplication() {
            setCheckingApplication(true);

            try {
                const response = await fetch(
                    `http://localhost:8080/api/applications/user/${loggedInUser.id}`,
                    {
                        headers: getAuthHeaders()
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to check existing applications.");
                }

                const applications = await response.json();

                const hasApplied = Array.isArray(applications) &&
                    applications.some((application) =>
                        String(application.job?.id) === String(id)
                    );

                if (isMounted && hasApplied) {
                    setAlreadyApplied(true);
                    setApplyMessage("You have already applied to this job.");
                    setApplyMessageType("info");
                }
            } catch (err) {
                console.error("Could not check existing application:", err);
            } finally {
                if (isMounted) {
                    setCheckingApplication(false);
                }
            }
        }

        checkExistingApplication();

        return () => {
            isMounted = false;
        };
    }, [id, loggedInUser?.id]);

    async function handleApply() {
        if (!loggedInUser) {
            navigate("/login");
            return;
        }

        if (!loggedInUser.id) {
            setApplyMessage(
                "Unable to identify your account. Please log in again."
            );
            setApplyMessageType("error");
            return;
        }

        if (alreadyApplied || applying || !job) {
            return;
        }

        setApplying(true);
        setApplyMessage("");
        setApplyMessageType("");

        try {
            const response = await fetch(
                `http://localhost:8080/api/applications/apply?userId=${loggedInUser.id}&jobId=${job.id}`,
                {
                    method: "POST",
                    headers: getAuthHeaders()
                }
            );

            if (response.ok) {
                setAlreadyApplied(true);
                setApplyMessage("Your application has been submitted successfully!");
                setApplyMessageType("success");
            } else {
                const message = await response.text();

                if (response.status === 409) {
                    setAlreadyApplied(true);
                    setApplyMessage("You have already applied to this job.");
                    setApplyMessageType("info");
                } else {
                    setApplyMessage(
                        message || "Unable to submit your application. Please try again."
                    );
                    setApplyMessageType("error");
                }
            }
        } catch (err) {
            console.error("Application error:", err);
            setApplyMessage("Unable to connect to the server. Please try again.");
            setApplyMessageType("error");
        } finally {
            setApplying(false);
        }
    }

    if (loading) {
        return (
            <main className="job-details-v2-page">
                <div className="job-details-v2-state">
                    <div className="job-details-v2-loader" />
                    <p>Loading job details...</p>
                </div>
            </main>
        );
    }

    if (error || !job) {
        return (
            <main className="job-details-v2-page">
                <div className="job-details-v2-state job-details-v2-error-state">
                    <span className="job-details-v2-state-icon">!</span>
                    <h2>{error || "Job not found."}</h2>
                    <p>We couldn't find the employment opportunity you're looking for.</p>
                    <Link to="/jobs" className="job-details-v2-button">
                        ← Back to Jobs
                    </Link>
                </div>
            </main>
        );
    }

    const skills = getSkillList(job.requiredSkills);

    return (
        <main className="job-details-v2-page">
            <section className="job-details-v2-hero">
                <div className="job-details-v2-hero-inner">
                    <Link to="/jobs" className="job-details-v2-back-link">
                        ← Back to Job Listings
                    </Link>

                    <span className="job-details-v2-eyebrow">
                        EMPLOYMENT OPPORTUNITY
                    </span>

                    <div className="job-details-v2-title-row">
                        <div className="job-details-v2-title-icon">
                            {job.title?.charAt(0)?.toUpperCase() || "J"}
                        </div>

                        <div>
                            <h1>{job.title || "Job Opportunity"}</h1>
                            <p className="job-details-v2-organization">
                                {job.organization || "Organization not specified"}
                            </p>
                        </div>
                    </div>

                    <div className="job-details-v2-meta">
                        <span>⌖ {job.location || "Location not specified"}</span>
                        <span>₹ {formatSalary(job.salary)}</span>
                        <span>◷ {job.experienceRequirement ?? 0} years experience</span>
                    </div>
                </div>
            </section>

            <section className="job-details-v2-container">
                <div className="job-details-v2-main">
                    <section className="job-details-v2-card">
                        <div className="job-details-v2-section-title">
                            <span className="job-details-v2-section-icon icon-blue">▤</span>
                            <div>
                                <h2>Job Description</h2>
                                <p>About this employment opportunity</p>
                            </div>
                        </div>
                        <p className="job-details-v2-description">
                            {job.description || "No job description has been provided."}
                        </p>
                    </section>

                    <section className="job-details-v2-card">
                        <div className="job-details-v2-section-title">
                            <span className="job-details-v2-section-icon icon-purple">✓</span>
                            <div>
                                <h2>Eligibility Requirements</h2>
                                <p>Qualifications and experience required</p>
                            </div>
                        </div>

                        <div className="job-details-v2-requirements">
                            <div className="job-details-v2-requirement">
                                <span>Education Qualification</span>
                                <strong>{job.educationRequirement || "Not specified"}</strong>
                            </div>

                            <div className="job-details-v2-requirement">
                                <span>Work Experience</span>
                                <strong>{job.experienceRequirement ?? 0} years</strong>
                            </div>
                        </div>
                    </section>

                    <section className="job-details-v2-card">
                        <div className="job-details-v2-section-title">
                            <span className="job-details-v2-section-icon icon-mint">✦</span>
                            <div>
                                <h2>Required Skills</h2>
                                <p>Skills relevant to this position</p>
                            </div>
                        </div>

                        {skills.length > 0 ? (
                            <div className="job-details-v2-skills">
                                {skills.map((skill, index) => (
                                    <span key={`${skill}-${index}`}>{skill}</span>
                                ))}
                            </div>
                        ) : (
                            <p className="job-details-v2-muted">
                                No specific skills have been listed.
                            </p>
                        )}
                    </section>

                    <section className="job-details-v2-card">
                        <div className="job-details-v2-section-title">
                            <span className="job-details-v2-section-icon icon-orange">ⓘ</span>
                            <div>
                                <h2>Additional Information</h2>
                                <p>Important details about this position</p>
                            </div>
                        </div>

                        <div className="job-details-v2-information-grid">
                            <div>
                                <span>Organization</span>
                                <strong>{job.organization || "Not specified"}</strong>
                            </div>
                            <div>
                                <span>Job Location</span>
                                <strong>{job.location || "Not specified"}</strong>
                            </div>
                            <div>
                                <span>Salary</span>
                                <strong>{formatSalary(job.salary)}</strong>
                            </div>
                            <div>
                                <span>Application Deadline</span>
                                <strong>{formatDeadline(job.deadline)}</strong>
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="job-details-v2-sidebar">
                    <div className="job-details-v2-apply-card">
                        <span className="job-details-v2-eyebrow">
                            TAKE THE NEXT STEP
                        </span>

                        <div className="job-details-v2-apply-icon">✓</div>

                        <h2>Interested in this opportunity?</h2>
                        <p>
                            Review the eligibility requirements and submit
                            your application for this position.
                        </p>

                        <div className="job-details-v2-apply-divider" />

                        <div className="job-details-v2-apply-detail">
                            <span>Organization</span>
                            <strong>{job.organization || "Not specified"}</strong>
                        </div>
                        <div className="job-details-v2-apply-detail">
                            <span>Location</span>
                            <strong>{job.location || "Not specified"}</strong>
                        </div>
                        <div className="job-details-v2-apply-detail">
                            <span>Deadline</span>
                            <strong>{formatDeadline(job.deadline)}</strong>
                        </div>

                        {!loggedInUser ? (
                            <div className="job-details-v2-apply-actions">
                                <p>Sign in to your PGRKAM account to apply for this position.</p>
                                <Link to="/login" className="job-details-v2-button">
                                    Login to Apply →
                                </Link>
                                <Link to="/register" className="job-details-v2-register-link">
                                    Don't have an account? Register
                                </Link>
                            </div>
                        ) : (
                            <div className="job-details-v2-apply-actions">
                                <p className="job-details-v2-signed-in">
                                    Signed in as{" "}
                                    <strong>{loggedInUser.name || loggedInUser.email}</strong>
                                </p>

                                <button
                                    type="button"
                                    className={`job-details-v2-button ${
                                        alreadyApplied ? "job-details-v2-applied-button" : ""
                                    }`}
                                    onClick={handleApply}
                                    disabled={applying || alreadyApplied || checkingApplication}
                                >
                                    {checkingApplication
                                        ? "Checking Application..."
                                        : applying
                                            ? "Submitting Application..."
                                            : alreadyApplied
                                                ? "✓ Already Applied"
                                                : "Apply Now →"}
                                </button>

                                {applyMessage && (
                                    <div
                                        className={`job-details-v2-message ${applyMessageType}`}
                                        role="status"
                                    >
                                        {applyMessage}
                                    </div>
                                )}

                                {alreadyApplied && (
                                    <Link
                                        to="/applications"
                                        className="job-details-v2-register-link"
                                    >
                                        View My Applications →
                                    </Link>
                                )}

                                {applyMessageType === "success" && (
                                    <span className="job-details-v2-success-note">
                                        Your application is now recorded.
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="job-details-v2-help-card">
                        <span>ⓘ</span>
                        <div>
                            <strong>Before you apply</strong>
                            <p>
                                Make sure your candidate profile and resume
                                are up to date.
                            </p>
                            {loggedInUser && (
                                <Link to="/profile">Review Your Profile →</Link>
                            )}
                        </div>
                    </div>
                </aside>
            </section>
        </main>
    );
}

export default JobDetails;
