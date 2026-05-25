import re

def clean_llm_response(content: str) -> str:
    """
    Clean markdown wrappers from LLM response
    """
    content = content.strip()
    content = re.sub(r"^```json", "", content)
    content = re.sub(r"^```", "", content)
    content = re.sub(r"```$", "", content)
    return content.strip()
