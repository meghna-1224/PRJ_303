import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthHeaders } from "../services/api";

function Dashboard() {
    const loggedInUser = JSON.parse(
        localStorage.getItem("loggedInUser")
    );

    const [profile, setProfile] = useState(null);
    const [resumeUploaded, setResumeUploaded] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!loggedInUser?.id) {
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:8080/api/profile/${loggedInUser.id}`,
                    {
                        headers: getAuthHeaders()
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
            }
        };

        const checkResume = async () => {
            if (!loggedInUser?.id) {
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:8080/api/resume/${loggedInUser.id}`,
                    {
                        headers: getAuthHeaders()
                    }
                );

                if (response.ok) {
                    setResumeUploaded(true);
                }
            } catch (error) {
                console.error("Failed to check resume:", error);
            }
        };

        fetchProfile();
        checkResume();
    }, [loggedInUser?.id]);

    /*
     * Profile completion is based on the actual candidate information.
     *
     * Total fields:
     * 1. Education
     * 2. Degree
     * 3. Skills
     * 4. Experience
     * 5. Current Location
     * 6. Preferred Location
     * 7. Phone
     * 8. Address
     * 9. Date of Birth
     * 10. 10th Percentage
     * 11. 12th Percentage
     * 12. University
     * 13. Graduation Year
     * 14. Graduation Percentage
     * 15. Resume
     *
     * Example:
     * 6 profile fields + resume = 7/15 = 46.67% → 47%
     */

    const profileFields = [
        profile?.education,
        profile?.degree,
        profile?.skills,
        profile?.experienceYears !== null &&
            profile?.experienceYears !== undefined
            ? profile.experienceYears
            : null,
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

    const totalFields = 15;

    const profileCompletion = Math.round(
        (completedFields / totalFields) * 100
    );

    /*
     * Section completion
     */

    const personalInformationComplete =
        Boolean(profile?.phone) &&
        Boolean(profile?.address) &&
        Boolean(profile?.dateOfBirth);

    const educationDetailsComplete =
        Boolean(profile?.education) &&
        Boolean(profile?.degree) &&
        Boolean(profile?.tenthPercentage) &&
        Boolean(profile?.twelfthPercentage) &&
        Boolean(profile?.university) &&
        Boolean(profile?.graduationYear) &&
        Boolean(profile?.graduationPercentage);

    const employmentProfileComplete =
        Boolean(profile?.skills) &&
        profile?.experienceYears !== null &&
        profile?.experienceYears !== undefined &&
        Boolean(profile?.location) &&
        Boolean(profile?.preferredLocation);

    return (
        <main className="dashboard-page">

            {/* =========================
                DASHBOARD HEADER
            ========================= */}

            <section className="dashboard-header">
                <div>
                    <p className="hero-label">
                        PGRKAM EMPLOYMENT SERVICES
                    </p>

                    <h1>
                        Welcome, {loggedInUser?.name || "Candidate"}
                    </h1>

                    <p>
                        Manage your profile, explore job opportunities,
                        and discover jobs that match your skills.
                    </p>
                </div>
            </section>


            <section className="dashboard-container">

                {/* =========================
                    PROFILE OVERVIEW
                ========================= */}

                <div className="dashboard-card profile-summary">

                    <div className="dashboard-card-header">

                        <div>
                            <p className="card-label">
                                YOUR PROFILE
                            </p>

                            <h2>
                                Profile Overview
                            </h2>
                        </div>

                        <Link
                            to="/profile"
                            className="dashboard-link"
                        >
                            View Profile
                        </Link>

                    </div>


                    <div className="profile-summary-content">

                        <div className="profile-avatar-large">
                            {loggedInUser?.name
                                ? loggedInUser.name
                                      .charAt(0)
                                      .toUpperCase()
                                : "U"}
                        </div>

                        <div>

                            <h3>
                                {loggedInUser?.name || "Candidate"}
                            </h3>

                            <p>
                                {loggedInUser?.email || ""}
                            </p>

                            <span className="profile-status">
                                Candidate Account
                            </span>

                        </div>

                    </div>

                </div>


                {/* =========================
                    PROFILE COMPLETION
                ========================= */}

                <div className="dashboard-card profile-completion-card">

                    <div className="profile-completion-header">

                        <div>

                            <p className="card-label">
                                CANDIDATE REGISTRATION
                            </p>

                            <h2>
                                Profile Completion
                            </h2>

                        </div>

                        <div className="profile-completion-percentage">
                            {profileCompletion}%
                        </div>

                    </div>


                    <p className="profile-completion-description">
                        Complete your candidate information to build a
                        more complete employment profile.
                    </p>


                    {/* Progress bar */}

                    <div className="profile-progress-track">
                        <div
                            className="profile-progress-fill"
                            style={{
                                width: `${profileCompletion}%`
                            }}
                        ></div>
                    </div>


                    {/* Completion sections */}

                    <div className="profile-completion-list">

                        <div
                            className={
                                personalInformationComplete
                                    ? "completion-item completed"
                                    : "completion-item"
                            }
                        >
                            <div className="completion-icon">
                                {personalInformationComplete
                                    ? "✓"
                                    : "○"}
                            </div>

                            <div>
                                <strong>
                                    Personal Information
                                </strong>

                                <span>
                                    Phone, address and date of birth
                                </span>
                            </div>
                        </div>


                        <div
                            className={
                                educationDetailsComplete
                                    ? "completion-item completed"
                                    : "completion-item"
                            }
                        >
                            <div className="completion-icon">
                                {educationDetailsComplete
                                    ? "✓"
                                    : "○"}
                            </div>

                            <div>
                                <strong>
                                    Education Details
                                </strong>

                                <span>
                                    Education, academic marks,
                                    university and graduation details
                                </span>
                            </div>
                        </div>


                        <div
                            className={
                                employmentProfileComplete
                                    ? "completion-item completed"
                                    : "completion-item"
                            }
                        >
                            <div className="completion-icon">
                                {employmentProfileComplete
                                    ? "✓"
                                    : "○"}
                            </div>

                            <div>
                                <strong>
                                    Employment Profile
                                </strong>

                                <span>
                                    Skills, experience and preferred
                                    locations
                                </span>
                            </div>
                        </div>


                        <div
                            className={
                                resumeUploaded
                                    ? "completion-item completed"
                                    : "completion-item"
                            }
                        >
                            <div className="completion-icon">
                                {resumeUploaded
                                    ? "✓"
                                    : "○"}
                            </div>

                            <div>
                                <strong>
                                    Resume
                                </strong>

                                <span>
                                    Upload a resume for automatic
                                    skill extraction
                                </span>
                            </div>
                        </div>

                    </div>


                    <Link
                        to="/profile"
                        className="primary-button"
                    >
                        Complete Profile
                    </Link>

                </div>


                {/* =========================
                    DASHBOARD ACTION CARDS
                ========================= */}

                <div className="dashboard-grid">

                    {/* Browse Jobs */}

                    <div className="dashboard-card">

                        <p className="card-label">
                            EMPLOYMENT
                        </p>

                        <h2>
                            Browse Jobs
                        </h2>

                        <p>
                            Explore available employment opportunities
                            and view job requirements, skills, education
                            and experience.
                        </p>

                        <Link
                            to="/jobs"
                            className="primary-button"
                        >
                            Explore Jobs
                        </Link>

                    </div>


                    {/* Recommended Jobs */}

                    <div className="dashboard-card">

                        <p className="card-label">
                            AI MATCHING
                        </p>

                        <h2>
                            Recommended Jobs
                        </h2>

                        <p>
                            View jobs ranked according to your profile
                            skills and skills extracted from your resume.
                        </p>

                        <Link
                            to="/job-matches"
                            className="primary-button"
                        >
                            View Recommendations
                        </Link>

                    </div>


                    {/* Applications */}

                    <div className="dashboard-card">

                        <p className="card-label">
                            APPLICATIONS
                        </p>

                        <h2>
                            My Applications
                        </h2>

                        <p>
                            Track the jobs you have applied for and
                            monitor your application status.
                        </p>

                        <Link
                            to="/applications"
                            className="primary-button"
                        >
                            View Applications
                        </Link>

                    </div>


                    {/* Manage Profile */}

                    <div className="dashboard-card">

                        <p className="card-label">
                            CANDIDATE PROFILE
                        </p>

                        <h2>
                            Manage Your Profile
                        </h2>

                        <p>
                            Maintain your personal information,
                            education, skills, experience, location
                            and resume.
                        </p>

                        <Link
                            to="/profile"
                            className="primary-button"
                        >
                            Manage Profile
                        </Link>

                    </div>

                </div>


                {/* =========================
                    MATCHING EXPLANATION
                ========================= */}

                <div className="dashboard-card matching-card">

                    <p className="card-label">
                        PERSONALIZED JOB MATCHING
                    </p>

                    <h2>
                        How Your Recommendations Work
                    </h2>

                    <p>
                        Your recommendations are generated using your
                        manually entered profile skills together with
                        skills extracted from your uploaded resume.
                    </p>


                    <div className="matching-steps">

                        <div>
                            <strong>01</strong>
                            <span>
                                Profile Skills
                            </span>
                        </div>

                        <div>
                            <strong>02</strong>
                            <span>
                                Resume Skill Extraction
                            </span>
                        </div>

                        <div>
                            <strong>03</strong>
                            <span>
                                TF-IDF + SBERT Matching
                            </span>
                        </div>

                        <div>
                            <strong>04</strong>
                            <span>
                                Skill Coverage
                            </span>
                        </div>

                        <div>
                            <strong>05</strong>
                            <span>
                                Ranked Job Recommendations
                            </span>
                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default Dashboard;