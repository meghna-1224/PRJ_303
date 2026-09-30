from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re


app = FastAPI(
    title="PRJ_303 NLP Service",
    description="Candidate-job matching using NLP",
    version="1.1"
)


# ---------------------------------------------------------
# Input format for each job
# ---------------------------------------------------------

class Job(BaseModel):
    id: int
    title: str
    description: str
    requiredSkills: str


# ---------------------------------------------------------
# Input format for the matching API
# ---------------------------------------------------------

class MatchRequest(BaseModel):
    candidateSkills: str
    jobs: list[Job]


# ---------------------------------------------------------
# Text preprocessing
# ---------------------------------------------------------

def preprocess_text(text: str) -> str:

    if not text:
        return ""

    text = text.lower()

    # Normalize common technical terms
    text = text.replace("c++", "cpp")
    text = text.replace("c#", "csharp")
    text = text.replace(".net", "dotnet")
    text = text.replace("node.js", "nodejs")
    text = text.replace("node js", "nodejs")
    text = text.replace("react.js", "reactjs")
    text = text.replace("vue.js", "vuejs")

    # Normalize hyphens
    text = text.replace("-", " ")

    # Remove remaining special characters
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)

    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


# ---------------------------------------------------------
# Home endpoint
# ---------------------------------------------------------

@app.get("/")
def home():

    return {
        "message": "PRJ_303 NLP Service is running!"
    }


# ---------------------------------------------------------
# TF-IDF Job Matching
# ---------------------------------------------------------

@app.post("/match/tfidf")
def match_jobs(request: MatchRequest):

    # -----------------------------------------------------
    # 1. Prepare candidate text
    # -----------------------------------------------------

    candidate_text = preprocess_text(
        request.candidateSkills
    )


    # -----------------------------------------------------
    # 2. Create weighted representation of each job
    # -----------------------------------------------------

    job_texts = []

    for job in request.jobs:

        title = preprocess_text(job.title)

        description = preprocess_text(job.description)

        required_skills = preprocess_text(
            job.requiredSkills
        )

        # Required skills are repeated so that they
        # have more influence on the TF-IDF representation.
        weighted_text = (
            title + " "
            + description + " "
            + required_skills + " "
            + required_skills + " "
            + required_skills
        )

        job_texts.append(weighted_text)


    # -----------------------------------------------------
    # 3. Create TF-IDF documents
    # -----------------------------------------------------

    documents = [candidate_text] + job_texts


    # -----------------------------------------------------
    # 4. Convert text into TF-IDF vectors
    # -----------------------------------------------------

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        sublinear_tf=True
    )

    tfidf_matrix = vectorizer.fit_transform(
        documents
    )


    # -----------------------------------------------------
    # 5. Separate candidate and job vectors
    # -----------------------------------------------------

    candidate_vector = tfidf_matrix[0]

    job_vectors = tfidf_matrix[1:]


    # -----------------------------------------------------
    # 6. Calculate cosine similarity
    # -----------------------------------------------------

    similarities = cosine_similarity(
        candidate_vector,
        job_vectors
    ).flatten()


    # -----------------------------------------------------
    # 7. Prepare matching results
    # -----------------------------------------------------

    results = []

    for i, job in enumerate(request.jobs):

        results.append({
            "jobId": job.id,
            "title": job.title,
            "similarityScore": round(
                float(similarities[i]),
                4
            )
        })


    # -----------------------------------------------------
    # 8. Sort jobs from highest similarity to lowest
    # -----------------------------------------------------

    results.sort(
        key=lambda x: x["similarityScore"],
        reverse=True
    )


    # -----------------------------------------------------
    # 9. Return results
    # -----------------------------------------------------

    return {
        "algorithm": "Improved TF-IDF + Cosine Similarity",
        "matches": results
    }