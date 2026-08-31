from typing import Dict, Any

JUDGE0_LANGUAGE_IDS = {
    "python": 71,       # Python (3.8.1)
    "javascript": 63,   # JavaScript (Node.js 12.14.0)
    "cpp": 54,          # C++ (GCC 9.2.0)
    "java": 62          # Java (OpenJDK 13.0.1)
}

LANGUAGE_EXTENSIONS = {
    "python": "py",
    "javascript": "js",
    "cpp": "cpp",
    "java": "java"
}

def get_judge0_language_id(language: str) -> int:
    lang = language.lower()
    if lang in JUDGE0_LANGUAGE_IDS:
        return JUDGE0_LANGUAGE_IDS[lang]
    if lang in ("py", "python3"):
        return 71
    if lang in ("js", "node", "nodejs"):
        return 63
    if lang in ("c++", "cpp17"):
        return 54
    return 71  # Default to Python