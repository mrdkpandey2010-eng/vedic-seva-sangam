# 🕉️ वैदिक सेवा संगम | Sanatan Vedic & Pandit Services Platform

> A production-grade, highly responsive, zero-dependency, comprehensive Web platform for Sanatan Vedic Astrology (Panchang & Kundli), Purohit/Pandit management (Yajman Ledger & Samagri Generator), Web Audio API Vedic synthesizer (Tanpura & Japa Mala), and Live Pilgrimage Darshan aggregator.

Built with pure **HTML5, Tailwind CSS, and Modular Vanilla JavaScript** — designed for **100% serverless, client-side execution** deployable immediately to **GitHub Pages** or any static hosting with zero build steps or backend servers.

---

## 🌟 Core Features & Modules

### 1. 📜 पुरोहित टूलकिट (Comprehensive Pandit & Purohit Toolkit)
* **यजमान बहीखाता (Pandit's Digital Diary / Yajman Ledger):**
  - Complete LocalStorage-based client relationship ledger.
  - Record upcoming Pujas, Yajman names, Gotra, contact numbers, event date & auspicious times, venue addresses, and dakshina finances (agreed, advance, remaining balance).
  - Search by Yajman name, Gotra, or Puja category.
  - Filter by status: *All*, *Scheduled (Upcoming)*, *Completed*, and *Pending Balance*.
  - **One-Click WhatsApp Reminder Generator:** Generates a courteous, pre-formatted auspicious Sanskrit/Hindi WhatsApp reminder message (`https://api.whatsapp.com/send?...`).
  - **Data Export:** Export the complete ledger to standard `.csv` spreadsheet files with one click.
* **पूजन सामग्री चेकलिस्ट (Samagri Checklist Generator):**
  - Pre-configured, exhaustive Vedic samagri lists for 10+ major Pujas:
    1. श्री सत्यनारायण व्रत कथा एवं पूजन
    2. रुद्राभिषेक एवं महारुद्र पूजन (भगवान शिव)
    3. गृह प्रवेश एवं वास्तु शांति अनुष्ठान
    4. नवग्रह शांति एवं होम-हवन
    5. श्री महालक्ष्मी एवं कुबेर पूजन (दीपावली)
    6. विवाह संस्कार विधि
    7. मुंडन एवं नामकरण संस्कार
    8. श्री गणेश स्थापना एवं संकटनाशन पूजन
    9. कालसर्प दोष निवारण शांति
    10. पितृ श्राद्ध एवं तर्पण विधि
  - Categorized items: *Holy Waters & Panchamrit*, *Fragrances & Tilak*, *Flowers & Leaves*, *Grains & Seeds*, *Fabrics & Janeu*, *Havan Samagri*.
  - Interactive checkboxes with live progress bar (`% items arranged`).
  - Add custom items dynamically for specific Yajman needs.
  - **Send via WhatsApp:** Formats and copies all items to the clipboard in bulleted WhatsApp layout.
  - **Print Slip:** Formatted printable checklist with traditional border for physical use.

### 2. 🌞 वैदिक पंचांग एवं शुभ-अशुभ मुहूर्त (Vedic Panchang & Muhurta Core)
* **Pure Client-Side Ephemeris (Lahiri Ayanamsa Algorithm - चित्रापक्षीय):**
  - Computes Julian Day and astronomical Nirayana/Sidereal planetary coordinates directly in JavaScript.
* **Daily Pancha-Anga Dashboard:**
  - **तिथि (Tithi):** 30 Tithis across Shukla & Krishna Paksha with percentage completion.
  - **नक्षत्र (Nakshatra):** 27 Nakshatras with ruling Graha Lord, presiding Deity, and Charan/Pada (1–4).
  - **योग (Yoga):** 27 Yogas from Vishkumbha to Vaidhriti.
  - **करण (Karana):** 11 Karanas (Bava to Kimstughna) with Movable/Fixed categorization.
  - **वार (Day):** Planetary ruler of the day.
  - **संवत्सर (Samvat):** Vikram Samvat 2083, Shaka Samvat 1948, Kali Yuga year, Hindu Lunar Month & Season.
* **Solar & Lunar Ephemeris:**
  - Localized Sunrise, Sunset, Moonrise, and Moonset based on selected pilgrimage city or custom coordinates.
* **Auspicious Muhurtas (शुभ वेला):**
  - *अभिजीत मुहूर्त (Abhijit Muhurta)*
  - *ब्रह्म मुहूर्त (Brahma Muhurta)*
  - *अमृत काल (Amrit Kaal)*
  - *गोधूलि मुहूर्त (Godhuli Muhurta)*
* **Inauspicious Times (अशुभ काल / त्याज्य समय):**
  - *राहु काल (Rahu Kaal)* dynamically calculated based on weekday and daylight 8-part division.
  - *यमगण्ड काल (Yamaganda)*
  - *गुलिक काल (Gulika Kaal)*
  - *दुर्मुहूर्त (Durmuhurta)*
* **Real-Time Moment Evaluator:** Live status indicator evaluating whether the current clock time falls inside Rahu Kaal or Abhijit Muhurta.
* **City & Date Switcher:** Instant recalculation for Varanasi, Ayodhya, Ujjain, Delhi, Mumbai, Bengaluru, Kolkata, Haridwar, London, New York, etc.

### 3. 🔮 जन्म कुण्डली एवं राशि-नक्षत्र विश्लेषक (Dynamic Kundli & Rashi Calculator)
* **Native Birth Details Input:** High-trust sacred form collecting Full Name, Gender, Date of Birth, Time of Birth, and Place of Birth with geographic coordinates.
* **Astrological Analytical Processing:**
  - **चन्द्र राशि (Moon Sign):** Rashi, Sign Lord, and Element (Tatva: Fire, Earth, Air, Water).
  - **लग्न (Ascendant):** Computed using Local Sidereal Time (LST) and RAMC.
  - **जन्म नक्षत्र व चरण:** Constellation, Charan (1–4), Gana (Deva, Manushya, Rakshasa), and Nadi (Adi, Madhya, Antya).
  - **रत्न व रुद्राक्ष परामर्श:** Auspicious Gemstone (Ratna), recommended Mukhi Rudraksha, Lucky Colors, Lucky Numbers, and Ishta Devata.
  - **विंशोत्तरी महादशा आकलन:** Current active Mahadasha calculation.
* **उत्तर-भारतीय लग्न कुण्डली चक्र (North-Indian SVG Diamond Chart - D-1 Rashi Chakra):**
  - Authentic diamond grid rendering all 12 Bhavas (Tanu, Dhana, Sahaja, Sukha, Putra, Ari, Yuvati, Randhra, Dharma, Karma, Labha, Vyaya).
  - Automatically places zodiac sign numbers (1–12) according to the computed Lagna.
  - Positions the 9 Grahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) in their respective houses.
  - Planetary positions legend table with sign, exact degrees, and planetary dignities.
* **Vedic Predictive Readings:** Detailed textual readings covering Personality, Education/Career, Health/Ayurvedic Doshas, and Classical Remedial Upayas (Mantra & Danam).
* **Print / PDF Export:** Print-ready horoscope certificate styling.

### 4. 🛕 लाइव दिव्य दर्शन (Live Migrated Darshan Aggregator)
* **Verified Responsive Official Feeds:**
  - *श्री काशी विश्वनाथ ज्योतिर्लिंग (Varanasi, UP)*
  - *श्री महाकालेश्वर ज्योतिर्लिंग - भस्म आरती (Ujjain, MP)*
  - *श्री सोमनाथ ज्योतिर्लिंग (Prabhas Patan, Gujarat)*
  - *इस्कॉन मायापुर / श्री वृन्दावन धाम (24x7 Kirtan & Aarti)*
* **Interactive Aarti Timetable Modal:** Morning Mangala Aarti, Bhog Aarti, Evening Sandhya Aarti, and Night Shayan Aarti timings for each temple.
* **मंदिर की घंटी (Interactive Brass Temple Bell):** Devotees can click to ring an authentic resonant brass temple bell synthesized via Web Audio API.
* Direct portals to official temple trust websites for VIP Darshan booking, Prasad, and E-Pooja.

### 5. 🪕 वैदिक नाद ब्रह्म, तानपूरा एवं १०८ जप माला (Vedic Chants & Japa Engine)
* **Web Audio API Acoustic Synthesizer:**
  - Pure mathematical acoustic synthesizer generating a rich Indian Tanpura Drone (Sa-Pa harmonic resonance with slow plucked envelope).
  - Cosmic 136.1 Hz OM meditation frequency.
  - Zero external MP3/CORS dependencies — 100% reliable offline audio.
* **Interactive Real-Time Waveform Visualizer:** Animated HTML5 canvas displaying undulating golden sacred sound waves.
* **Curated Mantras & Suktas:**
  - श्री गायत्री महामंत्र (Gayatri Mantra)
  - महामृत्युंजय मंत्र (Mahamrityunjaya Mantra)
  - वैदिक शांति पाठ (Shanti Path)
  - पुरुष सूक्तम् (Purusha Suktam)
  - श्री सूक्तम् (Sri Suktam)
  - हरे कृष्ण महामंत्र (Hare Krishna Mahamantra)
* **१०८ जप माला गणक (Interactive 108 Japa Counter):**
  - Interactive bead tap with acoustic click sound feedback.
  - Circular SVG progress ring.
  - Automatic celebration bell chime when completing 108 repetitions, with a completed Malas counter.

---

## 🎨 Theme, Typography & Design Architecture

- **Color Palette:**
  - Sacred Saffron (`#ea580c`, `#c2410c`)
  - Temple Gold (`#ca8a04`, `#eab308`)
  - Sacred Ivory / Sandalwood (`#fdfbf7`, `#fffbeb`)
  - Royal Crimson / Vermilion (`#831843`, `#7f1d1d`)
- **Typography:**
  - `Noto Serif Devanagari` (Authentic traditional Sanskrit and Hindi script)
  - `Cinzel` (Royal Vedic headings)
  - `Poppins` (Modern scannable UI readability)
- **Bilingual Localization (i18n):** Complete toggle between Hindi (हिंदी) and English (English) across the entire platform.

---

## 🚀 Instant Deployment to GitHub Pages

1. **Clone or Download this repository:**
   ```bash
   git clone https://github.com/your-username/sanatan-vedic-platform.git
   cd sanatan-vedic-platform
   ```

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy Vedic Seva Sangam Platform"
   git push origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repository settings on GitHub: **Settings** -> **Pages**.
   - Under **Build and deployment** -> **Branch**, select `main` (root `/`).
   - Click **Save**.
   - Your platform will be live instantly at `https://<your-username>.github.io/<repo-name>/`!

---

## 💻 Local Execution

Since this platform has **zero external build dependencies**, you can run it locally in any browser:

### Option A: Direct Open
Double-click `index.html` in your file explorer to open it directly in Chrome, Firefox, Safari, or Edge.

### Option B: Local HTTP Server (Python / Node)
```bash
# Using Python
python -m http.server 8080

# Or using Node
npx serve .
```
Then visit `http://localhost:8080` in your web browser.

---

## 📁 File Structure

```
├── index.html       # Complete semantic HTML5 single-page application
├── app.js           # Ephemeris calculations, Kundli SVG chart, Ledger, Audio synth & i18n
└── README.md        # Documentation and deployment guide
```

---

## 📜 Licensure & Heritage
* Dedicated to the timeless wisdom of **Sanatan Dharma & Vedic Sciences**.
* Released under the **MIT License**. Free for all purohits, temples, astrologers, and devotees worldwide.
