const API_BASE_URL = "http://localhost:8080/api";

// Get the JWT token stored after login
function getAuthHeaders() {
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!loggedInUser) {
        return {};
    }

    const user = JSON.parse(loggedInUser);

    if (!user.token) {
        return {};
    }

    return {
        Authorization: `Bearer ${user.token}`
    };
}

// 1. Get all jobs
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

// 4. Get NLP-matched jobs
export async function getJobMatches(userId) {
    const response = await fetch(
        `${API_BASE_URL}/matches/${userId}`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to fetch job matches");
    }

    return response.json();
}

// 5. Get SBERT job matches
export async function getSbertJobMatches(userId) {
    const response = await fetch(
        `${API_BASE_URL}/matches/sbert/${userId}`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch SBERT job matches");
    }

    return response.json();
}

// 6. Upload candidate resume
export async function uploadResume(userId, file) {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        `${API_BASE_URL}/resume/upload/${userId}`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: formData
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Resume upload failed"
        );
    }

    return data;
}

// 7. Send a message to the PGRKAM chatbot
export async function sendChatMessage(message) {
    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify({
            message: message
        })
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Chatbot request failed");
    }

    return response.json();
}