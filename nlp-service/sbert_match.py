import onnxruntime as ort
import numpy as np
from tokenizers import Tokenizer


# --------------------------------------------------
# 1. Load SBERT ONNX model
# --------------------------------------------------

MODEL_PATH = "sbert-model/model.onnx"
TOKENIZER_PATH = "sbert-model/tokenizer.json"

session = ort.InferenceSession(
    MODEL_PATH,
    providers=["CPUExecutionProvider"]
)

tokenizer = Tokenizer.from_file(TOKENIZER_PATH)

# Maximum sequence length supported by our model
tokenizer.enable_truncation(max_length=256)
tokenizer.enable_padding()


# --------------------------------------------------
# 2. Function to create SBERT embeddings
# --------------------------------------------------

def create_embeddings(texts):

    encodings = tokenizer.encode_batch(texts)

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

    outputs = session.run(
        None,
        inputs
    )

    # sentence_embedding is the second output
    sentence_embeddings = outputs[1]

    return sentence_embeddings


# --------------------------------------------------
# 3. Cosine similarity
# --------------------------------------------------

def cosine_similarity(vector_a, vector_b):

    dot_product = np.dot(vector_a, vector_b)

    norm_a = np.linalg.norm(vector_a)
    norm_b = np.linalg.norm(vector_b)

    return dot_product / (norm_a * norm_b)


# --------------------------------------------------
# 4. Test candidate and job
# --------------------------------------------------

candidate_text = """
Java, Spring Boot, SQL, REST API, web development
"""

job_text = """
Software Developer.
Develop and maintain web applications using Java,
Spring Boot, SQL and REST API.
"""

texts = [
    candidate_text,
    job_text
]

embeddings = create_embeddings(texts)

candidate_embedding = embeddings[0]
job_embedding = embeddings[1]

score = cosine_similarity(
    candidate_embedding,
    job_embedding
)


# --------------------------------------------------
# 5. Display results
# --------------------------------------------------

print("SBERT model loaded successfully!")

print(
    "Candidate embedding shape:",
    candidate_embedding.shape
)

print(
    "Job embedding shape:",
    job_embedding.shape
)

print(
    "SBERT cosine similarity:",
    round(float(score), 4)
)