
const API_BASE_URL = "http://localhost:8080/api";

// 1. Get all jobs from the MySQL database through Spring Boot
export async function getJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs`);

    if (!response.ok) {
        throw new Error("Failed to fetch jobs");
    }

    return response.json();
}

// 2. Get a specific job by its ID
export async function getJobById(id) {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`);

    if (!response.ok) {
        throw new Error("Failed to fetch job");
    }

    return response.json();
}

// 3. Register a new user
export async function registerUser(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Registration failed");
    }

    return response.json();
}

// 4. Get NLP-matched jobs for a candidate
// Spring Boot retrieves the candidate's profile and jobs,
// then calls the Python FastAPI NLP service.
export async function getJobMatches(userId) {
    const response = await fetch(
        `${API_BASE_URL}/matches/${userId}`
    );

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to fetch job matches");
    }

    return response.json();
}