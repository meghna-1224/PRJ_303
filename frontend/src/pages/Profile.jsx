import { useEffect, useState } from "react";

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

    useEffect(() => {

        async function loadProfile() {

            try {

                const storedUser =
                    localStorage.getItem("loggedInUser");

                if (!storedUser) {
                    setMessage("Please log in to view your profile.");
                    setLoading(false);
                    return;
                }

                const user = JSON.parse(storedUser);

                const response = await fetch(
                    `http://localhost:8080/api/profile/${user.id}`
                );

                if (response.ok) {

                    const savedProfile = await response.json();

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

                } else if (response.status === 404) {

                    // User does not have a profile yet.
                    setIsEditing(true);

                } else {

                    setMessage("Unable to load profile.");

                }

            } catch (error) {

                console.error("Error loading profile:", error);
                setMessage("Unable to connect to the server.");

            } finally {

                setLoading(false);

            }
        }

        loadProfile();

    }, []);

    function handleChange(event) {

        const { name, value } = event.target;

        setProfile({
            ...profile,
            [name]: value
        });
    }

    async function handleSubmit(event) {

        event.preventDefault();

        try {

            const storedUser =
                localStorage.getItem("loggedInUser");

            if (!storedUser) {
                setMessage("Please log in before saving your profile.");
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

                setMessage("Profile saved successfully!");

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
                                <strong>Years of Experience</strong>
                                <p>
                                    {profile.experienceYears}
                                </p>
                            </div>

                            <div className="profile-field">
                                <strong>Current Location</strong>
                                <p>{profile.location}</p>
                            </div>

                            <div className="profile-field">
                                <strong>Preferred Job Location</strong>
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

            </div>

        </main>
    );
}

export default Profile;