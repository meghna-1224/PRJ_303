import { useEffect, useState } from "react";

import { uploadResume } from "../services/api";

function Profile() {
    const [profile, setProfile] = useState({
        education: "",
        degree: "",
        skills: "",
        experienceYears: "",
        location: "",
        preferredLocation: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Resume states
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeMessage, setResumeMessage] = useState("");
    const [resumeUploading, setResumeUploading] = useState(false);
    const [currentResume, setCurrentResume] = useState(null);
    const [showReplaceResume, setShowReplaceResume] = useState(false);

    useEffect(() => {
        async function loadProfileAndResume() {
            try {
                const storedUser = localStorage.getItem("loggedInUser");

                if (!storedUser) {
                    setMessage("Please log in to view your profile.");
                    setLoading(false);
                    return;
                }

                const user = JSON.parse(storedUser);

                // Load profile
                const profileResponse = await fetch(
                    `http://localhost:8080/api/profile/${user.id}`
                );

                if (profileResponse.ok) {
                    const savedProfile = await profileResponse.json();

                    setProfile({
                        education: savedProfile.education || "",
                        degree: savedProfile.degree || "",
                        skills: savedProfile.skills || "",
                        experienceYears:
                            savedProfile.experienceYears ?? "",
                        location: savedProfile.location || "",
                        preferredLocation:
                            savedProfile.preferredLocation || ""
                    });

                    setIsEditing(false);
                } else if (profileResponse.status === 404) {
                    // User does not have a profile yet.
                    setIsEditing(true);
                } else {
                    setMessage("Unable to load profile.");
                }

                // Load current resume
                const resumeResponse = await fetch(
                    `http://localhost:8080/api/resume/${user.id}`
                );

                if (resumeResponse.ok) {
                    const resumeData = await resumeResponse.json();
                    setCurrentResume(resumeData);
                } else if (resumeResponse.status === 404) {
                    // No resume uploaded yet.
                    setCurrentResume(null);
                } else {
                    console.error("Unable to load current resume.");
                }
            } catch (error) {
                console.error(
                    "Error loading profile or resume:",
                    error
                );

                setMessage("Unable to connect to the server.");
            } finally {
                setLoading(false);
            }
        }

        loadProfileAndResume();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setProfile({
            ...profile,
            [name]: value
        });
    }

    function handleResumeChange(event) {
        const file = event.target.files[0];

        setResumeMessage("");

        if (!file) {
            setResumeFile(null);
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!allowedTypes.includes(file.type)) {
            setResumeFile(null);

            setResumeMessage(
                "Please upload a PDF, DOC, or DOCX file."
            );

            event.target.value = "";
            return;
        }

        // Maximum file size: 5 MB
        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            setResumeFile(null);

            setResumeMessage(
                "Resume file must be smaller than 5 MB."
            );

            event.target.value = "";
            return;
        }

        setResumeFile(file);
    }

    async function handleResumeUpload() {
        if (!resumeFile) {
            setResumeMessage("Please select a resume first.");
            return;
        }

        try {
            const storedUser =
                localStorage.getItem("loggedInUser");

            if (!storedUser) {
                setResumeMessage(
                    "Please log in before uploading your resume."
                );
                return;
            }

            const user = JSON.parse(storedUser);

            setResumeUploading(true);
            setResumeMessage("Uploading resume...");

            const data = await uploadResume(
                user.id,
                resumeFile
            );

            console.log(
                "Resume upload response:",
                data
            );

            // Fetch the latest resume information
            const resumeResponse = await fetch(
                `http://localhost:8080/api/resume/${user.id}`
            );

            if (resumeResponse.ok) {
                const updatedResume =
                    await resumeResponse.json();

                setCurrentResume(updatedResume);
            }

            setResumeMessage(
                "Resume uploaded successfully!"
            );

            setResumeFile(null);
            setShowReplaceResume(false);
        } catch (error) {
            console.error(
                "Error uploading resume:",
                error
            );

            setResumeMessage(
                error.message ||
                "Unable to upload resume. Please try again."
            );
        } finally {
            setResumeUploading(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const storedUser =
                localStorage.getItem("loggedInUser");

            if (!storedUser) {
                setMessage(
                    "Please log in before saving your profile."
                );
                return;
            }

            const user = JSON.parse(storedUser);

            const response = await fetch(
                `http://localhost:8080/api/profile/${user.id}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        education: profile.education,
                        degree: profile.degree,
                        skills: profile.skills,
                        experienceYears:
                            Number(profile.experienceYears),
                        location: profile.location,
                        preferredLocation:
                            profile.preferredLocation
                    })
                }
            );

            if (response.ok) {
                const savedProfile =
                    await response.json();

                console.log(
                    "Saved profile:",
                    savedProfile
                );

                setProfile({
                    education: savedProfile.education || "",
                    degree: savedProfile.degree || "",
                    skills: savedProfile.skills || "",
                    experienceYears:
                        savedProfile.experienceYears ?? "",
                    location: savedProfile.location || "",
                    preferredLocation:
                        savedProfile.preferredLocation || ""
                });

                setMessage(
                    "Profile saved successfully!"
                );

                setIsEditing(false);
            } else {
                const errorMessage =
                    await response.text();

                console.error(
                    "Profile save error:",
                    errorMessage
                );

                setMessage(
                    "Unable to save profile. Please try again."
                );
            }
        } catch (error) {
            console.error(
                "Error saving profile:",
                error
            );

            setMessage(
                "Unable to connect to the server."
            );
        }
    }

    if (loading) {
        return (
            <main className="auth-page">
                <div className="auth-container">
                    <p>Loading profile...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="auth-page">
            <div className="auth-container profile-container">

                <div className="auth-header">
                    <p className="hero-label">
                        PGRKAM EMPLOYMENT SERVICES
                    </p>

                    <h1>My Profile</h1>

                    <p>
                        Maintain your education, skills and
                        employment preferences to improve your
                        job search.
                    </p>
                </div>

                {!isEditing ? (
                    <>
                        <div className="profile-summary">

                            <div className="profile-field">
                                <strong>Education</strong>
                                <p>{profile.education}</p>
                            </div>

                            <div className="profile-field">
                                <strong>Degree</strong>
                                <p>{profile.degree}</p>
                            </div>

                            <div className="profile-field">
                                <strong>Skills</strong>
                                <p>{profile.skills}</p>
                            </div>

                            <div className="profile-field">
                                <strong>
                                    Years of Experience
                                </strong>

                                <p>
                                    {profile.experienceYears}
                                </p>
                            </div>

                            <div className="profile-field">
                                <strong>
                                    Current Location
                                </strong>

                                <p>{profile.location}</p>
                            </div>

                            <div className="profile-field">
                                <strong>
                                    Preferred Job Location
                                </strong>

                                <p>
                                    {profile.preferredLocation}
                                </p>
                            </div>

                        </div>

                        <button
                            type="button"
                            className="primary-button auth-submit"
                            onClick={() => {
                                setMessage("");
                                setIsEditing(true);
                            }}
                        >
                            Edit Profile
                        </button>
                    </>
                ) : (
                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">
                            <label htmlFor="education">
                                Education
                            </label>

                            <input
                                id="education"
                                name="education"
                                type="text"
                                value={profile.education}
                                onChange={handleChange}
                                placeholder="e.g. Bachelor's Degree"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="degree">
                                Degree
                            </label>

                            <input
                                id="degree"
                                name="degree"
                                type="text"
                                value={profile.degree}
                                onChange={handleChange}
                                placeholder="e.g. B.Tech Computer Science"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="skills">
                                Skills
                            </label>

                            <input
                                id="skills"
                                name="skills"
                                type="text"
                                value={profile.skills}
                                onChange={handleChange}
                                placeholder="e.g. Java, Python, SQL"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="experienceYears">
                                Years of Experience
                            </label>

                            <input
                                id="experienceYears"
                                name="experienceYears"
                                type="number"
                                min="0"
                                value={profile.experienceYears}
                                onChange={handleChange}
                                placeholder="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">
                                Current Location
                            </label>

                            <input
                                id="location"
                                name="location"
                                type="text"
                                value={profile.location}
                                onChange={handleChange}
                                placeholder="e.g. Chandigarh"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="preferredLocation">
                                Preferred Job Location
                            </label>

                            <input
                                id="preferredLocation"
                                name="preferredLocation"
                                type="text"
                                value={profile.preferredLocation}
                                onChange={handleChange}
                                placeholder="e.g. Mohali"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="primary-button auth-submit"
                        >
                            Save Profile
                        </button>

                        {message && (
                            <p className="status-message">
                                {message}
                            </p>
                        )}

                    </form>
                )}

                {/* ================================================= */}
                {/* RESUME SECTION */}
                {/* ================================================= */}

                <section className="resume-section">

                    <div className="resume-header">

                        <p className="hero-label">
                            RESUME
                        </p>

                        {currentResume ? (
                            <>
                                <h2>Your Current Resume</h2>

                                <p>
                                    Your resume is currently
                                    being used to extract skills
                                    and improve your job
                                    recommendations.
                                </p>
                            </>
                        ) : (
                            <>
                                <h2>Upload Your Resume</h2>

                                <p>
                                    Upload your resume so the
                                    system can extract your skills
                                    and use them to improve job
                                    recommendations.
                                </p>
                            </>
                        )}

                    </div>

                    {/* Current Resume */}
                    {currentResume && !showReplaceResume && (
                        <div className="profile-summary">

                            <div className="profile-field">
                                <strong>
                                    Current Resume
                                </strong>

                                <p>
                                    📄 {currentResume.fileName}
                                </p>
                            </div>

                            {currentResume.uploadedAt && (
                                <div className="profile-field">
                                    <strong>
                                        Uploaded
                                    </strong>

                                    <p>
                                        {new Date(
                                            currentResume.uploadedAt
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {currentResume.extractedSkills && (
                                <div className="profile-field">
                                    <strong>
                                        Skills Detected From Resume
                                    </strong>

                                    <p>
                                        {currentResume.extractedSkills}
                                    </p>
                                </div>
                            )}

                        </div>
                    )}

                    {/* Replace Resume Button */}
                    {currentResume && !showReplaceResume && (
                        <button
                            type="button"
                            className="primary-button auth-submit"
                            onClick={() => {
                                setShowReplaceResume(true);
                                setResumeMessage("");
                                setResumeFile(null);
                            }}
                        >
                            Replace Resume
                        </button>
                    )}

                    {/* Upload / Replace Area */}
                    {(!currentResume || showReplaceResume) && (
                        <>

                            {showReplaceResume && (
                                <p className="status-message">
                                    Select a new resume to replace
                                    your current resume.
                                </p>
                            )}

                            <div className="form-group">

                                <label htmlFor="resume">
                                    {currentResume
                                        ? "Select New Resume"
                                        : "Select Resume"}
                                </label>

                                <input
                                    id="resume"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleResumeChange}
                                />

                                <p>
                                    Supported formats:
                                    PDF, DOC, DOCX
                                    <br />
                                    Maximum size: 5 MB
                                </p>

                            </div>

                            {resumeFile && (
                                <p className="status-message">
                                    Selected file:{" "}
                                    <strong>
                                        {resumeFile.name}
                                    </strong>
                                </p>
                            )}

                            <button
                                type="button"
                                className="primary-button auth-submit"
                                onClick={handleResumeUpload}
                                disabled={
                                    !resumeFile ||
                                    resumeUploading
                                }
                            >
                                {resumeUploading
                                    ? "Uploading..."
                                    : currentResume
                                        ? "Replace Resume"
                                        : "Upload Resume"}
                            </button>

                            {showReplaceResume && (
                                <button
                                    type="button"
                                    className="primary-button auth-submit"
                                    onClick={() => {
                                        setShowReplaceResume(false);
                                        setResumeFile(null);
                                        setResumeMessage("");
                                    }}
                                    disabled={resumeUploading}
                                >
                                    Cancel
                                </button>
                            )}

                        </>
                    )}

                    {resumeMessage && (
                        <p className="status-message">
                            {resumeMessage}
                        </p>
                    )}

                </section>

            </div>
        </main>
    );
}

export default Profile;