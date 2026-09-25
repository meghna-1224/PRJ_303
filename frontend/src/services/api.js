const API_BASE_URL = "http://localhost:8080/api";

export async function getJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs`);

    if (!response.ok) {
        throw new Error("Failed to fetch jobs");
    }

    return response.json();
}

export async function getJobById(id) {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`);

    if (!response.ok) {
        throw new Error("Failed to fetch job");
    }

    return response.json();
}
export async function registerUser(userData) {

    const response = await fetch(
        "http://localhost:8080/api/auth/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        }
    );

    if (!response.ok) {
        throw new Error("Registration failed");
    }

    return await response.json();
}