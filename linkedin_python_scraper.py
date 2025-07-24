#!/usr/bin/env python3
"""
LinkedIn Scraper Integration
Bu script Python linkedin_scraper kitabxanasından istifadə edərək LinkedIn profil məlumatlarını çıxarır
"""

import sys
import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import getpass

# Add the linkedin_scraper path
sys.path.insert(0, '/home/musayev/Documents/lastcvera/scra/linkedin_scraper-master')

try:
    from linkedin_scraper import Person, actions
    print("✅ LinkedIn scraper successfully imported")
except ImportError as ie:
    print(f"❌ LinkedIn scraper import error: {ie}")
    print("📍 Python path:", sys.path)
    sys.exit(1)


def setup_chrome_driver(headless=False):
    """Chrome driver-i konfiqurasiya et"""
    chrome_options = Options()
    
    if headless:
        chrome_options.add_argument('--headless')
    
    # Linux üçün uyğun konfiqurasiya
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-setuid-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-web-security')
    chrome_options.add_argument('--disable-features=VizDisplayCompositor')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    # Chrome binary path-ni tap
    chrome_paths = [
        '/usr/bin/google-chrome',
        '/usr/bin/chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium'
    ]
    
    chrome_binary = None
    for path in chrome_paths:
        if os.path.exists(path):
            chrome_binary = path
            print(f"✅ Chrome tapıldı: {path}")
            break
    
    if chrome_binary:
        chrome_options.binary_location = chrome_binary
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"❌ Chrome driver xətası: {e}")
        raise


def manual_login_and_scrape():
    """Manual giriş + öz profil scraping"""
    driver = None
    
    try:
        print("🚀 Manuel LinkedIn scraping başladılır...")
        print("📋 Browser açılacaq - manual olaraq LinkedIn-ə giriş edin")
        print("⏰ Giriş etdikdən sonra Enter düyməsini basın")
        
        # Browser-i görünür mode-da aç
        driver = setup_chrome_driver(headless=False)
        
        # LinkedIn login səhifəsinə get
        driver.get("https://www.linkedin.com/login")
        
        # Manuel giriş üçün gözlə
        input("🔐 LinkedIn-ə giriş edin və Enter düyməsini basın...")
        
        # Hazırki URL-i yoxla
        current_url = driver.current_url
        print(f"🔗 Hazırki URL: {current_url}")
        
        # Əgər hələ də login səhifəsindədirsə
        if 'login' in current_url:
            print("⚠️ Hələ də login səhifəsindəsiniz. Giriş edin və yenidən Enter basın...")
            input("🔐 Enter düyməsini basın...")
        
        # Öz profil URL-ini əldə et
        print("🔍 Öz profil URL-i axtarılır...")
        
        # Me səhifəsinə get
        driver.get("https://www.linkedin.com/in/me/")
        
        # URL-i əldə et
        profile_url = driver.current_url
        print(f"🎯 Profil URL: {profile_url}")
        
        # Person obyekti yarat və scrape et
        print("📊 Profil məlumatları çıxarılır...")
        person = Person(linkedin_url=profile_url, driver=driver, scrape=False)
        
        # Manual scraping
        person.scrape(close_on_complete=False)
        
        # Məlumatları JSON formatına çevir
        profile_data = {
            "name": person.name or "",
            "headline": person.job_title or "",
            "location": person.location or "",
            "about": " ".join(person.about) if person.about else "",
            "experience": [],
            "education": [],
            "skills": [],
            "certifications": [],
            "languages": [],
            "profileImage": "",
            "contactInfo": {
                "email": "",
                "phone": "",
                "website": "",
                "twitter": "",
                "linkedin": profile_url
            },
            "connections": "",
            "followers": ""
        }
        
        # Experience məlumatlarını əlavə et
        if person.experiences:
            for exp in person.experiences:
                profile_data["experience"].append({
                    "position": exp.position_title or "",
                    "company": exp.institution_name or "",
                    "date_range": exp.duration or "",
                    "location": exp.location or "",
                    "description": exp.description or ""
                })
        
        # Education məlumatlarını əlavə et
        if person.educations:
            for edu in person.educations:
                profile_data["education"].append({
                    "school": edu.institution_name or "",
                    "degree": edu.degree or "",
                    "field_of_study": "",
                    "date_range": edu.duration or ""
                })
        
        # Interests-i skills kimi əlavə et
        if person.interests:
            for interest in person.interests:
                if interest.title:
                    profile_data["skills"].append(interest.title)
        
        # Accomplishments-i certifications kimi əlavə et
        if person.accomplishments:
            for acc in person.accomplishments:
                profile_data["certifications"].append({
                    "name": acc.title or "",
                    "issuer": "",
                    "date": "",
                    "credential_id": ""
                })
        
        # Contact info
        if person.contacts:
            for contact in person.contacts:
                if hasattr(contact, 'email') and contact.email:
                    profile_data["contactInfo"]["email"] = contact.email
                if hasattr(contact, 'phone') and contact.phone:
                    profile_data["contactInfo"]["phone"] = contact.phone
                if hasattr(contact, 'website') and contact.website:
                    profile_data["contactInfo"]["website"] = contact.website
        
        print("✅ Profil məlumatları uğurla çıxarıldı!")
        print("📊 Məlumat sayı:")
        print(f"   - Ad: {'✓' if profile_data['name'] else '✗'}")
        print(f"   - Başlıq: {'✓' if profile_data['headline'] else '✗'}")
        print(f"   - Haqqında: {'✓' if profile_data['about'] else '✗'}")
        print(f"   - Təcrübə: {len(profile_data['experience'])} dənə")
        print(f"   - Təhsil: {len(profile_data['education'])} dənə")
        print(f"   - Bacarıqlar: {len(profile_data['skills'])} dənə")
        
        return profile_data
        
    except Exception as e:
        print(f"❌ Xəta: {e}")
        raise
    finally:
        if driver:
            print("🔚 Browser bağlanır...")
            driver.quit()


def scrape_with_credentials(email, password, profile_url=None):
    """Avtomatik giriş + scraping"""
    driver = None
    
    try:
        print("🚀 Avtomatik LinkedIn scraping başladılır...")
        
        # Browser-i headless mode-da aç
        driver = setup_chrome_driver(headless=True)
        
        # Login et
        print("🔐 LinkedIn-ə giriş edilir...")
        actions.login(driver, email, password)
        
        # Əgər profil URL verilməyibsə, öz profilini götür
        if not profile_url:
            print("🔍 Öz profil URL-i əldə edilir...")
            driver.get("https://www.linkedin.com/in/me/")
            profile_url = driver.current_url
            print(f"🎯 Profil URL: {profile_url}")
        
        # Person obyekti yarat və scrape et
        print("📊 Profil məlumatları çıxarılır...")
        person = Person(linkedin_url=profile_url, driver=driver, scrape=True, close_on_complete=False)
        
        # Məlumatları JSON formatına çevir (yuxarıdakı kimi)
        profile_data = {
            "name": person.name or "",
            "headline": person.job_title or "",
            "location": person.location or "",
            "about": " ".join(person.about) if person.about else "",
            "experience": [],
            "education": [],
            "skills": [],
            "certifications": [],
            "languages": [],
            "profileImage": "",
            "contactInfo": {
                "email": "",
                "phone": "",
                "website": "",
                "twitter": "",
                "linkedin": profile_url
            },
            "connections": "",
            "followers": ""
        }
        
        # Experience məlumatlarını əlavə et
        if person.experiences:
            for exp in person.experiences:
                profile_data["experience"].append({
                    "position": exp.position_title or "",
                    "company": exp.institution_name or "",
                    "date_range": exp.duration or "",
                    "location": exp.location or "",
                    "description": exp.description or ""
                })
        
        # Education məlumatlarını əlavə et
        if person.educations:
            for edu in person.educations:
                profile_data["education"].append({
                    "school": edu.institution_name or "",
                    "degree": edu.degree or "",
                    "field_of_study": "",
                    "date_range": edu.duration or ""
                })
        
        print("✅ Profil məlumatları uğurla çıxarıldı!")
        return profile_data
        
    except Exception as e:
        print(f"❌ Xəta: {e}")
        raise
    finally:
        if driver:
            print("🔚 Browser bağlanır...")
            driver.quit()


def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("İstifadə:")
        print("  python3 linkedin_python_scraper.py manual")
        print("  python3 linkedin_python_scraper.py auto <email> <password> [profile_url]")
        sys.exit(1)
    
    mode = sys.argv[1]
    
    try:
        if mode == "manual":
            profile_data = manual_login_and_scrape()
        elif mode == "auto":
            if len(sys.argv) < 4:
                print("❌ Email və password lazımdır avtomatik mode üçün")
                sys.exit(1)
            
            email = sys.argv[2]
            password = sys.argv[3]
            profile_url = sys.argv[4] if len(sys.argv) > 4 else None
            
            profile_data = scrape_with_credentials(email, password, profile_url)
        else:
            print("❌ Naməlum mode. 'manual' və ya 'auto' istifadə edin")
            sys.exit(1)
        
        # Nəticəni JSON formatında çıxar
        print("\n" + "="*50)
        print("📊 LINKEDIN PROFIL MƏLUMATLARI:")
        print("="*50)
        print(json.dumps(profile_data, indent=2, ensure_ascii=False))
        
        # Faylı da yazdır
        output_file = "/home/musayev/Documents/lastcvera/linkedin_profile_output.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(profile_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Məlumatlar həmçinin {output_file} faylına yazıldı")
        
    except Exception as e:
        print(f"❌ Fatal xəta: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
