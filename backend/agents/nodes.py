from config.llm import ask_gemini_json, search_web, fetch_job_page_text
from config.hunter import find_verified_email

# ==========================================
# NODE 1: Parse the Job Input (LinkedIn, Naukri, Workday, etc.)
# ==========================================
def parse_job_node(state: dict) -> dict:
    print("\n" + "=" * 55, flush=True)
    print("[STEP 1/4] 🔎 Parsing Job Input...", flush=True)

    job_input = state["job_input"].strip()

    if job_input.startswith("http"):
        print("   -> Extracting job page title, meta & content...", flush=True)
        job_content = fetch_job_page_text(job_input)
    else:
        job_content = job_input

    prompt = f"""
    Extract the exact job details from this Indian job posting.
    NOTE: Never return "LinkedIn" or "Workday" or "Naukri" as the company_name! Find the actual hiring company name.
    If location is not mentioned, default to "Bengaluru, India".

    Original Input / URL:
    {job_input}

    Extracted Page Content:
    {job_content}

    Return JSON with this exact format:
    {{
        "company_name": "Actual Hiring Company Name",
        "company_domain": "officialcompanywebsite.com",
        "job_role": "Exact Job Title",
        "department": "Data Science or Engineering or Product",
        "location": "Indian City (e.g. Bengaluru, Hyderabad, Pune, Gurgaon, Mumbai)",
        "key_skills": ["Skill 1", "Skill 2", "Skill 3"]
    }}
    """

    job_data = ask_gemini_json(prompt)
    state["job_data"] = job_data
    state["completed_steps"].append("parse_job")

    print(
        f"   ✅ Parsed: {job_data.get('job_role')} @ {job_data.get('company_name')} "
        f"({job_data.get('location')}) | Domain: {job_data.get('company_domain')}",
        flush=True,
    )
    return state


# ==========================================
# NODE 2: Find 3-4 INDIAN Hiring Managers & Recruiters
# ==========================================
def find_hm_node(state: dict) -> dict:
    job = state["job_data"]
    company = job["company_name"]
    domain = job.get("company_domain", "").lower().strip()
    department = job["department"]
    role = job["job_role"]
    location = job.get("location", "India")

    print(
        f"\n[STEP 2/4] 🇮🇳 Searching Indian LinkedIn (in.linkedin.com) for {company} managers in {location}...",
        flush=True,
    )

    # Search specifically on in.linkedin.com/in (India LinkedIn subdomain!)
    query_1 = (
        f'site:in.linkedin.com/in "{company}" '
        f'("{department}" OR "Engineering Manager" OR "Head" OR "Director" OR "Lead") '
        f'("{location}" OR "India" OR "Bengaluru" OR "Hyderabad" OR "Pune" OR "Gurgaon" OR "Mumbai")'
    )
    query_2 = (
        f'site:in.linkedin.com/in "{company}" '
        f'("Talent Acquisition" OR "Technical Recruiter" OR "University Recruiting" OR "HR") '
        f'("{location}" OR "India")'
    )

    search_results = search_web(query_1, max_results=6) + "\n---\n" + search_web(query_2, max_results=4)
    print("   -> Filtering strictly for India-based managers & verifying emails...", flush=True)

    prompt = f"""
    We are hiring for '{role}' ({department}) at {company} in {location}, India.
    Here are LinkedIn India profiles found via search:
    {search_results}

    CRITICAL RULES:
    1. Pick 3 to 4 REAL Indian professionals who work at {company} in India (Engineering Managers, {department} Leads, Directors, or Technical Recruiters).
    2. NEVER include non-Indian / foreign profiles. Every person MUST be based in India.
    3. Use the official corporate domain '{domain}' for predicted emails (format: firstname.lastname@{domain}). NEVER use @linkedin.com or @gmail.com.

    Return JSON with this exact format:
    {{
        "company_domain": "{domain}",
        "candidates": [
            {{
                "name": "Indian Manager Full Name",
                "title": "Their exact title at {company} (India)",
                "email": "firstname.lastname@{domain}",
                "linkedin": "https://in.linkedin.com/in/profile-slug",
                "confidence_score": 92,
                "why_match": "Leads {department} / Recruiting at {company} India"
            }}
        ]
    }}
    """

    result = ask_gemini_json(prompt)
    clean_domain = (result.get("company_domain") or domain).replace("https://", "").replace("www.", "").split("/")[0]
    candidates = result.get("candidates", [])[:4]

    # Verify each Indian manager's email with Hunter.io (or build clean corporate email)
    for person in candidates:
        name = person.get("name", "").strip()
        print(f"   -> Checking Hunter.io for {name} @ {clean_domain}...", flush=True)
        hunter_res = find_verified_email(name, clean_domain)

        if hunter_res["email"]:
            person["email"] = hunter_res["email"]
            person["email_status"] = "Verified Work Email ✓"
        else:
            # Build clean firstname.lastname@companydomain.com fallback
            parts = [p.lower() for p in name.split() if p.isalpha()]
            if len(parts) >= 2 and clean_domain:
                person["email"] = f"{parts[0]}.{parts[-1]}@{clean_domain}"
            person["email_status"] = "Corporate Pattern"

        person["sent"] = False

    state["hiring_managers"] = candidates
    state["hiring_manager"] = candidates[0] if candidates else {}
    state["confidence_score"] = candidates[0].get("confidence_score", 88) if candidates else 0
    state["completed_steps"].append("find_hiring_manager")

    print(f"   ✅ Found {len(candidates)} India-based contacts at {company}!", flush=True)
    return state

    
# ==========================================
# NODE 3: Deep Research for Personalization
# ==========================================
def research_node(state: dict) -> dict:
    hm = state["hiring_manager"]
    job = state["job_data"]

    print(f"\n[STEP 3/4] 🧠 Researching personalization hooks for {hm['name']} & {job['company_name']}...", flush=True)

    query = f'"{hm["name"]}" "{job["company_name"]}" OR "{job["company_name"]} {job["department"]} news blog"'
    search_results = search_web(query, max_results=4)

    prompt = f"""
    Find 2 specific personalization hooks for {hm["name"]} ({hm["title"]} at {job["company_name"]}) from these results:
    {search_results}

    Return JSON with this exact format:
    {{
        "hooks": [
            {{
                "source": "LinkedIn / Talk / Post",
                "title": "Short topic title",
                "detail": "1 sentence summary of what they shared or built"
            }},
            {{
                "source": "Company News",
                "title": "Recent company initiative",
                "detail": "1 sentence summary of a recent launch or engineering challenge"
            }}
        ]
    }}
    """

    state["research_data"] = ask_gemini_json(prompt)
    state["completed_steps"].append("research_personalization")

    hooks = state["research_data"].get("hooks", [])
    print(f"   ✅ Extracted {len(hooks)} personalization hooks!", flush=True)
    return state


# ==========================================
# NODE 4: Compose High-Converting Cold Email
# ==========================================
def compose_email_node(state: dict) -> dict:
    job = state["job_data"]
    hm = state["hiring_manager"]
    research = state["research_data"]
    resume = state.get("resume_dossier") or {}

    candidate_name = resume.get("full_name") or "Candidate"
    candidate_headline = resume.get("headline") or "Software Developer"
    candidate_hook = resume.get("signature_hook") or ""
    candidate_skills = ", ".join(resume.get("skills", []))

    # Format resume proof points cleanly
    metrics_list = resume.get("impact_metrics", [])
    formatted_metrics = "\n".join(
        [f"- {m.get('badge')}: {m.get('statement')}" for m in metrics_list]
    )

    # Format company/manager research hooks cleanly
    hooks_list = research.get("hooks", [])
    formatted_hooks = "\n".join(
        [f"- {h.get('title')}: {h.get('detail')}" for h in hooks_list]
    )

    hm_first_name = (hm.get("name") or "there").split()[0]
    company = job.get("company_name", "your company")
    role = job.get("job_role", "Engineering role")

    print(f"\n[STEP 4/4] ✍️  Composing high-converting cold email...", flush=True)

    prompt = f"""
    You are an elite tech career ghostwriter in India. Write a sharp, natural, human cold email (110 to 145 words) from {candidate_name} to {hm.get("name")} ({hm.get("title")} at {company}) regarding the '{role}' opening.

    CANDIDATE DETAILS:
    - Name: {candidate_name} ({candidate_headline})
    - Core Summary: {candidate_hook}
    - Key Proof of Work:
    {formatted_metrics}
    - Tech Stack: {candidate_skills}

    COMPANY / MANAGER CONTEXT:
    - Role: {role} at {company} ({job.get("location", "India")})
    - Required Skills: {", ".join(job.get("key_skills", []))}
    - Recent Company/Team Insights:
    {formatted_hooks}

    STRICT WRITING RULES (Follow this exact structure):
    1. Greeting: Start with "Hi {hm_first_name},"
    2. Opening (1-2 short sentences): Mention seeing the {role} opening at {company} and reference 1 specific detail about what {company}'s team is building (from the insights above). Sound like a real engineer/builder, NOT a fanboy.
    3. Proof of Work (2 crisp bullet points starting with "• "): Highlight the candidate's 2 strongest achievements/metrics from their resume that directly prove they can ship from Day 1 in this {role} role.
    4. Call to Action (1 short sentence): Ask if they'd be open to a quick 10-minute chat this week or if you can share your GitHub/work samples.
    5. Sign-off:
       Best,
       {candidate_name}
       {candidate_headline}

    BANNED AI WORDS (Never use these):
    "I hope this email finds you well", "thrilled", "delighted", "resonated deeply", "testament", "spearheaded", "synergy", "passionate", "unwavering".

    Return JSON with this exact format:
    {{
        "subject_line_a": "{role} — {candidate_name} (Built/Scaled [1 short proof point from resume])",
        "subject_line_b": "Quick note re: {role} at {company}",
        "email_body": "Hi {hm_first_name},\\n\\n[Opening paragraph]\\n\\n• [Proof point 1]\\n• [Proof point 2]\\n\\n[Closing CTA]\\n\\nBest,\\n{candidate_name}\\n{candidate_headline}",
        "word_count": 125
    }}
    """

    state["email_draft"] = ask_gemini_json(prompt)
    state["completed_steps"].append("compose_email")

    print(f"   ✅ Email Ready! Subject: \"{state['email_draft'].get('subject_line_a')}\"", flush=True)
    print("=" * 55 + "\n", flush=True)
    return state