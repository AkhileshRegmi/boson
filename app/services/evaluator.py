from traceback import print_tb
import json
import re
from groq import AsyncGroq
from app.core.config import settings
from app.core.logger import logger

# =========================================================
# CONFIG
# =========================================================
MODEL = "llama-3.3-70b-versatile"


# =========================================================
# DEFAULT SCORING CRITERIA
# =========================================================
DEFAULT_SCORING_CRITERIA = [
    {
        "criteria": "Relevant Experience",
        "weight": 25,
        "description": (
            "Evaluate how closely the candidate’s experience aligns "
            "with the role requirements, responsibilities, domain, "
            "and expected impact level. Score relative to the seniority "
            "of the role. Internship and entry-level roles should not "
            "be penalized for limited experience if the candidate shows "
            "strong relevance, initiative, ownership, or learning potential."
        ),
    },
    {
        "criteria": "Years of Relevant Experience",
        "weight": 20,
        "description": (
            "Evaluate the candidate’s total relevant experience relative "
            "to the role level and expectations. Use role-adjusted scoring: "
            "for internships and junior roles, smaller durations of highly "
            "relevant experience can still score well; for mid-level and "
            "senior roles, greater depth, progression, and sustained impact "
            "are expected."
        ),
    },
    {
        "criteria": "Education & Qualifications",
        "weight": 15,
        "description": (
            "Relevant academic background, degrees, coursework, "
            "and qualifications aligned with the role requirements."
        ),
    },
    {
        "criteria": "Trainings & Certifications",
        "weight": 15,
        "description": (
            "Relevant certifications, workshops, trainings, "
            "bootcamps, and specialized learning credentials."
        ),
    },
    {
        "criteria": "Technical Knowledge",
        "weight": 10,
        "description": (
            "Evaluate technical stack alignment, tools, frameworks, "
            "platforms, methodologies, and domain-specific knowledge "
            "relevant to the role."
        ),
    },
    {
        "criteria": "Leadership & Strategic Ability",
        "weight": 10,
        "description": (
            "Leadership, ownership, initiative, collaboration, "
            "decision-making, strategic thinking, mentoring, "
            "or organizational contributions appropriate to the role level."
        ),
    },
    {
        "criteria": "Communication & Soft Skills",
        "weight": 5,
        "description": (
            "Communication clarity, teamwork, stakeholder interaction, "
            "documentation quality, collaboration, adaptability, "
            "and interpersonal effectiveness."
        ),
    },
]

# =========================================================
# OUTPUT SCHEMA
# =========================================================
EVALUATION_SCHEMA = {
    "summary": "",
    "match_score": 0,
    "criteria_scores": [
        {
            "criteria": "",
            "weight": 0,
            "score": 0,
            "reason": "specific reason as to why that score given in short",
        }
    ],
    "strengths": [],
    "weaknesses": [],
}


# =========================================================
# HELPERS
# =========================================================
from app.services.llm_utils import clean_llm_response


# =========================================================
# MAIN FUNCTION
# =========================================================
async def evaluate_candidate(
    candidate_data: dict,
    job_description: str,
    scoring_criteria: list[dict] = DEFAULT_SCORING_CRITERIA,
    model: str = MODEL,
) -> dict:
    """
    Evaluate candidate against a job description

    Parameters
    ----------
    candidate_data : dict
        Parsed candidate JSON

    job_description : str
        Full job description text

    scoring_criteria : list[dict]
        Weighted evaluation criteria

    model : str
        Groq model name

    Returns
    -------
    dict
    """

    client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    prompt = f"""
You are an expert ATS evaluator and recruiter assistant.

Evaluate the candidate against the job description.

SCORING RULES:
- Total match_score MUST be calculated using weighted criteria
- Total score MUST be out of 100
- Each criterion score MUST respect its weight
- strengths maximum 5 items (minimum 2)
- weaknesses maximum 5 items (minimum 0)
- summary must be EXACTLY one short sentence
- Evaluation must be evidence-based from candidate data
- dont include unneccessary information
- be moderately lenient but not too much

RESPONSE RULES:
- Return ONLY valid JSON
- No markdown
- No explanations
- No extra keys
- Follow output schema EXACTLY

OUTPUT SCHEMA:
{json.dumps(EVALUATION_SCHEMA, indent=2)}

SCORING CRITERIA:
{json.dumps(scoring_criteria, indent=2)}

CANDIDATE:
{json.dumps(candidate_data, indent=2)}

JOB DESCRIPTION:
{job_description}
"""

    response = await client.chat.completions.create(
        model=model,
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a strict ATS evaluator. " "Always return valid JSON only."
                ),
            },
            {"role": "user", "content": prompt},
        ],
    )

    content = response.choices[0].message.content

    content = clean_llm_response(content)

    logger.info("Successfully evaluated candidate.")

    return json.loads(content)


# =========================================================
# EXAMPLE USAGE
# =========================================================
if __name__ == "__main__":

    candidate = json.loads("""
        
        {
  "personal_information": {
    "full_name": "Akhilesh Regmi",
    "email_address": "",
    "phone_number": "+977 9866299700",
    "date_of_birth": "",
    "current_address": "Kathmandu, Nepal",
    "current_location": "Kathmandu, Nepal",
    "linkedin_profile": "",
    "portfolio_or_github": ""
  },
  "academic_information": {
    "highest_qualification": "Bachelor of Technology (B.Tech) in Computer Science and Engineering",
    "institution_name": "Vellore Institute of Technology (VIT)",
    "graduation_year": "",
    "certifications": ""
  },
  "professional_information": {
    "years_of_experience": "",
    "current_company": "",
    "current_position": "",
    "skills": [
      "Python",
      "AI fundamentals",
      "problem modeling",
      "logic-based systems",
      "Supervised learning concepts",
      "data preprocessing",
      "model evaluation",
      "Small-scale application development",
      "debugging",
      "algorithmic thinking",
      "Hackathon collaboration",
      "analytical thinking",
      "continuous self-learning"
    ]
  }
}""")

    jd = """
    Mid-Level Data Analyst
Full-Time | Data & Analytics Team

Department

Data & Analytics

Level

Mid-Level (2–4 years experience)

Employment Type

Full-Time

Reports To

Analytics Manager / Head of Data

 

About the Role
We are seeking an analytical, detail-oriented Mid-Level Data Analyst to join our data team. In this role, you will be responsible for exploring complex datasets, uncovering actionable insights, and communicating findings to stakeholders across the business. You will work independently to define and execute analysis, while collaborating with engineers and business teams to ensure data is used effectively for decision-making.

Key Responsibilities
Perform in-depth analysis of structured data stored in Microsoft SQL Server and PostgreSQL to answer business questions and uncover trends.
Design, build, and maintain interactive dashboards and reports using SSRS and Apache Superset.
Work with SSIS pipelines to understand data flows and ensure analytical outputs are based on accurate, complete data.
Independently investigate datasets to detect hidden patterns, outliers, and correlations that drive business value.
Translate complex analytical findings into clear, concise narratives and visualizations for both technical and non-technical audiences.
Partner with business stakeholders to define analytical requirements, KPIs, and success metrics.
Validate data integrity and ensure consistency across reporting outputs and source systems.
Maintain and improve existing reports and dashboards as business requirements evolve.
Contribute to the development of a data-driven culture by promoting best practices in data interpretation and usage.
 
Required Skills & Qualifications
2–4 years of professional experience in a data analyst or similar role.
Strong proficiency in SQL with demonstrated ability to write complex queries, CTEs, window functions, and aggregations.
Hands-on experience working with Microsoft SQL Server and/or PostgreSQL databases.
Experience building reports and dashboards using SSRS or similar BI tools; familiarity with Apache Superset is a plus.
Advanced proficiency in Microsoft Excel, including pivot tables, VLOOKUP/XLOOKUP, conditional formatting, and data modelling.
Strong ability to independently explore data, form hypotheses, and validate findings through rigorous analysis.
Excellent critical thinking skills with the ability to connect data patterns to real-world business outcomes.
Strong written and verbal communication skills for presenting insights to stakeholders.
 
Nice to Have
Familiarity with SSIS pipeline concepts and ETL processes.
Experience with statistical analysis or basic predictive modelling.
Exposure to Python or R for data manipulation and analysis.
Experience working in an Agile or cross-functional team environment.
 
What We’re Looking For in You
We are not just looking for someone who can run reports — we want someone who brings genuine curiosity and analytical depth:

Data Intuition: You have a natural instinct for what data is telling you, and you know when something doesn’t look right.
Self-Starter: You work independently, manage your own analysis pipeline, and proactively surface insights without being asked.
Investigative Mindset: You enjoy going beyond the obvious — asking ‘why’ and digging until you find a meaningful answer.
Business Acumen: You can connect dots between data trends and their operational or strategic implications.
Communicator: You know how to present complex analysis simply and compellingly to people who aren’t data experts.
 
What We Offer
A data-first organization where your insights directly influence decisions.
Access to a modern analytics stack and the freedom to explore data creatively.
A collaborative team that values rigorous thinking and open knowledge sharing.
Clear growth path toward Senior Analyst or specialized data roles.
Competitive compensation and benefits package.    
    """

    import asyncio

    result = asyncio.run(
        evaluate_candidate(candidate_data=candidate, job_description=jd)
    )
