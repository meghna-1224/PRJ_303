
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthHeaders } from "../services/api";

const API_BASE_URL = "http://localhost:8080/api";

function getLoggedInUser() {
    try {
        return JSON.parse(localStorage.getItem("loggedInUser") || "null");
    } catch {
        return null;
    }
}

function getArray(data, possibleKeys = []) {
    if (Array.isArray(data)) return data;

    for (const key of possibleKeys) {
        if (Array.isArray(data?.[key])) return data[key];
    }

    return [];
}

function getJobFromMatch(match) {
    return match?.job || match?.jobDetails || match || {};
}

function getMatchScore(match) {
    const value =
        match?.finalScore ??
        match?.combinedScore ??
        match?.overallScore ??
        match?.matchScore ??
        match?.score;

    if (value === null || value === undefined || value === "") {
        return null;
    }

    const number = Number(value);
    if (!Number.isFinite(number)) return null;

    return `${Math.round(number <= 1 ? number * 100 : number)}%`;
}

function formatDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function Dashboard() {
    const loggedInUser = useMemo(() => getLoggedInUser(), []);

    const [profile, setProfile] = useState(null);
    const [resumeUploaded, setResumeUploaded] = useState(false);
    const [applications, setApplications] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadErrors, setLoadErrors] = useState({
        profile: false,
        applications: false,
        recommendations: false
    });

    useEffect(() => {
        if (!loggedInUser?.id) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const fetchDashboardData = async () => {
            const headers = getAuthHeaders();

            const requests = [
                {
                    key: "profile",
                    url: `${API_BASE_URL}/profile/${loggedInUser.id}`
                },
                {
                    key: "resume",
                    url: `${API_BASE_URL}/resume/${loggedInUser.id}`
                },
                {
                    key: "applications",
                    url: `${API_BASE_URL}/applications/user/${loggedInUser.id}`
                },
                {
                    key: "recommendations",
                    url: `${API_BASE_URL}/matches/${loggedInUser.id}`
                }
            ];

            const results = await Promise.allSettled(
                requests.map(async (request) => {
                    const response = await fetch(request.url, { headers });

                    if (!response.ok) {
                        throw new Error(
                            `${request.key} request failed: ${response.status}`
                        );
                    }

                    return {
                        key: request.key,
                        data: await response.json()
                    };
                })
            );

            if (!isMounted) return;

            const errors = {
                profile: false,
                applications: false,
                recommendations: false
            };

            results.forEach((result, index) => {
                const key = requests[index].key;

                if (result.status === "rejected") {
                    if (key !== "resume") {
                        errors[key] = true;
                    }
                    console.error(
                        `Failed to load ${key}:`,
                        result.reason
                    );
                    return;
                }

                const data = result.value.data;

                switch (key) {
                    case "profile":
                        setProfile(data);
                        break;

                    case "resume":
                        setResumeUploaded(true);
                        break;

                    case "applications":
                        setApplications(
                            getArray(data, ["applications", "data"])
                        );
                        break;

                    case "recommendations":
                        setRecommendations(
                            getArray(data, [
                                "matches",
                                "recommendations",
                                "jobs",
                                "data"
                            ])
                        );
                        break;

                    default:
                        break;
                }
            });

            setLoadErrors(errors);
            setLoading(false);
        };

        fetchDashboardData();

        return () => {
            isMounted = false;
        };
    }, [loggedInUser?.id]);

    // Profile completion: 14 candidate fields + resume = 15 fields.
    const profileFields = [
        profile?.education,
        profile?.degree,
        profile?.skills,
        profile?.experienceYears,
        profile?.location,
        profile?.preferredLocation,
        profile?.phone,
        profile?.address,
        profile?.dateOfBirth,
        profile?.tenthPercentage,
        profile?.twelfthPercentage,
        profile?.university,
        profile?.graduationYear,
        profile?.graduationPercentage
    ];

    const completedProfileFields = profileFields.filter(
        (field) =>
            field !== null &&
            field !== undefined &&
            String(field).trim() !== ""
    ).length;

    const completedFields =
        completedProfileFields + (resumeUploaded ? 1 : 0);

    const profileCompletion = Math.round(
        (completedFields / 15) * 100
    );

    const recentApplications = [...applications]
        .sort((a, b) => {
            const dateA = new Date(a.appliedAt || 0).getTime();
            const dateB = new Date(b.appliedAt || 0).getTime();
            return dateB - dateA;
        })
        .slice(0, 4);

    const topRecommendations = recommendations.slice(0, 3);

    const personalInformationComplete =
        Boolean(profile?.phone) &&
        Boolean(profile?.address) &&
        Boolean(profile?.dateOfBirth);

    const educationDetailsComplete =
        Boolean(profile?.education) &&
        Boolean(profile?.degree) &&
        profile?.tenthPercentage !== null &&
        profile?.tenthPercentage !== undefined &&
        profile?.twelfthPercentage !== null &&
        profile?.twelfthPercentage !== undefined &&
        Boolean(profile?.university) &&
        profile?.graduationYear !== null &&
        profile?.graduationYear !== undefined &&
        profile?.graduationPercentage !== null &&
        profile?.graduationPercentage !== undefined;

    const employmentProfileComplete =
        Boolean(profile?.skills) &&
        profile?.experienceYears !== null &&
        profile?.experienceYears !== undefined &&
        Boolean(profile?.location) &&
        Boolean(profile?.preferredLocation);

    if (!loggedInUser?.id) {
        return (
            <main className="dashboard-v2-page">
                <div className="dashboard-v2-empty">
                    <h2>Please log in to view your dashboard.</h2>
                    <Link to="/login" className="dashboard-v2-button">
                        Login
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard-v2-page">
            {/* Welcome section */}
            <section className="dashboard-v2-hero">
                <div className="dashboard-v2-hero-content">
                    <span className="dashboard-v2-eyebrow">
                        PGRKAM EMPLOYMENT SERVICES
                    </span>

                    <h1>
                        Welcome back,{" "}
                        {loggedInUser?.name?.split(" ")[0] || "Candidate"}!
                    </h1>

                    <p>
                        Your career journey starts here. Manage your profile,
                        track applications and discover opportunities that
                        match your skills.
                    </p>

                    <div className="dashboard-v2-hero-actions">
                        <Link to="/jobs" className="dashboard-v2-button">
                            Explore Jobs <span>→</span>
                        </Link>

                        <Link
                            to="/job-matches"
                            className="dashboard-v2-button-outline"
                        >
                            View Recommendations
                        </Link>
                    </div>
                </div>

                <div className="dashboard-v2-hero-decoration">
                    <div className="dashboard-v2-hero-circle">
                        <span>★</span>
                    </div>
                    <div className="dashboard-v2-hero-caption">
                        Find opportunities that fit your skills
                    </div>
                </div>
            </section>

            <section className="dashboard-v2-content">
                {/* Overview statistics */}
                <div className="dashboard-v2-section-heading">
                    <div>
                        <span className="dashboard-v2-eyebrow">
                            YOUR ACTIVITY
                        </span>
                        <h2>Dashboard Overview</h2>
                    </div>
                    <span className="dashboard-v2-updated">
                        {loading ? "Loading your data..." : "Your account summary"}
                    </span>
                </div>

                <div className="dashboard-v2-stats">
                    <div className="dashboard-v2-stat-card">
                        <div className="dashboard-v2-stat-icon stat-blue">
                            <span>◉</span>
                        </div>
                        <div>
                            <p>Profile Completion</p>
                            <h3>{loading ? "—" : `${profileCompletion}%`}</h3>
                            <span>Candidate profile progress</span>
                        </div>
                    </div>

                    <div className="dashboard-v2-stat-card">
                        <div className="dashboard-v2-stat-icon stat-mint">
                            <span>▤</span>
                        </div>
                        <div>
                            <p>Total Applications</p>
                            <h3>{loading ? "—" : applications.length}</h3>
                            <span>Jobs you have applied for</span>
                        </div>
                    </div>

                    <div className="dashboard-v2-stat-card">
                        <div className="dashboard-v2-stat-icon stat-lavender">
                            <span>✦</span>
                        </div>
                        <div>
                            <p>Recommended Jobs</p>
                            <h3>{loading ? "—" : recommendations.length}</h3>
                            <span>Based on your profile and resume</span>
                        </div>
                    </div>
                </div>

                {/* Main dashboard columns */}
                <div className="dashboard-v2-main-grid">
                    <div className="dashboard-v2-left-column">
                        {/* Profile completion */}
                        <section className="dashboard-v2-card">
                            <div className="dashboard-v2-card-heading">
                                <div>
                                    <span className="dashboard-v2-eyebrow">
                                        CANDIDATE REGISTRATION
                                    </span>
                                    <h2>Complete Your Profile</h2>
                                </div>

                                <Link to="/profile" className="dashboard-v2-text-link">
                                    Edit Profile →
                                </Link>
                            </div>

                            <div className="dashboard-v2-progress-summary">
                                <div>
                                    <strong>{profileCompletion}%</strong>
                                    <span>Profile completed</span>
                                </div>
                                <span className="dashboard-v2-progress-count">
                                    {completedFields} of 15 fields
                                </span>
                            </div>

                            <div className="dashboard-v2-progress-track">
                                <div
                                    className="dashboard-v2-progress-fill"
                                    style={{ width: `${profileCompletion}%` }}
                                />
                            </div>

                            <p className="dashboard-v2-helper-text">
                                A complete profile helps present your
                                qualifications and skills to potential employers.
                            </p>

                            <div className="dashboard-v2-checklist">
                                <div className="dashboard-v2-check-item">
                                    <span className={personalInformationComplete ? "check-done" : "check-pending"}>
                                        {personalInformationComplete ? "✓" : "○"}
                                    </span>
                                    <div>
                                        <strong>Personal Information</strong>
                                        <span>Phone, address and date of birth</span>
                                    </div>
                                    <span className="dashboard-v2-check-status">
                                        {personalInformationComplete ? "Complete" : "Pending"}
                                    </span>
                                </div>

                                <div className="dashboard-v2-check-item">
                                    <span className={educationDetailsComplete ? "check-done" : "check-pending"}>
                                        {educationDetailsComplete ? "✓" : "○"}
                                    </span>
                                    <div>
                                        <strong>Education Details</strong>
                                        <span>Academic details and qualifications</span>
                                    </div>
                                    <span className="dashboard-v2-check-status">
                                        {educationDetailsComplete ? "Complete" : "Pending"}
                                    </span>
                                </div>

                                <div className="dashboard-v2-check-item">
                                    <span className={employmentProfileComplete ? "check-done" : "check-pending"}>
                                        {employmentProfileComplete ? "✓" : "○"}
                                    </span>
                                    <div>
                                        <strong>Employment Profile</strong>
                                        <span>Skills, experience and locations</span>
                                    </div>
                                    <span className="dashboard-v2-check-status">
                                        {employmentProfileComplete ? "Complete" : "Pending"}
                                    </span>
                                </div>

                                <div className="dashboard-v2-check-item">
                                    <span className={resumeUploaded ? "check-done" : "check-pending"}>
                                        {resumeUploaded ? "✓" : "○"}
                                    </span>
                                    <div>
                                        <strong>Resume</strong>
                                        <span>Upload your resume for skill extraction</span>
                                    </div>
                                    <span className="dashboard-v2-check-status">
                                        {resumeUploaded ? "Uploaded" : "Pending"}
                                    </span>
                                </div>
                            </div>

                            <Link to="/profile" className="dashboard-v2-button dashboard-v2-full-button">
                                {profileCompletion === 100 ? "View Your Profile" : "Complete Your Profile"}
                                <span>→</span>
                            </Link>
                        </section>

                        {/* Recent applications */}
                        <section className="dashboard-v2-card">
                            <div className="dashboard-v2-card-heading">
                                <div>
                                    <span className="dashboard-v2-eyebrow">
                                        APPLICATION TRACKER
                                    </span>
                                    <h2>Recent Applications</h2>
                                </div>

                                <Link to="/applications" className="dashboard-v2-text-link">
                                    View All →
                                </Link>
                            </div>

                            {loading ? (
                                <p className="dashboard-v2-empty-message">
                                    Loading applications...
                                </p>
                            ) : loadErrors.applications ? (
                                <p className="dashboard-v2-empty-message">
                                    Applications could not be loaded right now.
                                </p>
                            ) : recentApplications.length === 0 ? (
                                <div className="dashboard-v2-empty-state">
                                    <span>▤</span>
                                    <strong>No applications yet</strong>
                                    <p>
                                        When you apply for a job, your recent
                                        applications will appear here.
                                    </p>
                                    <Link to="/jobs" className="dashboard-v2-text-link">
                                        Browse available jobs →
                                    </Link>
                                </div>
                            ) : (
                                <div className="dashboard-v2-applications">
                                    {recentApplications.map((application) => {
                                        const job = application.job || {};

                                        return (
                                            <div
                                                className="dashboard-v2-application-row"
                                                key={application.id}
                                            >
                                                <div className="dashboard-v2-job-icon">
                                                    {job.title?.charAt(0)?.toUpperCase() || "J"}
                                                </div>

                                                <div className="dashboard-v2-application-info">
                                                    <strong>
                                                        {job.title || "Job application"}
                                                    </strong>
                                                    <span>
                                                        {job.organization || "Organization not specified"}
                                                    </span>
                                                    <small>
                                                        Applied on {formatDate(application.appliedAt)}
                                                    </small>
                                                </div>

                                                <span className="dashboard-v2-status">
                                                    {application.status || "Submitted"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="dashboard-v2-right-column">
                        {/* Profile summary */}
                        <section className="dashboard-v2-card dashboard-v2-profile-card">
                            <span className="dashboard-v2-eyebrow">
                                YOUR ACCOUNT
                            </span>

                            <div className="dashboard-v2-profile-avatar">
                                {loggedInUser?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>

                            <h2>{loggedInUser?.name || "Candidate"}</h2>
                            <p>{loggedInUser?.email || "Candidate account"}</p>

                            <span className="dashboard-v2-account-tag">
                                Candidate Account
                            </span>

                            {profile?.education && (
                                <div className="dashboard-v2-profile-detail">
                                    <span>Education</span>
                                    <strong>{profile.education}</strong>
                                </div>
                            )}

                            {profile?.location && (
                                <div className="dashboard-v2-profile-detail">
                                    <span>Location</span>
                                    <strong>{profile.location}</strong>
                                </div>
                            )}

                            <Link to="/profile" className="dashboard-v2-button-outline dashboard-v2-full-button">
                                Manage Profile
                            </Link>
                        </section>

                        {/* Recommended jobs */}
                        <section className="dashboard-v2-card">
                            <div className="dashboard-v2-card-heading">
                                <div>
                                    <span className="dashboard-v2-eyebrow">
                                        AI-POWERED MATCHING
                                    </span>
                                    <h2>Top Recommendations</h2>
                                </div>
                            </div>

                            {loading ? (
                                <p className="dashboard-v2-empty-message">
                                    Finding matching jobs...
                                </p>
                            ) : loadErrors.recommendations ? (
                                <p className="dashboard-v2-empty-message">
                                    Recommendations could not be loaded right now.
                                </p>
                            ) : topRecommendations.length === 0 ? (
                                <div className="dashboard-v2-empty-state">
                                    <span>✦</span>
                                    <strong>No recommendations available</strong>
                                    <p>
                                        Complete your profile and add your skills
                                        to discover relevant jobs.
                                    </p>
                                    <Link to="/profile" className="dashboard-v2-text-link">
                                        Update your profile →
                                    </Link>
                                </div>
                            ) : (
                                <div className="dashboard-v2-recommendations">
                                    {topRecommendations.map((match, index) => {
                                        const job = getJobFromMatch(match);
                                        const score = getMatchScore(match);
                                        const jobId = job.id || match.jobId;

                                        return (
                                            <div
                                                className="dashboard-v2-recommendation"
                                                key={jobId || match.id || index}
                                            >
                                                <div className="dashboard-v2-recommendation-top">
                                                    <span className="dashboard-v2-rank">
                                                        #{index + 1}
                                                    </span>
                                                    {score && (
                                                        <span className="dashboard-v2-match-score">
                                                            {score} match
                                                        </span>
                                                    )}
                                                </div>

                                                <strong>
                                                    {job.title || "Recommended job"}
                                                </strong>

                                                <span className="dashboard-v2-recommendation-org">
                                                    {job.organization || "Organization not specified"}
                                                </span>

                                                {job.location && (
                                                    <span className="dashboard-v2-recommendation-location">
                                                        {job.location}
                                                    </span>
                                                )}

                                                <Link
                                                    to={jobId ? `/jobs/${jobId}` : "/job-matches"}
                                                    className="dashboard-v2-text-link"
                                                >
                                                    View Job →
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <Link
                                to="/job-matches"
                                className="dashboard-v2-button dashboard-v2-full-button"
                            >
                                View All Recommendations <span>→</span>
                            </Link>
                        </section>
                    </div>
                </div>

                {/* Quick actions */}
                <section className="dashboard-v2-quick-section">
                    <div className="dashboard-v2-section-heading">
                        <div>
                            <span className="dashboard-v2-eyebrow">
                                GET STARTED
                            </span>
                            <h2>Quick Actions</h2>
                        </div>
                    </div>

                    <div className="dashboard-v2-quick-grid">
                        <Link to="/jobs" className="dashboard-v2-quick-card">
                            <span className="quick-icon quick-blue">⌕</span>
                            <div>
                                <strong>Find Jobs</strong>
                                <span>Explore available opportunities</span>
                            </div>
                            <span className="quick-arrow">→</span>
                        </Link>

                        <Link to="/job-matches" className="dashboard-v2-quick-card">
                            <span className="quick-icon quick-purple">✦</span>
                            <div>
                                <strong>Recommended Jobs</strong>
                                <span>Discover jobs matching your skills</span>
                            </div>
                            <span className="quick-arrow">→</span>
                        </Link>

                        <Link to="/applications" className="dashboard-v2-quick-card">
                            <span className="quick-icon quick-green">▤</span>
                            <div>
                                <strong>My Applications</strong>
                                <span>Track your application status</span>
                            </div>
                            <span className="quick-arrow">→</span>
                        </Link>

                        <Link to="/profile" className="dashboard-v2-quick-card">
                            <span className="quick-icon quick-orange">◎</span>
                            <div>
                                <strong>Manage Profile</strong>
                                <span>Update your details and resume</span>
                            </div>
                            <span className="quick-arrow">→</span>
                        </Link>
                    </div>
                </section>

                {/* Recommendation explanation */}
                <section className="dashboard-v2-matching-banner">
                    <div>
                        <span className="dashboard-v2-eyebrow">
                            PERSONALIZED JOB MATCHING
                        </span>
                        <h2>How Your Recommendations Work</h2>
                        <p>
                            Your job recommendations combine information from
                            your candidate profile and uploaded resume to
                            identify relevant employment opportunities.
                        </p>
                    </div>

                    <div className="dashboard-v2-matching-steps">
                        <div>
                            <strong>01</strong>
                            <span>Profile Skills</span>
                        </div>
                        <div>
                            <strong>02</strong>
                            <span>Resume Extraction</span>
                        </div>
                        <div>
                            <strong>03</strong>
                            <span>TF-IDF + SBERT</span>
                        </div>
                        <div>
                            <strong>04</strong>
                            <span>Skill Coverage</span>
                        </div>
                        <div>
                            <strong>05</strong>
                            <span>Ranked Jobs</span>
                        </div>
                    </div>
                </section>
            </section>
        </main>
    );
}

export default Dashboard;
