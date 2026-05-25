import httpx
from app.core.logger import logger

async def verify_recaptcha(
    token: str,
    action: str,
    site_key: str,
    project_id: str,
    api_key: str
) -> bool:
    """
    Asynchronously verify reCAPTCHA Enterprise token against the Google API.
    """
    if not api_key:
        logger.warning("reCAPTCHA API Key is not set. Bypassing verification.")
        return True

    if not token:
        logger.error("reCAPTCHA verification failed: Token is empty or missing.")
        return False

    url = f"https://recaptchaenterprise.googleapis.com/v1/projects/{project_id}/assessments?key={api_key}"
    payload = {
        "event": {
            "token": token,
            "expectedAction": action,
            "siteKey": site_key
        }
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=10.0)
            
            if response.status_code != 200:
                logger.error(f"reCAPTCHA verification returned status code {response.status_code}: {response.text}")
                return False
                
            data = response.json()
            
            # Check properties of the token
            token_properties = data.get("tokenProperties", {})
            valid = token_properties.get("valid", False)
            
            if not valid:
                invalid_reason = token_properties.get("invalidReason", "Unknown reason")
                logger.error(f"reCAPTCHA token is invalid. Reason: {invalid_reason}")
                return False
                
            # Check expected action matches (only if expected_action is populated, as v2 keys do not have actions)
            expected_action = token_properties.get("action")
            if action and expected_action and expected_action != action:
                logger.error(f"reCAPTCHA action mismatch. Expected: {action}, got: {expected_action}")
                return False
                
            risk_analysis = data.get("riskAnalysis", {})
            score = risk_analysis.get("score")
            logger.info(f"reCAPTCHA verification successful. Token is valid. Score: {score}")
            return True

    except Exception as e:
        logger.error(f"Error calling reCAPTCHA Enterprise API: {str(e)}")
        return False
