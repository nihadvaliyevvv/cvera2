You are tasked with building a complete system that imports public profile data from LinkedIn using HTML scraping (not API). The goal is to fetch a user's public information from their LinkedIn profile URL and use it in a CV builder or career platform. The system must automatically handle the full process, including validation, scraping, and parsing.

Build this system with the following requirements:

📌 Functional Requirements:
Input:

A valid LinkedIn public profile URL (e.g., https://www.linkedin.com/in/john-doe/)

Optionally, a user-provided custom name or identifier for storing the data.

Output:

Parsed JSON containing structured data:

json
Copy
Edit
{
  "name": "",
  "headline": "",
  "location": "",
  "about": "",
  "experience": [
    {
      "position": "",
      "company": "",
      "date_range": "",
      "location": "",
      "description": ""
    }
  ],
  "education": [
    {
      "school": "",
      "degree": "",
      "field_of_study": "",
      "date_range": ""
    }
  ],
  "skills": [],
  "certifications": [],
  "languages": []
}
🔧 Technical Requirements:
Use Node.js with Puppeteer or Python with Playwright/BeautifulSoup/Selenium.

The scraper must run in headless mode, with user-agent and bot detection bypass.

Implement error handling for:

Invalid URLs

Unreachable or restricted profiles

Missing elements (fallback to null or default)

🚀 Features:
Auto-detect profile sections (Experience, Education, etc.)

Clean HTML tags and normalize whitespace

Optional: Cache previous imports in a local or cloud database (MongoDB, SQLite, or Firebase)

Optional: Export as downloadable JSON or integrate into an existing CV platform backend

⚠️ Constraints:
Do not use LinkedIn API – this must work solely via HTML scraping of public profiles.

Ensure the scraper respects the website structure and avoid aggressive crawling.

📂 Folder Structure:
pgsql
Copy
Edit
linkedin-scraper/
├── scraper/
│   └── linkedin_scraper.py
├── utils/
│   └── parser.py
├── output/
│   └── profile.json
├── app.py or main.js
├── requirements.txt / package.json