from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

import onnxruntime as ort
import numpy as np
from tokenizers import Tokenizer


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
# Skill extraction and comparison
# ---------------------------------------------------------

def extract_skills(skill_text: str) -> list[str]:

    if not skill_text:
        return []

    skills = []

    for skill in skill_text.split(","):

        skill = skill.strip()

        if skill:
            skills.append(skill)

    return skills


def compare_skills(
    candidate_skills: str,
    required_skills: str
):

    candidate_list = extract_skills(candidate_skills)
    required_list = extract_skills(required_skills)

    candidate_normalized = {
        preprocess_text(skill): skill
        for skill in candidate_list
    }

    matching_skills = []
    missing_skills = []

    for required_skill in required_list:

        normalized_required = preprocess_text(
            required_skill
        )

        if normalized_required in candidate_normalized:

            matching_skills.append(
                required_skill
            )

        else:

            missing_skills.append(
                required_skill
            )

    return matching_skills, missing_skills


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


# ---------------------------------------------------------
# SBERT + Cosine Similarity
# ---------------------------------------------------------

SBERT_MODEL_PATH = "sbert-model/model.onnx"
SBERT_TOKENIZER_PATH = "sbert-model/tokenizer.json"


sbert_session = ort.InferenceSession(
    SBERT_MODEL_PATH,
    providers=["CPUExecutionProvider"]
)


sbert_tokenizer = Tokenizer.from_file(
    SBERT_TOKENIZER_PATH
)


sbert_tokenizer.enable_truncation(
    max_length=256
)

sbert_tokenizer.enable_padding()


# ---------------------------------------------------------
# Create SBERT embeddings
# ---------------------------------------------------------

def create_sbert_embeddings(texts):

    encodings = sbert_tokenizer.encode_batch(texts)

    input_ids = np.array(
        [encoding.ids for encoding in encodings],
        dtype=np.int64
    )

    attention_mask = np.array(
        [encoding.attention_mask for encoding in encodings],
        dtype=np.int64
    )

    token_type_ids = np.array(
        [encoding.type_ids for encoding in encodings],
        dtype=np.int64
    )

    inputs = {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
        "token_type_ids": token_type_ids
    }

    outputs = sbert_session.run(
        None,
        inputs
    )

    # sentence_embedding is the second output
    return outputs[1]


# ---------------------------------------------------------
# Calculate cosine similarity
# ---------------------------------------------------------

def calculate_cosine_similarity(
    vector_a,
    vector_b
):

    dot_product = np.dot(
        vector_a,
        vector_b
    )

    norm_a = np.linalg.norm(vector_a)

    norm_b = np.linalg.norm(vector_b)

    return dot_product / (norm_a * norm_b)


# ---------------------------------------------------------
# SBERT Job Matching
# ---------------------------------------------------------

@app.post("/match/sbert")
def match_jobs_sbert(request: MatchRequest):

    # -----------------------------------------------------
    # 1. Prepare job texts
    # -----------------------------------------------------

    job_texts = []

    for job in request.jobs:

        text = (
            job.title + " " +
            job.description + " " +
            job.requiredSkills
        )

        job_texts.append(text)


    # -----------------------------------------------------
    # 2. Combine candidate and job texts
    # -----------------------------------------------------

    all_texts = [
        request.candidateSkills
    ] + job_texts


    # -----------------------------------------------------
    # 3. Generate SBERT embeddings
    # -----------------------------------------------------

    embeddings = create_sbert_embeddings(
        all_texts
    )


    # -----------------------------------------------------
    # 4. Separate candidate embedding
    # -----------------------------------------------------

    candidate_embedding = embeddings[0]

    results = []


    # -----------------------------------------------------
    # 5. Calculate similarity and compare skills
    # -----------------------------------------------------

    for i, job in enumerate(request.jobs):

        job_embedding = embeddings[i + 1]

        similarity = calculate_cosine_similarity(
            candidate_embedding,
            job_embedding
        )

        matching_skills, missing_skills = compare_skills(
            request.candidateSkills,
            job.requiredSkills
        )

        results.append({
            "jobId": job.id,
            "title": job.title,
            "similarityScore": round(
                float(similarity),
                4
            ),
            "matchingSkills": matching_skills,
            "missingSkills": missing_skills
        })


    # -----------------------------------------------------
    # 6. Sort jobs by similarity
    # -----------------------------------------------------

    results.sort(
        key=lambda x: x["similarityScore"],
        reverse=True
    )


    # -----------------------------------------------------
    # 7. Return SBERT results
    # -----------------------------------------------------

    return {
        "algorithm": "SBERT + Cosine Similarity",
        "matches": results
    }