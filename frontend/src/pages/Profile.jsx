
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    uploadResume,
    getAuthHeaders
} from "../services/api";

const emptyProfile = {
    education: "",
    degree: "",
    skills: "",
    experienceYears: "",
    location: "",
    preferredLocation: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    tenthPercentage: "",
    twelfthPercentage: "",
    university: "",
    graduationYear: "",
    graduationPercentage: ""
};

const steps = [
    { title: "Personal Details", description: "Your contact information" },
    { title: "Academic Details", description: "Your educational background" },
    { title: "Employment Details", description: "Your skills and preferences" },
    { title: "Resume Upload", description: "Complete your profile" }
];

function Profile() {
    const [profile, setProfile] = useState(emptyProfile);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [step, setStep] = useState(0);

    const [currentResume, setCurrentResume] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeMessage, setResumeMessage] = useState("");
    const [resumeUploading, setResumeUploading] = useState(false);
    const [showReplaceResume, setShowReplaceResume] = useState(false);

    useEffect(() => {
        loadProfileAndResume();
    }, []);

    async function loadProfileAndResume() {
        try {
            const storedUser = localStorage.getItem("loggedInUser");

            if (!storedUser) {
                setMessage("Please log in to view your profile.");
                return;
            }

            const user = JSON.parse(storedUser);

            const profileResponse = await fetch(
                `http://localhost:8080/api/profile/${user.id}`,
                { headers: getAuthHeaders() }
            );

            if (profileResponse.ok) {
                const data = await profileResponse.json();

                setProfile({
                    education: data.education || "",
                    degree: data.degree || "",
                    skills: data.skills || "",
                    experienceYears: data.experienceYears ?? "",
                    location: data.location || "",
                    preferredLocation: data.preferredLocation || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    dateOfBirth: data.dateOfBirth || "",
                    tenthPercentage: data.tenthPercentage ?? "",
                    twelfthPercentage: data.twelfthPercentage ?? "",
                    university: data.university || "",
                    graduationYear: data.graduationYear ?? "",
                    graduationPercentage: data.graduationPercentage ?? ""
                });

                setIsEditing(false);
            } else if (profileResponse.status === 404) {
                setIsEditing(true);
                setStep(0);
            } else {
                setMessage("Unable to load your profile.");
            }

            const resumeResponse = await fetch(
                `http://localhost:8080/api/resume/${user.id}`,
                { headers: getAuthHeaders() }
            );

            if (resumeResponse.ok) {
                setCurrentResume(await resumeResponse.json());
            } else if (resumeResponse.status === 404) {
                setCurrentResume(null);
            }
        } catch (error) {
            console.error("Profile loading error:", error);
            setMessage("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setProfile(previous => ({
            ...previous,
            [name]: value
        }));
    }

    function getProfilePayload() {
        return {
            ...profile,
            experienceYears:
                profile.experienceYears === ""
                    ? null : Number(profile.experienceYears),
            tenthPercentage:
                profile.tenthPercentage === ""
                    ? null : Number(profile.tenthPercentage),
            twelfthPercentage:
                profile.twelfthPercentage === ""
                    ? null : Number(profile.twelfthPercentage),
            graduationYear:
                profile.graduationYear === ""
                    ? null : Number(profile.graduationYear),
            graduationPercentage:
                profile.graduationPercentage === ""
                    ? null : Number(profile.graduationPercentage)
        };
    }

    async function saveProfile() {
        const storedUser = localStorage.getItem("loggedInUser");

        if (!storedUser) {
            setMessage("Please log in before saving your profile.");
            return false;
        }

        try {
            const user = JSON.parse(storedUser);

            const response = await fetch(
                `http://localhost:8080/api/profile/${user.id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify(getProfilePayload())
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Profile save error:", errorText);
                setMessage("Unable to save your profile. Please try again.");
                return false;
            }

            const saved = await response.json();

            setProfile(previous => ({
                ...previous,
                ...saved,
                experienceYears: saved.experienceYears ?? "",
                tenthPercentage: saved.tenthPercentage ?? "",
                twelfthPercentage: saved.twelfthPercentage ?? "",
                graduationYear: saved.graduationYear ?? "",
                graduationPercentage: saved.graduationPercentage ?? ""
            }));

            setMessage("Profile details saved successfully.");
            return true;
        } catch (error) {
            console.error("Profile save error:", error);
            setMessage("Unable to connect to the server.");
            return false;
        }
    }

    async function handleNext(event) {
        event.preventDefault();
        setMessage("");

        if (step === 2) {
            const saved = await saveProfile();

            if (!saved) return;
        }

        setStep(previous => Math.min(previous + 1, 3));
    }

    function handleBack() {
        setMessage("");
        setStep(previous => Math.max(previous - 1, 0));
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
            setResumeMessage("Please select a PDF, DOC or DOCX file.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setResumeFile(null);
            setResumeMessage("Your resume must be smaller than 5 MB.");
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
            const storedUser = localStorage.getItem("loggedInUser");

            if (!storedUser) {
                setResumeMessage("Please log in before uploading your resume.");
                return;
            }

            const user = JSON.parse(storedUser);

            setResumeUploading(true);
            setResumeMessage("Uploading and processing your resume...");

            await uploadResume(user.id, resumeFile);

            const response = await fetch(
                `http://localhost:8080/api/resume/${user.id}`,
                { headers: getAuthHeaders() }
            );

            if (response.ok) {
                setCurrentResume(await response.json());
            }

            setResumeFile(null);
            setShowReplaceResume(false);
            setIsEditing(false);
            setStep(0);
            setMessage("Your profile and resume have been saved successfully.");
            setResumeMessage("Resume uploaded successfully!");
        } catch (error) {
            console.error("Resume upload error:", error);
            setResumeMessage(error.message || "Unable to upload your resume.");
        } finally {
            setResumeUploading(false);
        }
    }

    function finishProfile() {
        setIsEditing(false);
        setStep(0);
        setMessage("Your profile has been saved successfully.");
        setResumeMessage("");
    }

    function startEditing() {
        setMessage("");
        setStep(0);
        setIsEditing(true);
    }

    function renderField(label, name, placeholder, type = "text", options = {}) {
        return (
            <div className="wizard-field" key={name}>
                <label htmlFor={name}>{label}</label>
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={profile[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required={options.required || false}
                    min={options.min}
                    max={options.max}
                    step={options.step}
                />
            </div>
        );
    }

    if (loading) {
        return (
            <main className="profile-page">
                <div className="profile-loading">Loading your profile...</div>
            </main>
        );
    }

    if (!localStorage.getItem("loggedInUser")) {
        return (
            <main className="profile-page">
                <div className="profile-loading">
                    <h2>Please log in to continue</h2>
                    <p>Your profile is available after signing in.</p>
                    <Link to="/login" className="wizard-primary-button">
                        Login
                    </Link>
                </div>
            </main>
        );
    }

    const progress = ((step + 1) / steps.length) * 100;

    return (
        <main className="profile-page">
            <div className="profile-page-heading">
                <p className="profile-eyebrow">PGRKAM EMPLOYMENT SERVICES</p>
                <h1>My Profile</h1>
                <p>
                    Build your professional profile to discover employment
                    opportunities that match your qualifications and skills.
                </p>
            </div>

            {!isEditing ? (
                <section className="profile-view-card">
                    <div className="profile-view-header">
                        <div>
                            <span className="profile-eyebrow">YOUR ACCOUNT</span>
                            <h2>Profile Overview</h2>
                            <p>Your information is saved in your PGRKAM profile.</p>
                        </div>
                        <button
                            className="wizard-primary-button"
                            onClick={startEditing}
                        >
                            Edit Profile
                        </button>
                    </div>

                    <div className="profile-view-grid">
                        {[
                            ["Phone Number", profile.phone],
                            ["Date of Birth", profile.dateOfBirth],
                            ["Address", profile.address],
                            ["Education", profile.education],
                            ["Degree", profile.degree],
                            ["University / College", profile.university],
                            ["Graduation Year", profile.graduationYear],
                            ["Graduation Percentage", profile.graduationPercentage],
                            ["10th Percentage", profile.tenthPercentage],
                            ["12th Percentage", profile.twelfthPercentage],
                            ["Skills", profile.skills],
                            ["Experience", profile.experienceYears === "" ? "" : `${profile.experienceYears} years`],
                            ["Current Location", profile.location],
                            ["Preferred Location", profile.preferredLocation]
                        ].map(([label, value]) => (
                            <div className="profile-view-field" key={label}>
                                <span>{label}</span>
                                <strong>{value || "Not provided"}</strong>
                            </div>
                        ))}
                    </div>

                    <div className="profile-view-resume">
                        <h3>Resume</h3>
                        {currentResume ? (
                            <>
                                <p>{currentResume.fileName}</p>
                                {currentResume.extractedSkills && (
                                    <p className="resume-detected-skills">
                                        <strong>Detected skills:</strong>{" "}
                                        {currentResume.extractedSkills}
                                    </p>
                                )}
                                <button
                                    className="wizard-secondary-button"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setStep(3);
                                        setShowReplaceResume(true);
                                    }}
                                >
                                    Replace Resume
                                </button>
                            </>
                        ) : (
                            <p>No resume uploaded yet.</p>
                        )}
                    </div>
                </section>
            ) : (
                <div className="profile-wizard">
                    <aside className="wizard-sidebar">
                        <div className="wizard-brand">
                            <span className="wizard-brand-mark">P</span>
                            <div>
                                <strong>PGRKAM</strong>
                                <span>Employment Services</span>
                            </div>
                        </div>

                        <div className="wizard-step-list">
                            {steps.map((item, index) => (
                                <div
                                    className={`wizard-step ${
                                        index === step ? "active" : ""
                                    } ${index < step ? "completed" : ""}`}
                                    key={item.title}
                                >
                                    <div className="wizard-step-number">
                                        {index < step ? "✓" : index + 1}
                                    </div>
                                    <div>
                                        <strong>{item.title}</strong>
                                        <span>{item.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="wizard-progress-card">
                            <div className="wizard-progress-label">
                                <strong>{Math.round(progress)}% completed</strong>
                                <span>Step {step + 1}/4</span>
                            </div>
                            <div className="wizard-progress-track">
                                <div
                                    className="wizard-progress-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </aside>

                    <section className="wizard-content">
                        <div className="wizard-content-heading">
                            <span className="profile-eyebrow">
                                PROFILE REGISTRATION
                            </span>
                            <h2>{steps[step].title}</h2>
                            <p>{steps[step].description}. Please provide the details below.</p>
                        </div>

                        {step < 3 ? (
                            <form onSubmit={handleNext}>
                                {step === 0 && (
                                    <div className="wizard-form-grid">
                                        {renderField("Phone Number", "phone", "Enter your phone number", "tel", { required: true })}
                                        {renderField("Date of Birth", "dateOfBirth", "", "date")}
                                        <div className="wizard-field full-width">
                                            <label htmlFor="address">Full Address</label>
                                            <textarea
                                                id="address"
                                                name="address"
                                                value={profile.address}
                                                onChange={handleChange}
                                                placeholder="Enter your full address"
                                                rows="3"
                                            />
                                        </div>
                                        {renderField("Current Location", "location", "e.g. Chandigarh", "text", { required: true })}
                                    </div>
                                )}

                                {step === 1 && (
                                    <div className="wizard-form-grid">
                                        {renderField("Highest Education", "education", "e.g. Bachelor's Degree", "text", { required: true })}
                                        {renderField("Degree / Specialisation", "degree", "e.g. B.Tech Computer Science", "text", { required: true })}
                                        {renderField("10th Percentage", "tenthPercentage", "e.g. 85.50", "number", { min: 0, max: 100, step: "0.01" })}
                                        {renderField("12th Percentage", "twelfthPercentage", "e.g. 82.00", "number", { min: 0, max: 100, step: "0.01" })}
                                        {renderField("University / College", "university", "Enter institution name")}
                                        {renderField("Graduation Year", "graduationYear", "e.g. 2026", "number", { min: 1950, max: 2100 })}
                                        {renderField("Graduation Percentage / CGPA", "graduationPercentage", "Enter percentage or CGPA", "number", { min: 0, max: 100, step: "0.01" })}
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="wizard-form-grid">
                                        <div className="wizard-field full-width">
                                            <label htmlFor="skills">Skills</label>
                                            <textarea
                                                id="skills"
                                                name="skills"
                                                value={profile.skills}
                                                onChange={handleChange}
                                                placeholder="e.g. Java, Python, SQL, React"
                                                rows="3"
                                                required
                                            />
                                            <span className="field-hint">
                                                Separate your skills with commas.
                                            </span>
                                        </div>
                                        {renderField("Years of Experience", "experienceYears", "e.g. 0", "number", { min: 0, required: true })}
                                        {renderField("Preferred Job Location", "preferredLocation", "e.g. Mohali", "text", { required: true })}
                                    </div>
                                )}

                                <div className="wizard-form-footer">
                                    <button
                                        type="button"
                                        className="wizard-secondary-button"
                                        onClick={handleBack}
                                        disabled={step === 0}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="wizard-primary-button"
                                    >
                                        {step === 2 ? "Save & Continue" : "Continue"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="resume-wizard-section">
                                <div className="resume-upload-icon">↑</div>
                                <h3>{currentResume && !showReplaceResume ? "Your Resume is Uploaded" : "Upload Your Resume"}</h3>
                                <p>
                                    Your resume helps the system identify your
                                    skills and improve your job recommendations.
                                </p>

                                {currentResume && !showReplaceResume ? (
                                    <div className="current-resume-box">
                                        <strong>{currentResume.fileName}</strong>
                                        <span>Current resume</span>
                                        <button
                                            className="wizard-secondary-button"
                                            onClick={() => {
                                                setShowReplaceResume(true);
                                                setResumeFile(null);
                                                setResumeMessage("");
                                            }}
                                        >
                                            Replace Resume
                                        </button>
                                    </div>
                                ) : (
                                    <div className="resume-drop-area">
                                        <label htmlFor="resume-file">
                                            <strong>Choose your resume file</strong>
                                            <span>PDF, DOC or DOCX · Maximum 5 MB</span>
                                        </label>
                                        <input
                                            id="resume-file"
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleResumeChange}
                                        />
                                        {resumeFile && (
                                            <p className="selected-resume">
                                                Selected: {resumeFile.name}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {resumeMessage && (
                                    <p className="wizard-message">{resumeMessage}</p>
                                )}

                                <div className="wizard-form-footer">
                                    <button
                                        className="wizard-secondary-button"
                                        onClick={handleBack}
                                        disabled={resumeUploading}
                                    >
                                        Back
                                    </button>

                                    {resumeFile ? (
                                        <button
                                            className="wizard-primary-button"
                                            onClick={handleResumeUpload}
                                            disabled={resumeUploading}
                                        >
                                            {resumeUploading ? "Uploading..." : "Upload & Finish"}
                                        </button>
                                    ) : (
                                        <button
                                            className="wizard-primary-button"
                                            onClick={finishProfile}
                                            disabled={resumeUploading}
                                        >
                                            {currentResume ? "Finish" : "Finish Without Resume"}
                                        </button>
                                    )}
                                </div>

                                {showReplaceResume && (
                                    <button
                                        className="wizard-text-button"
                                        onClick={() => {
                                            setShowReplaceResume(false);
                                            setResumeFile(null);
                                            setResumeMessage("");
                                        }}
                                    >
                                        Cancel replacement
                                    </button>
                                )}
                            </div>
                        )}

                        {message && (
                            <p className="wizard-message">{message}</p>
                        )}
                    </section>
                </div>
            )}
        </main>
    );
}

export default Profile;
