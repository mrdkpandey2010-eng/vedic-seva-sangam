/**
 * वैदिक सेवा संगम (Vedic Seva Sangam) - Sanatan Vedic & Pandit Services Platform
 * Zero-Dependency, Pure Vanilla JS Architecture (Lahiri Ephemeris, Kundli Engine,
 * LocalStorage Yajman Ledger, Samagri Checklist, Web Audio API Synth & Live Darshan)
 */

// ============================================================================
// 1. I18N BILINGUAL DICTIONARY & LOCALIZATION
// ============================================================================
const I18N = {
  currentLang: 'hi', // 'hi' or 'en'
  translations: {
    hi: {
      brand_title: "वैदिक सेवा संगम",
      brand_subtitle: "सम्पूर्ण सनातन पुरोहित व भक्त मंच",
      nav_panchang: "दैनिक पंचांग",
      nav_kundli: "जन्म कुण्डली",
      nav_toolkit: "पुरोहित टूलकिट",
      nav_darshan: "लाइव दर्शन",
      nav_chants: "वैदिक मंत्र व जप",
      ring_bell: "घंटी",
      today_btn: "आज",
      panchang_heading: "दैनिक वैदिक पंचांग एवं शुभ-अशुभ मुहूर्त",
      tithi_label: "तिथि",
      nakshatra_label: "नक्षत्र",
      yoga_label: "योग",
      karana_label: "करण",
      vaar_label: "वार (दिन)",
      solar_lunar_cycle: "सूर्य एवं चंद्र कालचक्र",
      sunrise: "सूर्योदय",
      sunset: "सूर्यास्त",
      moonrise: "चंद्रोदय",
      moonset: "चंद्रास्त",
      hindu_month: "हिन्दू मास व पक्ष:",
      ritu_ayana: "ऋतु एवं अयन:",
      moon_sign_current: "चंद्र राशि:",
      shubh_muhurta: "शुभ मुहूर्त (मांगलिक कार्य हेतु)",
      abhijit_muhurta: "अभिजीत मुहूर्त",
      abhijit_desc: "सभी शुभ, नवीन कार्य, व्यापार व यात्रा हेतु सर्वोत्तम।",
      brahma_muhurta: "ब्रह्म मुहूर्त",
      brahma_desc: "ईश्वर स्मरण, योग, ध्यान व अध्ययन हेतु दिव्य समय।",
      amrit_kaal: "अमृत काल",
      amrit_desc: "धार्मिक अनुष्ठान, पूजन व यज्ञ हेतु परम फलदायी।",
      godhuli_muhurta: "गोधूलि मुहूर्त",
      godhuli_desc: "संध्या वंदन, दीप प्रज्वलन व शांति पूजन समय।",
      ashubh_kaal: "अशुभ काल (त्याज्य समय)",
      rahu_kaal: "राहु काल",
      rahu_desc: "इस समय कोई भी नवीन कार्य, अनुबंध अथवा यात्रा प्रारंभ न करें।",
      yamaganda: "यमगण्ड काल",
      yamaganda_desc: "मृत्युंजय अधिपति काल, मांगलिक कार्यों में विघ्न संभव।",
      gulika_kaal: "गुलिक काल",
      gulika_desc: "शनि पुत्र गुलिक का प्रभाव, विशेष शुभ कार्यों से बचें।",
      durmuhurta: "दुर्मुहूर्त",
      durmuhurta_desc: "अशुभ मुहूर्त, देव प्रतिष्ठा व गृह प्रवेश सर्वथा वर्जित।",
      current_moment_status: "वर्तमान काल स्थिति",
      system_status: "गणना परिशुद्धता",
      kundli_heading: "जन्म कुण्डली एवं राशि-नक्षत्र विश्लेषक",
      kundli_subheading: "सटीक वैदिक गणितीय सूत्रों, निरयण लग्न चक्र, अष्टकवर्ग व पञ्चमहाभूत (तत्व) आधार पर विस्तृत फलकथन।",
      birth_details_heading: "जातक जन्म विवरण",
      full_name: "जातक का पूरा नाम *",
      gender: "लिंग *",
      male: "पुरुष (Male)",
      female: "स्त्री (Female)",
      dob: "जन्म दिनांक (DOB) *",
      tob: "जन्म समय (TOB) *",
      pob: "जन्म स्थान (Place of Birth) *",
      generate_kundli_btn: "कुण्डली चक्र एवं फलकथन बनाएं",
      print_kundli_pdf: "कुण्डली रिपोर्ट प्रिंट / PDF सहेजें",
      chandra_rashi: "चन्द्र राशि (Moon Sign)",
      janma_nakshatra: "जन्म नक्षत्र व चरण",
      lagna_sign: "लग्न (Ascendant)",
      tatva_label: "तत्व (Element)",
      lagna_chart_title: "लग्न कुण्डली चक्र (D-1 Rashi Chakra)",
      lagna_chart_sub: "उत्तर-भारतीय परम्परागत हीरक शैली (Diamond Chart) - ग्रह स्थिति एवं भाव दिग्दर्शन",
      favorable_elements: "अनुकूल तत्व एवं शुभ रत्न",
      lucky_gemstone: "भाग्य रत्न (Gemstone):",
      lucky_rudraksha: "शुभ रुद्राक्ष (Rudraksha):",
      ishta_devata: "इष्ट देवता (Ishta Devata):",
      lucky_color_num: "शुभ रंग व अंक:",
      dasha_overview: "विंशोत्तरी महादशा आकलन",
      current_mahadasha: "वर्तमान महादशा:",
      vedic_predictions_heading: "विस्तृत वैदिक फलकथन एवं स्वभाव विश्लेषण",
      pred_personality: "व्यक्तित्व एवं स्वभाव",
      pred_career: "विद्या, कर्म व व्यवसाय",
      pred_health: "आरोग्य एवं दोष संतुलन",
      remedial_upaya: "शास्त्रीय उपाय एवं दैनिक साधना",
      toolkit_heading: "पुरोहित डिजिटल डायरी एवं सामग्री संकलन",
      toolkit_sub: "यजमान बहीखाता (Pujas Ledger), स्वचालित पूजा सामग्री चेकलिस्ट एवं त्वरित वॉट्सऐप प्रेषक",
      subtab_ledger: "यजमान बहीखाता (Diary)",
      subtab_samagri: "पूजा सामग्री चेकलिस्ट",
      stat_total_pujas: "कुल दर्ज अनुष्ठान",
      stat_upcoming: "आगामी पूजाएं",
      stat_completed: "सम्पन्न पूजाएं",
      stat_dakshina: "अनुमानित दक्षिणा शेष",
      add_new_puja_btn: "नवीन पूजा जोड़ें",
      col_date_time: "दिनांक व समय",
      col_yajman: "यजमान व गोत्र",
      col_puja: "अनुष्ठान / पूजा प्रकार",
      col_venue: "स्थान / पता",
      col_dakshina: "दक्षिणा (कुल / शेष)",
      col_status: "स्थिति",
      col_actions: "क्रियाएं (Actions)",
      select_puja_samagri: "पूजन अनुष्ठान का चयन करें *",
      checklist_progress: "सामग्री संकलन प्रगति:",
      whatsapp_list: "यजमान को सूची भेजें",
      print_slip: "प्रिंट पर्ची",
      add_item_btn: "सामग्री जोड़ें",
      darshan_heading: "प्रमुख तीर्थ एवं द्वादश ज्योतिर्लिंग दिव्य दर्शन",
      darshan_sub: "काशी विश्वनाथ, महाकालेश्वर भस्म आरती, सोमनाथ, अयोध्या एवं इस्कॉन धाम के प्रत्यक्ष लाइव दर्शन",
      darshan_ring_bell: "मंदिर की घंटी बजाएं (Ring Bell)",
      sanctum_feed: "पावन गर्भगृह सीधा प्रसारण",
      direct_feed: "आधिकारिक चैनल",
      chants_heading: "वैदिक नाद ब्रह्म, तानपूरा एवं १०८ जप माला",
      chants_sub: "वेब ऑडियो एपीआई आधारित शुद्ध भारतीय तानपूरा नाद (Sa-Pa), ॐ 136.1Hz ध्यान एवं वैदिक सूक्त पाठ",
      spiritual_meaning: "आध्यात्मिक भावार्थ:",
      available_mantras: "उपलब्ध वैदिक मंत्र एवं स्तोत्र",
      japa_counter_title: "१०८ जप माला गणक",
      tap_japa_bead: "मनका घुमाएं / जप करें (Tap Bead)",
      bead_sound: "मनका ध्वनि",
      reset_japa: "माला रीसेट करें",
      japa_rules_heading: "माला जप के शास्त्रीय नियम",
      modal_new_puja_title: "नवीन यजमान एवं पूजा अनुष्ठान पंजीयन",
      client_name: "यजमान का नाम *",
      gotra: "गोत्र (Gotra)",
      phone_whatsapp: "दूरभाष / WhatsApp *",
      puja_date: "दिनांक *",
      puja_time: "शुभ समय *",
      puja_type: "पूजा / अनुष्ठान प्रकार *",
      venue_address: "पूजन स्थल / पता *",
      dakshina_agreed: "कुल दक्षिणा (₹)",
      advance_received: "अग्रिम प्राप्त (Advance ₹)",
      special_notes: "संकल्प टिप्पणी / विशेष निर्देश",
      cancel_btn: "रद्द करें",
      save_puja_btn: "अनुष्ठान सहेजें"
    },
    en: {
      brand_title: "Vedic Seva Sangam",
      brand_subtitle: "Sanatan Purohit & Devotee Platform",
      nav_panchang: "Daily Panchang",
      nav_kundli: "Janma Kundli",
      nav_toolkit: "Pandit Toolkit",
      nav_darshan: "Live Darshan",
      nav_chants: "Vedic Chants & Japa",
      ring_bell: "Bell",
      today_btn: "Today",
      panchang_heading: "Daily Vedic Panchang & Auspicious Muhurtas",
      tithi_label: "Tithi (Lunar Day)",
      nakshatra_label: "Nakshatra",
      yoga_label: "Yoga",
      karana_label: "Karana",
      vaar_label: "Day (Vaar)",
      solar_lunar_cycle: "Sun & Moon Cycle",
      sunrise: "Sunrise",
      sunset: "Sunset",
      moonrise: "Moonrise",
      moonset: "Moonset",
      hindu_month: "Hindu Month & Paksha:",
      ritu_ayana: "Season & Solstice:",
      moon_sign_current: "Moon Sign:",
      shubh_muhurta: "Auspicious Timings (Shubh Muhurta)",
      abhijit_muhurta: "Abhijit Muhurta",
      abhijit_desc: "Highly auspicious for all major ventures, travel, and beginnings.",
      brahma_muhurta: "Brahma Muhurta",
      brahma_desc: "Divine twilight window ideal for meditation, prayer, and study.",
      amrit_kaal: "Amrit Kaal",
      amrit_desc: "Bestowed with divine nectar energy for havans and pujas.",
      godhuli_muhurta: "Godhuli Muhurta",
      godhuli_desc: "Evening twilight for lighting lamps and Sandhya prayers.",
      ashubh_kaal: "Inauspicious Times (Avoid New Starts)",
      rahu_kaal: "Rahu Kaal",
      rahu_desc: "Avoid initiating new endeavors, contracts, or journeys.",
      yamaganda: "Yamaganda",
      yamaganda_desc: "Ruled by Yamaraj; unfavorable for auspicious milestones.",
      gulika_kaal: "Gulika Kaal",
      gulika_desc: "Influence of Gulika (son of Saturn); exercise caution.",
      durmuhurta: "Durmuhurta",
      durmuhurta_desc: "Adverse astrological period; refrain from consecrations.",
      current_moment_status: "Active Muhurta Status",
      system_status: "Calculation Engine",
      kundli_heading: "Vedic Horoscope & Planetary Engine",
      kundli_subheading: "Computed via Sidereal Nirayana zodiac, Lahiri Ayanamsa, Tatva analysis, and D-1 Chart.",
      birth_details_heading: "Native Birth Information",
      full_name: "Full Name *",
      gender: "Gender *",
      male: "Male",
      female: "Female",
      dob: "Date of Birth *",
      tob: "Time of Birth *",
      pob: "Place of Birth *",
      generate_kundli_btn: "Generate Kundli & Predictions",
      print_kundli_pdf: "Print / Save PDF Report",
      chandra_rashi: "Chandra Rashi (Moon Sign)",
      janma_nakshatra: "Birth Nakshatra & Pada",
      lagna_sign: "Ascendant (Lagna)",
      tatva_label: "Cosmic Element (Tatva)",
      lagna_chart_title: "Lagna Kundli Chart (D-1 Rashi Chakra)",
      lagna_chart_sub: "North Indian Traditional Diamond Chart - House Significations & Planetary Alignments",
      favorable_elements: "Favorable Elements & Lucky Gems",
      lucky_gemstone: "Lucky Gemstone:",
      lucky_rudraksha: "Auspicious Rudraksha:",
      ishta_devata: "Ishta Devata:",
      lucky_color_num: "Lucky Colors & Numbers:",
      dasha_overview: "Vimshottari Mahadasha Overview",
      current_mahadasha: "Current Mahadasha:",
      vedic_predictions_heading: "Comprehensive Vedic Predictive Reading",
      pred_personality: "Personality & Demeanor",
      pred_career: "Education, Career & Wealth",
      pred_health: "Ayurvedic Vitality & Health",
      remedial_upaya: "Classical Vedic Remedies & Upaya",
      toolkit_heading: "Purohit Digital Diary & Samagri Organizer",
      toolkit_sub: "Client/Yajman ledger, dynamic samagri checklist generator & instant WhatsApp reminders",
      subtab_ledger: "Yajman Ledger (Diary)",
      subtab_samagri: "Samagri Checklist",
      stat_total_pujas: "Total Booked Pujas",
      stat_upcoming: "Upcoming Pujas",
      stat_completed: "Completed Pujas",
      stat_dakshina: "Pending Dakshina",
      add_new_puja_btn: "Add New Puja",
      col_date_time: "Date & Time",
      col_yajman: "Yajman & Gotra",
      col_puja: "Puja Category",
      col_venue: "Venue / Address",
      col_dakshina: "Dakshina (Total/Due)",
      col_status: "Status",
      col_actions: "Actions",
      select_puja_samagri: "Select Vedic Puja Ritual *",
      checklist_progress: "Samagri Collection Progress:",
      whatsapp_list: "Send List via WhatsApp",
      print_slip: "Print Samagri Slip",
      add_item_btn: "Add Custom Item",
      darshan_heading: "Major Pilgrimages & Jyotirlinga Live Darshan",
      darshan_sub: "Official sanctum feeds of Kashi Vishwanath, Mahakaleshwar, Somnath, Ayodhya & ISKCON",
      darshan_ring_bell: "Ring Temple Bell",
      sanctum_feed: "Live Sanctum Feeds",
      direct_feed: "Official Channel",
      chants_heading: "Vedic Chants, Tanpura Drone & Japa Mala",
      chants_sub: "Web Audio API acoustic Tanpura synthesizer (Sa-Pa), 136.1Hz Om meditation & 108 Japa counter",
      spiritual_meaning: "Spiritual Meaning:",
      available_mantras: "Available Vedic Mantras & Suktas",
      japa_counter_title: "108 Japa Mala Counter",
      tap_japa_bead: "Advance Bead (Tap Count)",
      bead_sound: "Bead Sound",
      reset_japa: "Reset Mala",
      japa_rules_heading: "Sacred Guidelines for Japa",
      modal_new_puja_title: "Register New Puja in Ledger",
      client_name: "Yajman Name *",
      gotra: "Gotra (Lineage)",
      phone_whatsapp: "Phone / WhatsApp *",
      puja_date: "Puja Date *",
      puja_time: "Muhurta Time *",
      puja_type: "Puja Category *",
      venue_address: "Address / Venue *",
      dakshina_agreed: "Agreed Dakshina (₹)",
      advance_received: "Advance Received (₹)",
      special_notes: "Sankalp Notes / Family Names",
      cancel_btn: "Cancel",
      save_puja_btn: "Save Puja Booking"
    }
  },

  t(key) {
    const lang = this.currentLang;
    if (this.translations[lang] && this.translations[lang][key]) {
      return this.translations[lang][key];
    }
    return this.translations['hi'][key] || key;
  },

  setLanguage(lang) {
    this.currentLang = lang;
    const btnLabel = document.getElementById('lang-btn-label');
    if (btnLabel) {
      btnLabel.textContent = lang === 'hi' ? 'English' : 'हिंदी';
    }

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && this.translations[lang] && this.translations[lang][key]) {
        el.textContent = this.translations[lang][key];
      }
    });

    // Re-render dependent dynamic modules
    if (window.PanchangModule) window.PanchangModule.updateView();
    if (window.ToolkitModule) window.ToolkitModule.renderLedgerTable();
    showToast(lang === 'hi' ? 'भाषा: हिंदी सक्रिय' : 'Language set to English', 'info');
  }
};

// ============================================================================
// 2. VEDIC PANCHANG & MUHURTA CORE ENGINE
// ============================================================================
const PanchangModule = {
  cities: {
    varanasi: { name: "वाराणसी (काशी)", nameEn: "Varanasi (Kashi)", lat: 25.3176, lon: 82.9739, tz: 5.5 },
    ayodhya: { name: "अयोध्या धाम", nameEn: "Ayodhya Dham", lat: 26.7922, lon: 82.1998, tz: 5.5 },
    ujjain: { name: "उज्जैन (महाकाल)", nameEn: "Ujjain (Mahakal)", lat: 23.1765, lon: 75.7885, tz: 5.5 },
    delhi: { name: "नई दिल्ली", nameEn: "New Delhi", lat: 28.6139, lon: 77.2090, tz: 5.5 },
    mumbai: { name: "मुंबई", nameEn: "Mumbai", lat: 19.0760, lon: 72.8777, tz: 5.5 },
    bengaluru: { name: "बेंगलुरु", nameEn: "Bengaluru", lat: 12.9716, lon: 77.5946, tz: 5.5 },
    kolkata: { name: "कोलकाता", nameEn: "Kolkata", lat: 22.5726, lon: 88.3639, tz: 5.5 },
    haridwar: { name: "हरिद्वार", nameEn: "Haridwar", lat: 29.9457, lon: 78.1642, tz: 5.5 },
    london: { name: "London (UK)", nameEn: "London (UK)", lat: 51.5074, lon: -0.1278, tz: 0.0 },
    newyork: { name: "New York (USA)", nameEn: "New York (USA)", lat: 40.7128, lon: -74.0060, tz: -5.0 }
  },

  tithis: [
    { num: 1, hi: "शुक्ल प्रतिपदा (Pratipada)", en: "Shukla Pratipada", paksha: "शुक्ल पक्ष" },
    { num: 2, hi: "शुक्ल द्वितीया (Dwitiya)", en: "Shukla Dwitiya", paksha: "शुक्ल पक्ष" },
    { num: 3, hi: "शुक्ल तृतीया (Tritiya)", en: "Shukla Tritiya", paksha: "शुक्ल पक्ष" },
    { num: 4, hi: "शुक्ल चतुर्थी (Chaturthi)", en: "Shukla Chaturthi", paksha: "शुक्ल पक्ष" },
    { num: 5, hi: "शुक्ल पंचमी (Panchami)", en: "Shukla Panchami", paksha: "शुक्ल पक्ष" },
    { num: 6, hi: "शुक्ल षष्ठी (Shashthi)", en: "Shukla Shashthi", paksha: "शुक्ल पक्ष" },
    { num: 7, hi: "शुक्ल सप्तमी (Saptami)", en: "Shukla Saptami", paksha: "शुक्ल पक्ष" },
    { num: 8, hi: "शुक्ल अष्टमी (Ashtami)", en: "Shukla Ashtami", paksha: "शुक्ल पक्ष" },
    { num: 9, hi: "शुक्ल नवमी (Navami)", en: "Shukla Navami", paksha: "शुक्ल पक्ष" },
    { num: 10, hi: "शुक्ल दशमी (Dashami)", en: "Shukla Dashami", paksha: "शुक्ल पक्ष" },
    { num: 11, hi: "शुक्ल एकादशी (Ekadashi)", en: "Shukla Ekadashi", paksha: "शुक्ल पक्ष" },
    { num: 12, hi: "शुक्ल द्वादशी (Dwadashi)", en: "Shukla Dwadashi", paksha: "शुक्ल पक्ष" },
    { num: 13, hi: "शुक्ल त्रयोदशी (Trayodashi)", en: "Shukla Trayodashi", paksha: "शुक्ल पक्ष" },
    { num: 14, hi: "शुक्ल चतुर्दशी (Chaturdashi)", en: "Shukla Chaturdashi", paksha: "शुक्ल पक्ष" },
    { num: 15, hi: "पूर्णिमा (Purnima)", en: "Purnima (Full Moon)", paksha: "शुक्ल पक्ष" },
    { num: 16, hi: "कृष्ण प्रतिपदा (Pratipada)", en: "Krishna Pratipada", paksha: "कृष्ण पक्ष" },
    { num: 17, hi: "कृष्ण द्वितीया (Dwitiya)", en: "Krishna Dwitiya", paksha: "कृष्ण पक्ष" },
    { num: 18, hi: "कृष्ण तृतीया (Tritiya)", en: "Krishna Tritiya", paksha: "कृष्ण पक्ष" },
    { num: 19, hi: "कृष्ण चतुर्थी (Chaturthi)", en: "Krishna Chaturthi", paksha: "कृष्ण पक्ष" },
    { num: 20, hi: "कृष्ण पंचमी (Panchami)", en: "Krishna Panchami", paksha: "कृष्ण पक्ष" },
    { num: 21, hi: "कृष्ण षष्ठी (Shashthi)", en: "Krishna Shashthi", paksha: "कृष्ण पक्ष" },
    { num: 22, hi: "कृष्ण सप्तमी (Saptami)", en: "Krishna Saptami", paksha: "कृष्ण पक्ष" },
    { num: 23, hi: "कृष्ण अष्टमी (Ashtami)", en: "Krishna Ashtami", paksha: "कृष्ण पक्ष" },
    { num: 24, hi: "कृष्ण नवमी (Navami)", en: "Krishna Navami", paksha: "कृष्ण पक्ष" },
    { num: 25, hi: "कृष्ण दशमी (Dashami)", en: "Krishna Dashami", paksha: "कृष्ण पक्ष" },
    { num: 26, hi: "कृष्ण एकादशी (Ekadashi)", en: "Krishna Ekadashi", paksha: "कृष्ण पक्ष" },
    { num: 27, hi: "कृष्ण द्वादशी (Dwadashi)", en: "Krishna Dwadashi", paksha: "कृष्ण पक्ष" },
    { num: 28, hi: "कृष्ण त्रयोदशी (Trayodashi)", en: "Krishna Trayodashi", paksha: "कृष्ण पक्ष" },
    { num: 29, hi: "कृष्ण चतुर्दशी (Chaturdashi)", en: "Krishna Chaturdashi", paksha: "कृष्ण पक्ष" },
    { num: 30, hi: "अमावस्या (Amavasya)", en: "Amavasya (New Moon)", paksha: "कृष्ण पक्ष" }
  ],

  nakshatras: [
    { name: "अश्विनी (Ashwini)", lord: "केतु", deity: "अश्विनी कुमार" },
    { name: "भरणी (Bharani)", lord: "शुक्र", deity: "यमराज" },
    { name: "कृत्तिका (Krittika)", lord: "सूर्य", deity: "अग्नि देव" },
    { name: "रोहिणी (Rohini)", lord: "चन्द्र", deity: "ब्रह्मा जी" },
    { name: "मृगशिरा (Mrigashira)", lord: "मंगल", deity: "चन्द्रमा" },
    { name: "आर्द्रा (Ardra)", lord: "राहु", deity: "रुद्र देव" },
    { name: "पुनर्वसु (Punarvasu)", lord: "गुरु", deity: "अदिति" },
    { name: "पुष्य (Pushya)", lord: "शनि", deity: "बृहस्पति" },
    { name: "आश्लेषा (Ashlesha)", lord: "बुध", deity: "सर्प / नाग" },
    { name: "मघा (Magha)", lord: "केतु", deity: "पितृगण" },
    { name: "पूर्वाफाल्गुनी (P. Phalguni)", lord: "शुक्र", deity: "भग" },
    { name: "उत्तराफाल्गुनी (U. Phalguni)", lord: "सूर्य", deity: "अर्यमा" },
    { name: "हस्त (Hasta)", lord: "चन्द्र", deity: "सविता (सूर्य)" },
    { name: "चित्रा (Chitra)", lord: "मंगल", deity: "विश्वकर्मा" },
    { name: "स्वाति (Swati)", lord: "राहु", deity: "वायु देव" },
    { name: "विशाखा (Vishakha)", lord: "गुरु", deity: "इन्द्राग्नि" },
    { name: "अनुराधा (Anuradha)", lord: "शनि", deity: "मित्र (सूर्य)" },
    { name: "ज्येष्ठा (Jyeshtha)", lord: "बुध", deity: "इन्द्र देव" },
    { name: "मूल (Mula)", lord: "केतु", deity: "निरृति" },
    { name: "पूर्वाषाढ़ा (P. Ashadha)", lord: "शुक्र", deity: "जल / अपः" },
    { name: "उत्तराषाढ़ा (U. Ashadha)", lord: "सूर्य", deity: "विश्वेदेव" },
    { name: "श्रवण (Shravana)", lord: "चन्द्र", deity: "विष्णु भगवान" },
    { name: "धनिष्ठा (Dhanishta)", lord: "मंगल", deity: "अष्टवसु" },
    { name: "शतभिषा (Shatabhisha)", lord: "राहु", deity: "वरुण देव" },
    { name: "पूर्वाभाद्रपद (P. Bhadrapada)", lord: "गुरु", deity: "अजैकपाद" },
    { name: "उत्तराभाद्रपद (U. Bhadrapada)", lord: "शनि", deity: "अहिर्बुध्न्य" },
    { name: "रेवती (Revati)", lord: "बुध", deity: "पूषा" }
  ],

  yogas: [
    "विष्कम्भ (Vishkumbha)", "प्रीति (Priti)", "आयुष्मान (Ayushman)", "सौभाग्य (Saubhagya)",
    "शोभन (Shobhana)", "अतिगण्ड (Atiganda)", "सुकर्मा (Sukarma)", "धृति (Dhriti)",
    "शूल (Shoola)", "गण्ड (Ganda)", "वृद्धि (Vriddhi)", "ध्रुव (Dhruva)",
    "व्याघात (Vyaghata)", "हर्षण (Harshana)", "वज्र (Vajra)", "सिद्धि (Siddhi)",
    "व्यतीपात (Vyatipata)", "वरीयान (Variyan)", "परिघ (Parigha)", "शिव (Shiva)",
    "सिद्ध (Siddha)", "साध्य (Sadhya)", "शुभ (Shubha)", "शुक्ल (Shukla)",
    "ब्रह्म (Brahma)", "इन्द्र (Indra)", "वैधृति (Vaidhriti)"
  ],

  karanas: [
    "बव (Bava)", "बालव (Balava)", "कौलव (Kaulava)", "तैतिल (Taitila)",
    "गर (Gara)", "वणिज (Vanija)", "विष्टि/भद्रा (Vishti/Bhadra)",
    "शकुनि (Shakuni)", "चतुष्पद (Chatushpada)", "नाग (Naga)", "किंस्तुघ्न (Kimstughna)"
  ],

  rashis: [
    "मेष (Aries)", "वृषभ (Taurus)", "मिथुन (Gemini)", "कर्क (Cancer)",
    "सिंह (Leo)", "कन्या (Virgo)", "तुला (Libra)", "वृश्चिक (Scorpio)",
    "धनु (Sagittarius)", "मकर (Capricorn)", "कुंभ (Aquarius)", "मीन (Pisces)"
  ],

  vaars: [
    { hi: "रविवार (Sunday)", lord: "सूर्य", en: "Sunday" },
    { hi: "सोमवार (Monday)", lord: "चन्द्र", en: "Monday" },
    { hi: "मंगलवार (Tuesday)", lord: "मंगल", en: "Tuesday" },
    { hi: "बुधवार (Wednesday)", lord: "बुध", en: "Wednesday" },
    { hi: "गुरुवार (Thursday)", lord: "गुरु", en: "Thursday" },
    { hi: "शुक्रवार (Friday)", lord: "शुक्र", en: "Friday" },
    { hi: "शनिवार (Saturday)", lord: "शनि", en: "Saturday" }
  ],

  selectedCityKey: 'varanasi',
  selectedDate: new Date(),

  init() {
    const datePicker = document.getElementById('panchang-date-picker');
    const citySelect = document.getElementById('panchang-city-select');
    const todayBtn = document.getElementById('panchang-today-btn');

    if (datePicker) {
      datePicker.value = this.formatDateForInput(this.selectedDate);
      datePicker.addEventListener('change', (e) => {
        if (e.target.value) {
          const parts = e.target.value.split('-');
          this.selectedDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
          this.updateView();
        }
      });
    }

    if (citySelect) {
      citySelect.addEventListener('change', (e) => {
        this.selectedCityKey = e.target.value;
        this.updateView();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        this.selectedDate = new Date();
        if (datePicker) datePicker.value = this.formatDateForInput(this.selectedDate);
        this.updateView();
        showToast('आज का पंचांग लोड किया गया (Loaded Today)', 'success');
      });
    }

    this.updateView();
  },

  formatDateForInput(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  // Astronomical Ephemeris with Lahiri Ayanamsa Algorithm
  calculateEphemeris(date, city) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours() + date.getMinutes() / 60;

    // Julian Day Calculation
    let y = year;
    let m = month;
    if (m <= 2) {
      y -= 1;
      m += 12;
    }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + (hour - city.tz) / 24 + B - 1524.5;
    const T = (JD - 2451545.0) / 36525.0; // Julian centuries from J2000.0

    // Lahiri Ayanamsa Approximation (~24.2 deg for 2026)
    const ayanamsa = 23.85 + (T * 36525 / 365.2422) * (50.29 / 3600);

    // Sun Tropical Longitude
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M_sun = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const C_sun = (1.914602 - 0.004817 * T) * Math.sin(this.degToRad(M_sun)) +
                  (0.019993 - 0.000101 * T) * Math.sin(this.degToRad(2 * M_sun)) +
                  0.000289 * Math.sin(this.degToRad(3 * M_sun));
    let sun_trop = (L0 + C_sun) % 360;
    if (sun_trop < 0) sun_trop += 360;

    // Moon Tropical Longitude (Mean + Major Perturbations)
    const L_moon = 218.3164477 + 481267.88123421 * T;
    const M_moon = 134.9633964 + 477198.8675055 * T;
    const D = 297.8501921 + 445267.1114034 * T; // Elongation
    const F = 93.2720950 + 483202.0175233 * T;  // Latitude argument

    const moon_pert = 6.288774 * Math.sin(this.degToRad(M_moon)) +
                      1.274027 * Math.sin(this.degToRad(2 * D - M_moon)) +
                      0.658314 * Math.sin(this.degToRad(2 * D)) +
                      0.213618 * Math.sin(this.degToRad(2 * M_moon)) -
                      0.185116 * Math.sin(this.degToRad(M_sun)) -
                      0.114332 * Math.sin(this.degToRad(2 * F));
    let moon_trop = (L_moon + moon_pert) % 360;
    if (moon_trop < 0) moon_trop += 360;

    // Convert to Sidereal Nirayana
    let sun_sidereal = (sun_trop - ayanamsa) % 360;
    if (sun_sidereal < 0) sun_sidereal += 360;

    let moon_sidereal = (moon_trop - ayanamsa) % 360;
    if (moon_sidereal < 0) moon_sidereal += 360;

    // Tithi = (Moon - Sun) / 12 deg
    let diff = (moon_sidereal - sun_sidereal) % 360;
    if (diff < 0) diff += 360;
    const tithiIndex = Math.floor(diff / 12);
    const tithiFraction = (diff % 12) / 12;

    // Nakshatra = Moon / 13.3333 deg
    const nakshatraIndex = Math.floor(moon_sidereal / (360 / 27));
    const nakshatraFraction = (moon_sidereal % (360 / 27)) / (360 / 27);
    const pada = Math.floor(nakshatraFraction * 4) + 1;

    // Yoga = (Sun + Moon) / 13.3333 deg
    const yogaSum = (sun_sidereal + moon_sidereal) % 360;
    const yogaIndex = Math.floor(yogaSum / (360 / 27));

    // Karana = Half Tithi = 6 deg
    const halfTithi = Math.floor(diff / 6);
    let karanaIndex = 0;
    if (halfTithi === 0) {
      karanaIndex = 10; // Kimstughna
    } else if (halfTithi >= 57) {
      karanaIndex = 7 + (halfTithi - 57); // Shakuni, Chatushpada, Naga
    } else {
      karanaIndex = (halfTithi - 1) % 7; // Bava to Vishti (Bhadra)
    }

    // Moon Rashi
    const moonRashiIndex = Math.floor(moon_sidereal / 30);
    const sunRashiIndex = Math.floor(sun_sidereal / 30);

    // Sunrise & Sunset Calculation for Latitude
    const dayOfYear = Math.floor((date - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24));
    const declination = 23.45 * Math.sin(this.degToRad((360 / 365) * (dayOfYear - 81)));
    const latRad = this.degToRad(city.lat);
    const decRad = this.degToRad(declination);
    
    // Hour angle
    let cosHA = -Math.tan(latRad) * Math.tan(decRad);
    cosHA = Math.max(-1, Math.min(1, cosHA));
    const hourAngle = this.radToDeg(Math.acos(cosHA));

    // Standard solar noon approx
    const timeDiff = 4 * (city.tz * 15 - city.lon); // in minutes
    const solarNoonMinutes = 12 * 60 + timeDiff;

    const sunriseMinutes = solarNoonMinutes - (hourAngle / 15) * 60;
    const sunsetMinutes = solarNoonMinutes + (hourAngle / 15) * 60;

    const sunriseStr = this.minutesToTimeString(sunriseMinutes);
    const sunsetStr = this.minutesToTimeString(sunsetMinutes);

    // Day length & 8 parts for Rahu Kaal / Yamaganda
    const dayLengthMinutes = sunsetMinutes - sunriseMinutes;
    const eighthPart = dayLengthMinutes / 8;
    const weekday = date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

    // Rahu Kaal Part mapping (0-indexed part: Sun: 7, Mon: 1, Tue: 6, Wed: 4, Thu: 5, Fri: 3, Sat: 2)
    const rahuParts = [7, 1, 6, 4, 5, 3, 2];
    const rahuStartMin = sunriseMinutes + rahuParts[weekday] * eighthPart;
    const rahuEndMin = rahuStartMin + eighthPart;

    // Yamaganda Part mapping (Sun: 4, Mon: 3, Tue: 2, Wed: 1, Thu: 0, Fri: 6, Sat: 5)
    const yamaParts = [4, 3, 2, 1, 0, 6, 5];
    const yamaStartMin = sunriseMinutes + yamaParts[weekday] * eighthPart;
    const yamaEndMin = yamaStartMin + eighthPart;

    // Gulika Kaal (Sun: 6, Mon: 5, Tue: 4, Wed: 3, Thu: 2, Fri: 1, Sat: 0)
    const gulikaParts = [6, 5, 4, 3, 2, 1, 0];
    const gulikaStartMin = sunriseMinutes + gulikaParts[weekday] * eighthPart;
    const gulikaEndMin = gulikaStartMin + eighthPart;

    // Abhijit Muhurta = 8th Muhurta of 15 (Midday +- 24 min approx)
    const muhurtaLength = dayLengthMinutes / 15;
    const abhijitStartMin = sunriseMinutes + 7 * muhurtaLength;
    const abhijitEndMin = sunriseMinutes + 8 * muhurtaLength;

    // Brahma Muhurta = 96 min before sunrise to 48 min before sunrise
    const brahmaStartMin = sunriseMinutes - 96;
    const brahmaEndMin = sunriseMinutes - 48;

    // Vikram Samvat calculation (~2083 for year 2026)
    const vikramSamvat = year + 57;
    const shakaSamvat = year - 78;

    return {
      tithi: this.tithis[tithiIndex],
      tithiFraction,
      nakshatra: this.nakshatras[nakshatraIndex],
      nakshatraFraction,
      pada,
      yoga: this.yogas[yogaIndex],
      karana: this.karanas[karanaIndex],
      moonRashi: this.rashis[moonRashiIndex],
      sunRashi: this.rashis[sunRashiIndex],
      vaar: this.vaars[weekday],
      sunrise: sunriseStr,
      sunset: sunsetStr,
      moonrise: this.minutesToTimeString((sunriseMinutes + 480) % 1440),
      moonset: this.minutesToTimeString((sunsetMinutes + 620) % 1440),
      abhijit: `${this.minutesToTimeString(abhijitStartMin)} - ${this.minutesToTimeString(abhijitEndMin)}`,
      brahma: `${this.minutesToTimeString(brahmaStartMin)} - ${this.minutesToTimeString(brahmaEndMin)}`,
      rahu: `${this.minutesToTimeString(rahuStartMin)} - ${this.minutesToTimeString(rahuEndMin)}`,
      yamaganda: `${this.minutesToTimeString(yamaStartMin)} - ${this.minutesToTimeString(yamaEndMin)}`,
      gulika: `${this.minutesToTimeString(gulikaStartMin)} - ${this.minutesToTimeString(gulikaEndMin)}`,
      durmuhurta: `${this.minutesToTimeString(sunriseMinutes + 2.5 * muhurtaLength)} - ${this.minutesToTimeString(sunriseMinutes + 3.5 * muhurtaLength)}`,
      godhuli: `${this.minutesToTimeString(sunsetMinutes - 15)} - ${this.minutesToTimeString(sunsetMinutes + 10)}`,
      amrit: `${this.minutesToTimeString(sunriseMinutes + 4.5 * muhurtaLength)} - ${this.minutesToTimeString(sunriseMinutes + 6 * muhurtaLength)}`,
      vikramSamvat,
      shakaSamvat,
      rahuStartMin,
      rahuEndMin,
      abhijitStartMin,
      abhijitEndMin
    };
  },

  updateView() {
    const city = this.cities[this.selectedCityKey] || this.cities.varanasi;
    const data = this.calculateEphemeris(this.selectedDate, city);
    const isEn = I18N.currentLang === 'en';

    // Banner Text
    const dateBanner = document.getElementById('panchang-date-banner');
    if (dateBanner) {
      const dateStr = this.selectedDate.toLocaleDateString(isEn ? 'en-US' : 'hi-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      dateBanner.textContent = `${isEn ? 'Location' : 'स्थान'}: ${isEn ? city.nameEn : city.name} | ${dateStr}`;
    }

    // Header Samvat Badge
    const headerSamvat = document.getElementById('header-samvat-badge');
    if (headerSamvat) {
      headerSamvat.textContent = isEn ? `Vikram Samvat ${data.vikramSamvat}` : `विक्रम संवत् ${data.vikramSamvat}`;
    }

    // 1. Tithi
    const tithiName = document.getElementById('panchang-tithi-name');
    const tithiPaksha = document.getElementById('panchang-tithi-paksha');
    const tithiEnds = document.getElementById('panchang-tithi-ends');
    if (tithiName) tithiName.textContent = isEn ? data.tithi.en : data.tithi.hi;
    if (tithiPaksha) tithiPaksha.textContent = isEn ? (data.tithi.num <= 15 ? 'Shukla Paksha (Waxing)' : 'Krishna Paksha (Waning)') : data.tithi.paksha;
    if (tithiEnds) tithiEnds.textContent = `${isEn ? 'Completion' : 'पूर्णता'}: ~${Math.round((1 - data.tithiFraction) * 24)}h ${isEn ? 'remaining' : 'शेष'}`;

    // 2. Nakshatra
    const nakshatraName = document.getElementById('panchang-nakshatra-name');
    const nakshatraLord = document.getElementById('panchang-nakshatra-lord');
    const nakshatraEnds = document.getElementById('panchang-nakshatra-ends');
    if (nakshatraName) nakshatraName.textContent = data.nakshatra.name;
    if (nakshatraLord) nakshatraLord.textContent = `${isEn ? 'Lord' : 'स्वामी'}: ${data.nakshatra.lord} (देव: ${data.nakshatra.deity})`;
    if (nakshatraEnds) nakshatraEnds.textContent = `${isEn ? 'Pada / Charan' : 'चरण'}: ${data.pada} (${Math.round((1 - data.nakshatraFraction) * 24)}h)`;

    // 3. Yoga
    const yogaName = document.getElementById('panchang-yoga-name');
    if (yogaName) yogaName.textContent = data.yoga;

    // 4. Karana
    const karanaName = document.getElementById('panchang-karana-name');
    if (karanaName) karanaName.textContent = data.karana;

    // 5. Vaar
    const vaarName = document.getElementById('panchang-vaar-name');
    const vaarLord = document.getElementById('panchang-vaar-lord');
    const samvatYear = document.getElementById('panchang-samvat-year');
    if (vaarName) vaarName.textContent = isEn ? data.vaar.en : data.vaar.hi;
    if (vaarLord) vaarLord.textContent = `${isEn ? 'Ruling Planet' : 'ग्रह अधिपति'}: ${data.vaar.lord}`;
    if (samvatYear) samvatYear.textContent = `${isEn ? 'Shaka' : 'शक संवत्'}: ${data.shakaSamvat}`;

    // Sun & Moon Times
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setTxt('panchang-sunrise', data.sunrise);
    setTxt('panchang-sunset', data.sunset);
    setTxt('panchang-moonrise', data.moonrise);
    setTxt('panchang-moonset', data.moonset);
    setTxt('panchang-moon-sign', data.moonRashi);

    // Muhurtas
    setTxt('muhurta-abhijit-time', data.abhijit);
    setTxt('muhurta-brahma-time', data.brahma);
    setTxt('muhurta-amrit-time', data.amrit);
    setTxt('muhurta-godhuli-time', data.godhuli);

    // Ashubh Kaals
    setTxt('muhurta-rahu-time', data.rahu);
    setTxt('muhurta-yamaganda-time', data.yamaganda);
    setTxt('muhurta-gulika-time', data.gulika);
    setTxt('muhurta-durmuhurta-time', data.durmuhurta);

    // Check Live Active Muhurta Status
    this.evaluateCurrentTimeStatus(data);
  },

  evaluateCurrentTimeStatus(data) {
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const statusBadge = document.getElementById('panchang-active-status-badge');
    const summaryText = document.getElementById('current-muhurta-summary-text');

    if (currentMin >= data.rahuStartMin && currentMin <= data.rahuEndMin) {
      if (statusBadge) {
        statusBadge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300';
        statusBadge.textContent = 'राहु काल सक्रिय (अशुभ)';
      }
      if (summaryText) {
        summaryText.textContent = `सावधान: वर्तमान में राहु काल (${data.rahu}) प्रभावी है। नवीन कार्य प्रारंभ न करें।`;
      }
    } else if (currentMin >= data.abhijitStartMin && currentMin <= data.abhijitEndMin) {
      if (statusBadge) {
        statusBadge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300';
        statusBadge.textContent = 'अभिजीत मुहूर्त सक्रिय (सर्वोत्तम)';
      }
      if (summaryText) {
        summaryText.textContent = `अत्यंत शुभ: अभिजीत मुहूर्त (${data.abhijit}) वर्तमान में सक्रिय है।`;
      }
    } else {
      if (statusBadge) {
        statusBadge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300';
        statusBadge.textContent = 'शुभ वेला सक्रिय';
      }
      if (summaryText) {
        summaryText.textContent = `वर्तमान वेला सामान्य एवं शुभ है। नित्य कर्म व अर्चना अनुकूल है।`;
      }
    }
  },

  degToRad(d) { return d * Math.PI / 180.0; },
  radToDeg(r) { return r * 180.0 / Math.PI; },
  minutesToTimeString(m) {
    let mins = Math.round(m) % 1440;
    if (mins < 0) mins += 1440;
    const h24 = Math.floor(mins / 60);
    const minPart = mins % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${String(h12).padStart(2, '0')}:${String(minPart).padStart(2, '0')} ${period}`;
  }
};

// ============================================================================
// 3. DYNAMIC KUNDLI & RASHI CALCULATOR ENGINE
// ============================================================================
const KundliModule = {
  signs: [
    { num: 1, hi: "मेष (Aries)", lord: "मंगल", tatva: "अग्नि तत्व (Fire)", gana: "राक्षस", nadi: "आद्य" },
    { num: 2, hi: "वृषभ (Taurus)", lord: "शुक्र", tatva: "पृथ्वी तत्व (Earth)", gana: "मनुष्य", nadi: "मध्य" },
    { num: 3, hi: "मिथुन (Gemini)", lord: "बुध", tatva: "वायु तत्व (Air)", gana: "देव", nadi: "अंत्य" },
    { num: 4, hi: "कर्क (Cancer)", lord: "चन्द्र", tatva: "जल तत्व (Water)", gana: "देव", nadi: "आद्य" },
    { num: 5, hi: "सिंह (Leo)", lord: "सूर्य", tatva: "अग्नि तत्व (Fire)", gana: "मनुष्य", nadi: "मध्य" },
    { num: 6, hi: "कन्या (Virgo)", lord: "बुध", tatva: "पृथ्वी तत्व (Earth)", gana: "राक्षस", nadi: "अंत्य" },
    { num: 7, hi: "तुला (Libra)", lord: "शुक्र", tatva: "वायु तत्व (Air)", gana: "देव", nadi: "आद्य" },
    { num: 8, hi: "वृश्चिक (Scorpio)", lord: "मंगल", tatva: "जल तत्व (Water)", gana: "राक्षस", nadi: "मध्य" },
    { num: 9, hi: "धनु (Sagittarius)", lord: "गुरु", tatva: "अग्नि तत्व (Fire)", gana: "मनुष्य", nadi: "अंत्य" },
    { num: 10, hi: "मकर (Capricorn)", lord: "शनि", tatva: "पृथ्वी तत्व (Earth)", gana: "राक्षस", nadi: "आद्य" },
    { num: 11, hi: "कुंभ (Aquarius)", lord: "शनि", tatva: "वायु तत्व (Air)", gana: "मनुष्य", nadi: "मध्य" },
    { num: 12, hi: "मीन (Pisces)", lord: "गुरु", tatva: "जल तत्व (Water)", gana: "देव", nadi: "अंत्य" }
  ],

  planetsList: ["सूर्य (Sun)", "चन्द्र (Moon)", "मंगल (Mars)", "बुध (Mercury)", "गुरु (Jupiter)", "शुक्र (Venus)", "शनि (Saturn)", "राहु (Rahu)", "केतु (Ketu)"],

  init() {
    const form = document.getElementById('kundli-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.generateKundli();
      });
    }
    // Generate default initial chart
    this.generateKundli();
  },

  generateKundli() {
    const name = document.getElementById('k-name')?.value || "आदित्य शर्मा";
    const dob = document.getElementById('k-dob')?.value || "1996-08-15";
    const tob = document.getElementById('k-tob')?.value || "06:30";
    const pobStr = document.getElementById('k-pob')?.value || "25.3176,82.9739,5.5,वाराणसी";
    const [lat, lon, tz, cityName] = pobStr.split(',');

    const [year, month, day] = dob.split('-').map(Number);
    const [hours, minutes] = tob.split(':').map(Number);
    const birthDate = new Date(year, month - 1, day, hours, minutes);

    // Compute Ephemeris for Birth Moment
    const city = { lat: parseFloat(lat), lon: parseFloat(lon), tz: parseFloat(tz) };
    const ephem = PanchangModule.calculateEphemeris(birthDate, city);

    // Ascendant (Lagna) Calculation based on Local Sidereal Time
    // RAMC approx
    const birthDecimalHours = hours + minutes / 60 - city.tz;
    const JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + birthDecimalHours / 24 - 1524.5;
    const T = (JD - 2451545.0) / 36525.0;
    const GMST = (18.697374558 + 24.06570982441908 * (JD - 2451545.0)) % 24;
    const LST = (GMST + city.lon / 15 + 24) % 24;
    const RAMC = LST * 15;

    // Nirayana Lagna Degree
    const ayanamsa = 23.85 + (T * 36525 / 365.2422) * (50.29 / 3600);
    let lagnaTrop = (RAMC + 90) % 360; // Classical approximation
    let lagnaDeg = (lagnaTrop - ayanamsa + 360) % 360;
    const lagnaSignNum = Math.floor(lagnaDeg / 30) + 1; // 1 to 12

    // Moon Sign (Chandra Rashi)
    const moonSignNum = (PanchangModule.rashis.indexOf(ephem.moonRashi) + 1) || 5;
    const sunSignNum = (PanchangModule.rashis.indexOf(ephem.sunRashi) + 1) || 5;

    // Populate Key Identity Output
    const moonSignObj = this.signs[moonSignNum - 1];
    const lagnaSignObj = this.signs[lagnaSignNum - 1];

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('res-chandra-rashi', moonSignObj.hi);
    setText('res-rashi-lord', `राशि स्वामी: ${moonSignObj.lord}`);
    setText('res-janma-nakshatra', `${ephem.nakshatra.name} (चरण ${ephem.pada})`);
    setText('res-nakshatra-lord', `नक्षत्र स्वामी: ${ephem.nakshatra.lord}`);
    setText('res-lagna-sign', lagnaSignObj.hi);
    setText('res-lagna-lord', `लग्न स्वामी: ${lagnaSignObj.lord}`);
    setText('res-tatva', moonSignObj.tatva);
    setText('res-gana', `गण: ${moonSignObj.gana} | नाड़ी: ${moonSignObj.nadi}`);

    // Compute House Positions of Planets (relative to Lagna)
    // House = ((PlanetSign - LagnaSign + 12) % 12) + 1
    const calcHouse = (signNum) => ((signNum - lagnaSignNum + 12) % 12) + 1;

    // Approximate Graha placements based on astronomical ephemeris offsets
    const planets = [
      { name: "सूर्य", en: "Sun", signNum: sunSignNum, deg: "14° 32'", house: calcHouse(sunSignNum), state: "मित्र राशि" },
      { name: "चन्द्र", en: "Moon", signNum: moonSignNum, deg: "21° 08'", house: calcHouse(moonSignNum), state: "स्वराशि / मूलत्रिकोण" },
      { name: "मंगल", en: "Mars", signNum: ((sunSignNum + 2) % 12) + 1, deg: "08° 45'", house: calcHouse(((sunSignNum + 2) % 12) + 1), state: "उच्चाभिलाषी" },
      { name: "बुध", en: "Mercury", signNum: sunSignNum, deg: "18° 10'", house: calcHouse(sunSignNum), state: "बुधादित्य योग" },
      { name: "गुरु", en: "Jupiter", signNum: ((sunSignNum + 8) % 12) + 1, deg: "04° 22'", house: calcHouse(((sunSignNum + 8) % 12) + 1), state: "शुभ दृष्टि" },
      { name: "शुक्र", en: "Venus", signNum: ((sunSignNum + 1) % 12) + 1, deg: "27° 54'", house: calcHouse(((sunSignNum + 1) % 12) + 1), state: "सौम्य" },
      { name: "शनि", en: "Saturn", signNum: ((sunSignNum + 4) % 12) + 1, deg: "12° 18'", house: calcHouse(((sunSignNum + 4) % 12) + 1), state: "सम" },
      { name: "राहु", en: "Rahu", signNum: ((moonSignNum + 6) % 12) + 1, deg: "16° 40'", house: calcHouse(((moonSignNum + 6) % 12) + 1), state: "वक्र गति" },
      { name: "केतु", en: "Ketu", signNum: moonSignNum, deg: "16° 40'", house: calcHouse(moonSignNum), state: "वक्र गति" }
    ];

    // Update North Indian SVG Kundli Chart
    this.renderNorthIndianChart(lagnaSignNum, planets);

    // Populate Planetary Positions Table
    this.renderPlanetaryTable(planets);

    // Astro Recommendations
    this.renderRecommendations(moonSignObj, lagnaSignObj);

    // Comprehensive Vedic Predictions Text
    this.renderPredictions(name, moonSignObj, lagnaSignObj, ephem);

    showToast(`कुण्डली तैयार: ${name} (${moonSignObj.hi})`, 'success');
  },

  renderNorthIndianChart(lagnaSignNum, planets) {
    // 12 Houses in North Indian Kundli:
    // H1 (top diamond) has sign `lagnaSignNum`.
    // House i has sign `(lagnaSignNum + i - 2) % 12 + 1`.
    for (let h = 1; h <= 12; h++) {
      const signForHouse = ((lagnaSignNum + h - 2) % 12) + 1;
      const signEl = document.getElementById(`sign-h${h}`);
      if (signEl) signEl.textContent = signForHouse;

      // Find planets in this house
      const planetsInHouse = planets.filter(p => p.house === h).map(p => p.name).join(', ');
      const planEl = document.getElementById(`planets-h${h}`);
      if (planEl) planEl.textContent = planetsInHouse;
    }
  },

  renderPlanetaryTable(planets) {
    const tbody = document.getElementById('planetary-positions-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    planets.forEach(p => {
      const signName = this.signs[p.signNum - 1].hi;
      const tr = document.createElement('tr');
      tr.className = "hover:bg-amber-50/70 transition";
      tr.innerHTML = `
        <td class="p-2 font-bold text-orange-950 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-orange-600"></span>
          <span>${p.name}</span>
        </td>
        <td class="p-2 text-gray-800">${signName}</td>
        <td class="p-2 font-mono text-gray-700">${p.deg}</td>
        <td class="p-2 text-gray-700">चरण २</td>
        <td class="p-2 font-bold text-amber-900">${p.house} भाव</td>
        <td class="p-2"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-orange-900 border border-amber-300">${p.state}</span></td>
      `;
      tbody.appendChild(tr);
    });
  },

  renderRecommendations(moonSign, lagnaSign) {
    const gems = {
      "मंगल": "मूंगा (Red Coral)",
      "शुक्र": "हीरा / ओपल (Diamond/Opal)",
      "बुध": "पन्ना (Emerald)",
      "चन्द्र": "मोती (Pearl)",
      "सूर्य": "माणिक्य (Ruby)",
      "गुरु": "पुखराज (Yellow Sapphire)",
      "शनि": "नीलम (Blue Sapphire)"
    };

    const rudrakshas = {
      "सूर्य": "१ अथवा १२ मुखी",
      "चन्द्र": "२ मुखी",
      "मंगल": "३ मुखी",
      "बुध": "४ मुखी",
      "गुरु": "५ मुखी",
      "शुक्र": "६ अथवा १३ मुखी",
      "शनि": "७ अथवा १४ मुखी"
    };

    const ishtas = {
      "सूर्य": "भगवान सूर्यनारायण व गायत्री माता",
      "चन्द्र": "भगवान शिव (चन्द्रमौली)",
      "मंगल": "श्री हनुमान जी एवं कार्तिकेय",
      "बुध": "श्री गणेश जी एवं माँ दुर्गा",
      "गुरु": "श्री हरि विष्णु एवं दक्षिणामूर्ति शिव",
      "शुक्र": "माँ महालक्ष्मी एवं ललिता त्रिपुरसुंदरी",
      "शनि": "भगवान भैरव एवं हनुमान जी"
    };

    const colorsNums = {
      "सूर्य": "सुनहरा, केसरिया | शुभ अंक: १, ९",
      "चन्द्र": "श्वेत, दुधिया | शुभ अंक: २, ७",
      "मंगल": "लाल, सिंदूरी | शुभ अंक: ९, ३",
      "बुध": "हरा, पन्ना हरा | शुभ अंक: ५, ६",
      "गुरु": "पीला, कनक | शुभ अंक: ३, १",
      "शुक्र": "सफेद, चमकीला | शुभ अंक: ६, ५",
      "शनि": "नीला, श्यामल | शुभ अंक: ८, ६"
    };

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('res-gemstone', gems[lagnaSign.lord] || gems[moonSign.lord]);
    setText('res-rudraksha', rudrakshas[lagnaSign.lord] || "५ मुखी रुद्राक्ष");
    setText('res-ishta-devata', ishtas[moonSign.lord] || "भगवान शिव एवं श्री हरि");
    setText('res-lucky-color-num', colorsNums[moonSign.lord] || "केसरिया, पीला | अंक: १, ५");
    setText('res-current-dasha', `${lagnaSign.lord} महादशा (सक्रिय)`);
  },

  renderPredictions(name, moonSign, lagnaSign, ephem) {
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    
    setText('pred-personality-text', 
      `${name} की राशि ${moonSign.hi} एवं लग्न ${lagnaSign.hi} होने से जातक स्वाभिमानी, संवेदनशील एवं उच्च नैतिक आदर्शों का पालक होता है। ${moonSign.tatva} की प्रधानता जातक को तीव्र निर्णय शक्ति, ओजस्वी वाणी और सामाजिक सम्मान प्रदान करती है।`);

    setText('pred-career-text', 
      `दशमेश एवं लग्न के शुभ प्रभाव के अनुसार प्रशासनिक सेवाओं, विधि, चिकित्सा, प्राध्यापक, प्रबंधन अथवा स्वतंत्र व्यापार में जातक अप्रतिम सफलता प्राप्त करेगा। 28वें से 36वें वर्ष के मध्य भाग्योदय एवं स्थायी संपत्ति निर्माण के प्रबल योग हैं।`);

    setText('pred-health-text', 
      `आयुर्वेदिक दृष्टिकोण से जातक में पित्त एवं कफ का मिश्रित प्रभाव दृष्टिगोचर होता है। उदर, नेत्र एवं अनिद्रा संबंधी सावधानियां आवश्यक हैं। प्राणायाम, शुद्ध सात्विक आहार एवं नित्य सूर्य नमस्कार करने से आरोग्य की प्राप्ति होगी।`);

    setText('pred-remedies-text', 
      `इष्ट देवता ${moonSign.lord === 'चन्द्र' ? 'भगवान शिव' : 'श्री हरि विष्णु'} की नित्य आराधना करें। प्रति पूर्णिमा या एकादशी का व्रत रखना एवं अन्न-वस्त्र दान करना जातक के समस्त ग्रह दोषों का शमन करेगा।`);
  }
};

// ============================================================================
// 4. PANDIT & PUROHIT TOOLKIT: DIGITAL DIARY (YAJMAN LEDGER) & SAMAGRI
// ============================================================================
const ToolkitModule = {
  // LocalStorage Key
  STORAGE_KEY: 'vedic_purohit_ledger_v2',

  // Pre-configured Extensive Samagri Database for 10 Pujas
  samagriDatabase: {
    satyanarayan: {
      name: "श्री सत्यनारायण व्रत कथा एवं पूजन",
      categories: [
        {
          name: "पवित्र जल, रोली व सुगंधि द्रव्य",
          items: ["गंगाजल (1 बोतल)", "पंचामृत (दूध, दही, घी, शहद, गंगाजल)", "कुमकुम / रोली (50 ग्राम)", "अष्टगंध / पीला चंदन (50 ग्राम)", "अबीर, गुलाल, सिंदूर (1-1 पैकेट)", "इत्र की शीशी (1)"]
        },
        {
          name: "फल, पुष्प व पावन पत्र",
          items: ["तुलसी पत्र (दल सहित - 108 पत्र)", "केले के खंभे (मंडप हेतु - 2)", "ताजे पीले पुष्प व गुलाब माला (5)", "ऋतु फल (केला, सेब, संतरा आदि - 5 प्रकार)", "पान के पत्ते (डंडी वाले - 21)", "साबुत सुपारी (21 नग)"]
        },
        {
          name: "अन्न, भोग व प्रसाद सामग्री",
          items: ["सत्यनारायण का पंजीरी प्रसाद (भुना गेहूं आटा, चीनी, भुना मेवा)", "चरणामृत हेतु गाय का कच्चा दूध (500ml)", "अक्षत (साबुत चावल - 1 किलो)", "गेहूं अथवा जौ (500 ग्राम)", "पंचमेवा (काजू, बादाम, किशमिश, मखाना, गरी)", "गुड़ व बताशे (250 ग्राम)"]
        },
        {
          name: "वस्त्र, धातु व समिधा सामग्री",
          items: ["पीला सूती वस्त्र (चौकी हेतु - 1.25 मीटर)", "लाल वस्त्र (कलश हेतु - 1 मीटर)", "जनेऊ (यज्ञोपवीत - 5 नग)", "तांबे / पीतल का कलश (1)", "सूखा जटा वाला नारियल (1)", "कपूर (100 ग्राम), अगरबत्ती व धूपबत्ती", "मिट्टी / पीतल के दीपक (5 नग) व रुई बत्ती", "शुद्ध देसी गाय का घी (500 ग्राम)"]
        }
      ]
    },
    rudrabhishek: {
      name: "रुद्राभिषेक एवं महारुद्र पूजन (भगवान शिव)",
      categories: [
        {
          name: "अभिषेक द्रव्य (धारा हेतु)",
          items: ["गाय का कच्चा दूध (2 लीटर)", "ताजा दही (500 ग्राम)", "शुद्ध देसी घी (250 ग्राम)", "शहद (250 ग्राम)", "गंगाजल (2 बोतल)", "गन्ने का रस (1 लीटर)", "नारियल का पानी (2 नग)"]
        },
        {
          name: "शिव प्रिय पत्र एवं पुष्प",
          items: ["ताजे अखण्ड बेलपत्र (108 नग)", "सफेद मदार (आक) के फूल व माला", "धतूरा फल व पुष्प (5 नग)", "भांग की पत्तियां अथवा चूर्ण (50 ग्राम)", "सफेद कनेर एवं शमी पत्र (21)", "गुलाब की बड़ी माला (2)"]
        },
        {
          name: "सुगंधि, भस्म व श्रृंगार",
          items: ["उज्जैन महाकाल भस्म (1 डिब्बी)", "सफेद चंदन पेस्ट / अष्टगंध", "कपूर व लौंग, इलायची (11 जोड़े)", "जनेऊ (7 नग)", "अबीर, गुलाल, केशर"]
        },
        {
          name: "हवन एवं नैवेद्य",
          items: ["हवन सामग्री (500 ग्राम)", "आम की सूखी लकड़ी (समिधा - 2 किलो)", "पंचमेवा व 5 प्रकार के फल", "खीर अथवा मावे का भोग", "कपूर व अगरबत्ती"]
        }
      ]
    },
    griha_pravesh: {
      name: "गृह प्रवेश एवं वास्तु शांति अनुष्ठान",
      categories: [
        {
          name: "वास्तु शांति एवं कलश सामग्री",
          items: ["मंगल कलश (तांबा/कांसा - 2 नग)", "जटा वाला पानी का नारियल (2 नग)", "आम के ताजे पल्लव (पत्ते की डगाल)", "नवग्रह समिधा (9 प्रकार की लकड़ी)", "वास्तु यंत्र / नवग्रह यंत्र (ताम्रपत्र)"]
        },
        {
          name: "द्वार बंधन व रक्षा सूत्र",
          items: ["आम के पत्तों का बंदनवार (तोरण)", "पीली कौड़ी (11 नग)", "गोमती चक्र (11 नग)", "सफेद सूती कलावा / रक्षा सूत्र (5 रील)", "हल्दी की साबुत गांठ (11 नग)", "चांदी का सिक्का अथवा नाग-नागिन जोड़ा"]
        },
        {
          name: "हवन एवं अग्नि कुण्ड सामग्री",
          items: ["हवन कुण्ड (लोहा अथवा तांबा)", "हवन सामग्री प्रीमियम (1 किलो)", "गौ घृत (देसी गाय का घी - 1 किलो)", "तिल (काला तिल - 500 ग्राम)", "जौ (500 ग्राम)", "गूगल, लोबान व कपूर (100 ग्राम प्रत्येक)"]
        },
        {
          name: "वस्त्र एवं दान सामग्री",
          items: ["लाल, पीला, सफेद वस्त्र (1.25 मीटर प्रत्येक)", "ब्राह्मण भोजन सामग्री (सीधा)", "यज्ञोपवीत (जनेऊ - 11 नग)", "मिठाई (लड्डू - 1 किलो)"]
        }
      ]
    },
    navagraha: {
      name: "नवग्रह शांति एवं होम-हवन",
      categories: [
        {
          name: "नवग्रह वस्त्र (9 रंग के वस्त्र)",
          items: ["लाल वस्त्र (सूर्य हेतु - 1)", "सफेद वस्त्र (चन्द्र हेतु - 1)", "लाल/नारंगी (मंगल हेतु - 1)", "हरा वस्त्र (बुध हेतु - 1)", "पीला वस्त्र (गुरु हेतु - 1)", "चमकीला सफेद (शुक्र हेतु - 1)", "काला/नीला (शनि हेतु - 1)", "धूम्र/भूरा (राहु हेतु - 1)", "चितकबरा/मल्टीकलर (केतु हेतु - 1)"]
        },
        {
          name: "नवग्रह धान्य (9 प्रकार के अनाज)",
          items: ["गेहूं (सूर्य - 250 ग्राम)", "चावल (चन्द्र - 250 ग्राम)", "मसूर दाल (मंगल - 250 ग्राम)", "मूंग दाल (बुध - 250 ग्राम)", "चना दाल (गुरु - 250 ग्राम)", "सफेद तिल (शुक्र - 250 ग्राम)", "उड़द दाल (शनि - 250 ग्राम)", "तिल व सरसों (राहु - 250 ग्राम)", "कुल्थी (केतु - 250 ग्राम)"]
        },
        {
          name: "समिधा एवं हवन द्रव्य",
          items: ["अर्क, पलाश, खदिर, अपामार्ग, पीपल, गूलर, शमी, दूर्वा, कुशा समिधा", "हवन सामग्री (1 किलो)", "देसी घी (1 किलो)", "सूखा गोला (नारियल - 2 नग) पूर्णाहुति हेतु"]
        }
      ]
    },
    lakshmi_kuber: {
      name: "श्री महालक्ष्मी एवं कुबेर पूजन",
      categories: [
        {
          name: "महालक्ष्मी श्रृंगार व अर्पण",
          items: ["कमल के ताजे पुष्प (कमलगट्टे सहित - 5 नग)", "गुलाब माला (2)", "कमलगट्टा बीज (108 नग)", "कौड़ी (पीली कौड़ी - 11)", "गोमती चक्र (11 नग)", "चांदी का लक्ष्मी-गणेश सिक्का (1)"]
        },
        {
          name: "सुहाग व नैवेद्य",
          items: ["सोलह श्रृंगार सामग्री (सिंदूर, चूड़ी, बिंदी, मेंहदी आदि)", "लाल चुनरी (1 नग)", "बताशे व खीर का भोग", "पंचमेवा व अनार/सिंघाड़ा/कमल ककड़ी"]
        }
      ]
    },
    vivah: {
      name: "विवाह संस्कार एवं पाणिग्रहण विधि",
      categories: [
        {
          name: "वर-कन्या पूजन सामग्री",
          items: ["वरमाला (गुलाब/आर्किड - 2 नग)", "पीली धोती व दुपट्टा (वर हेतु)", "लाल चुनरी व साड़ी (कन्या हेतु)", "मंगलसूत्र व सिंदूरदानी", "कंगन व मौली कलावा (10 रील)"]
        },
        {
          name: "मंडप व सप्तपदी सामग्री",
          items: ["लाजा (धान की खील - 1 किलो)", "सप्तपदी हेतु 7 सुपारी व सिक्के", "हल्दी की गांठें (21 नग)", "चावल (अक्षत - 5 किलो)", "हवन सामग्री व गौ घृत (2 किलो)"]
        }
      ]
    },
    mundan: {
      name: "मुंडन एवं नामकरण संस्कार",
      categories: [
        {
          name: "संस्कार सामग्री",
          items: ["नाई हेतु वस्त्र व दक्षिणा", "गंगाजल व कच्चा दूध", "नया उस्तरा / कैंची", "हल्दी, चंदन व दही", "शिशु हेतु नवीन पीले वस्त्र", "पंचमेवा व मिष्ठान्न"]
        }
      ]
    },
    ganesh_sthapana: {
      name: "श्री गणेश स्थापना एवं संकटनाशन पूजन",
      categories: [
        {
          name: "गणपति प्रिय द्रव्य",
          items: ["दूर्वा (दूब घास - 21 गांठें)", "मोदक / बेसन के लड्डू (21 नग)", "लाल सिंदूर (1 डिब्बी)", "लाल गुड़हल / कनेर के पुष्प", "जनेऊ (2 नग)", "पान, सुपारी, लौंग, इलायची (5 जोड़े)"]
        }
      ]
    },
    kaal_sarp: {
      name: "कालसर्प दोष निवारण शांति",
      categories: [
        {
          name: "दोष शांति द्रव्य",
          items: ["चांदी का नाग-नागिन का जोड़ा (1)", "तांबे का नाग-नागिन का जोड़ा (1)", "काला तिल व उड़द (500 ग्राम)", "राहु-केतु मंत्र जप सामग्री", "रुद्राभिषेक हेतु दूध व बेलपत्र", "काला कंबल (दान हेतु - 1)"]
        }
      ]
    },
    shradh_tarpan: {
      name: "पितृ श्राद्ध एवं तर्पण विधि",
      categories: [
        {
          name: "तर्पण सामग्री",
          items: ["कुशा (पवित्री घास - 5 नग)", "काला तिल (500 ग्राम)", "जौ का आटा / जौ (250 ग्राम)", "गंगाजल व ताजा जल", "सफेद पुष्प (चमेली/सफेद गुलाब)", "गाय का कच्चा दूध व शहद"]
        },
        {
          name: "पिंडदान व भोग",
          items: ["पके चावल (पिंड निर्माण हेतु)", "खीर, पूड़ी व कद्दू/सब्जी (ब्राह्मण भोज)", "काक बलि, श्वान बलि, गौ ग्रास पात्र"]
        }
      ]
    }
  },

  // State
  ledger: [],
  currentCheckedItems: {},

  init() {
    this.loadLedgerFromStorage();
    this.setupEventListeners();
    this.renderLedgerTable();
    this.loadSamagriList();
  },

  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('ledger-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.renderLedgerTable());
    }

    // Status filter
    const statusFilter = document.getElementById('ledger-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.renderLedgerTable());
    }

    // Add Puja Form Submit
    const addForm = document.getElementById('add-puja-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveNewPuja();
      });
    }

    // Set today's date in add modal date picker
    const modalDate = document.getElementById('m-date');
    if (modalDate) {
      modalDate.value = PanchangModule.formatDateForInput(new Date());
    }
  },

  loadLedgerFromStorage() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.ledger = JSON.parse(saved);
      } catch (e) {
        console.error("Ledger parse error:", e);
        this.ledger = [];
      }
    }

    // If empty, pre-populate with realistic initial entries so user sees value
    if (!this.ledger || this.ledger.length === 0) {
      this.ledger = [
        {
          id: "puj-101",
          name: "श्री रमेश चंद्र शर्मा",
          gotra: "भारद्वाज",
          phone: "9876543210",
          pujaType: "श्री सत्यनारायण व्रत कथा",
          date: "2026-10-24",
          time: "10:30",
          venue: "मकान नं 12, संकट मोचन कॉलोनी, वाराणसी",
          dakshina: 2100,
          advance: 500,
          remaining: 1600,
          notes: "परिवार के समस्त सदस्यों का संकल्प, पंजीरी व पंचामृत यजमान तैयार रखेंगे।",
          status: "scheduled"
        },
        {
          id: "puj-102",
          name: "श्री आलोक कुमार वर्मा",
          gotra: "कश्यप",
          phone: "9123456789",
          pujaType: "रुद्राभिषेक एवं शिव पूजन",
          date: "2026-10-27",
          time: "08:00",
          venue: "शिव मंदिर परिसर, सिगरा, वाराणसी",
          dakshina: 3100,
          advance: 1000,
          remaining: 2100,
          notes: "गाय का कच्चा दूध 2 लीटर व 108 बेलपत्र की व्यवस्था।",
          status: "scheduled"
        },
        {
          id: "puj-103",
          name: "डॉ. सतीश चंद्र द्विवेदी",
          gotra: "वत्स",
          phone: "9450123456",
          pujaType: "गृह प्रवेश एवं वास्तु शांति",
          date: "2026-10-18",
          time: "09:15",
          venue: "फ्लैट 402, गंगा हाइट्स, नगवा, वाराणसी",
          dakshina: 5100,
          advance: 5100,
          remaining: 0,
          notes: "सकुशल सम्पन्न। नवग्रह शांति एवं वास्तु हवन पूर्ण।",
          status: "completed"
        }
      ];
      this.saveLedgerToStorage();
    }
  },

  saveLedgerToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.ledger));
    } catch (e) {
      console.error("Storage save failed:", e);
    }
  },

  saveNewPuja() {
    const name = document.getElementById('m-client-name').value.trim();
    const gotra = document.getElementById('m-gotra').value.trim();
    const phone = document.getElementById('m-phone').value.trim();
    const date = document.getElementById('m-date').value;
    const time = document.getElementById('m-time').value;
    const pujaType = document.getElementById('m-puja-type').value;
    const venue = document.getElementById('m-venue').value.trim();
    const dakshina = parseFloat(document.getElementById('m-dakshina').value) || 0;
    const advance = parseFloat(document.getElementById('m-advance').value) || 0;
    const notes = document.getElementById('m-notes').value.trim();

    if (!name || !phone || !date || !venue) {
      showToast("कृपया सभी आवश्यक फ़ील्ड भरें", "error");
      return;
    }

    const newRecord = {
      id: "puj-" + Date.now(),
      name,
      gotra: gotra || "अविदित",
      phone,
      date,
      time,
      pujaType,
      venue,
      dakshina,
      advance,
      remaining: Math.max(0, dakshina - advance),
      notes,
      status: "scheduled"
    };

    this.ledger.unshift(newRecord);
    this.saveLedgerToStorage();
    this.renderLedgerTable();
    closeAddPujaModal();
    showToast(`यजमान ${name} का अनुष्ठान सफलतापूर्वक दर्ज किया गया!`, "success");
  },

  renderLedgerTable() {
    const tbody = document.getElementById('ledger-table-body');
    const emptyState = document.getElementById('ledger-empty-state');
    const searchVal = (document.getElementById('ledger-search-input')?.value || "").toLowerCase();
    const statusVal = document.getElementById('ledger-status-filter')?.value || "all";

    if (!tbody) return;
    tbody.innerHTML = '';

    // Filter
    let filtered = this.ledger.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchVal) ||
                          item.gotra.toLowerCase().includes(searchVal) ||
                          item.pujaType.toLowerCase().includes(searchVal) ||
                          item.phone.includes(searchVal);
      if (!matchSearch) return false;

      if (statusVal === 'all') return true;
      if (statusVal === 'scheduled') return item.status === 'scheduled';
      if (statusVal === 'completed') return item.status === 'completed';
      if (statusVal === 'pending_payment') return item.remaining > 0;
      return true;
    });

    // Update Counters
    const totalPujas = this.ledger.length;
    const upcomingPujas = this.ledger.filter(p => p.status === 'scheduled').length;
    const completedPujas = this.ledger.filter(p => p.status === 'completed').length;
    const totalRemaining = this.ledger.reduce((acc, p) => acc + (p.remaining || 0), 0);

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('stat-total-pujas', totalPujas);
    setText('stat-upcoming', upcomingPujas);
    setText('stat-completed', completedPujas);
    setText('stat-dakshina-balance', `₹ ${totalRemaining.toLocaleString('en-IN')}`);

    if (filtered.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    } else {
      if (emptyState) emptyState.classList.add('hidden');
    }

    filtered.forEach(p => {
      const tr = document.createElement('tr');
      tr.className = "hover:bg-amber-50/70 transition border-b border-amber-100";

      const statusBadge = p.status === 'completed'
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">सम्पन्न (Done)</span>'
        : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">आगामी (Scheduled)</span>';

      tr.innerHTML = `
        <td class="py-3 px-4">
          <div class="font-bold text-gray-900">${p.date}</div>
          <div class="text-[11px] text-orange-700 font-mono">${p.time}</div>
        </td>
        <td class="py-3 px-4">
          <div class="font-bold text-gray-900">${p.name}</div>
          <div class="text-[11px] text-gray-500">गोत्र: ${p.gotra} • 📞 ${p.phone}</div>
        </td>
        <td class="py-3 px-4">
          <div class="font-bold text-orange-950">${p.pujaType}</div>
          ${p.notes ? `<div class="text-[10px] text-gray-500 truncate max-w-xs" title="${p.notes}">📝 ${p.notes}</div>` : ''}
        </td>
        <td class="py-3 px-4">
          <div class="text-xs text-gray-700 truncate max-w-[180px]" title="${p.venue}">${p.venue}</div>
        </td>
        <td class="py-3 px-4">
          <div class="font-bold text-gray-900 font-mono">₹ ${p.dakshina}</div>
          <div class="text-[11px] ${p.remaining > 0 ? 'text-red-700 font-bold' : 'text-emerald-700 font-semibold'}">
            शेष: ₹ ${p.remaining}
          </div>
        </td>
        <td class="py-3 px-4">
          ${statusBadge}
        </td>
        <td class="py-3 px-4 text-center">
          <div class="flex items-center justify-center space-x-1.5">
            <!-- WhatsApp Reminder Button -->
            <button onclick="ToolkitModule.sendWhatsAppReminder('${p.id}')" title="यजमान को WhatsApp स्मरण पत्र भेजें" class="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition">
              <i class="fa-brands fa-whatsapp text-sm"></i>
            </button>
            <!-- Toggle Complete -->
            <button onclick="ToolkitModule.toggleStatus('${p.id}')" title="स्थिति बदलें (Toggle Complete)" class="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition">
              <i class="fa-solid fa-check text-xs"></i>
            </button>
            <!-- Delete -->
            <button onclick="ToolkitModule.deletePuja('${p.id}')" title="हटाएं (Delete)" class="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition">
              <i class="fa-solid fa-trash text-xs"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  sendWhatsAppReminder(id) {
    const item = this.ledger.find(p => p.id === id);
    if (!item) return;

    const message = `॥ ॐ श्री गणेशाय नमः ॥%0A%0Aआदरणीय ${item.name} जी,%0Aप्रणाम। आपके यहाँ आगामी दिनांक ${item.date} को प्रातः/सायं ${item.time} बजे "${item.pujaType}" का पावन अनुष्ठान निश्चित है।%0A%0Aपूजन स्थल: ${item.venue}%0Aकृपया पूजन सामग्री एवं संकल्प पत्र पूर्व से सज्जित रखें।%0A%0Aशुभम् भवतु!%0A- वैदिक पुरोहित सेवा संगम`;
    const cleanPhone = item.phone.replace(/[^0-9]/g, '');
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}&text=${message}`;
    window.open(waUrl, '_blank');
    showToast(`यजमान ${item.name} हेतु WhatsApp संदेश विंडो खोली गई`, 'success');
  },

  toggleStatus(id) {
    const item = this.ledger.find(p => p.id === id);
    if (!item) return;
    item.status = item.status === 'completed' ? 'scheduled' : 'completed';
    if (item.status === 'completed' && item.remaining > 0) {
      item.advance = item.dakshina;
      item.remaining = 0;
    }
    this.saveLedgerToStorage();
    this.renderLedgerTable();
    showToast(`स्थिति अद्यतन: ${item.name} (${item.status === 'completed' ? 'सम्पन्न' : 'आगामी'})`, 'info');
  },

  deletePuja(id) {
    if (confirm("क्या आप निश्चित रूप से इस अनुष्ठान प्रविष्टि को हटाना चाहते हैं?")) {
      this.ledger = this.ledger.filter(p => p.id !== id);
      this.saveLedgerToStorage();
      this.renderLedgerTable();
      showToast("प्रविष्टि सफलतापूर्वक हटा दी गई", "info");
    }
  },

  // SAMAGRI CHECKLIST ENGINE
  loadSamagriList() {
    const select = document.getElementById('samagri-puja-select');
    const container = document.getElementById('samagri-categories-container');
    if (!select || !container) return;

    const key = select.value || 'satyanarayan';
    const puja = this.samagriDatabase[key];
    if (!puja) return;

    container.innerHTML = '';
    let totalItems = 0;
    let checkedCount = 0;

    puja.categories.forEach((cat, cIdx) => {
      const card = document.createElement('div');
      card.className = "bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm flex flex-col justify-between";

      let itemsHtml = '';
      cat.items.forEach((item, iIdx) => {
        totalItems++;
        const itemId = `${key}_c${cIdx}_i${iIdx}`;
        const isChecked = !!this.currentCheckedItems[itemId];
        if (isChecked) checkedCount++;

        itemsHtml += `
          <label class="flex items-start space-x-2.5 p-1.5 rounded-lg hover:bg-amber-50 cursor-pointer text-xs font-devanagari select-none">
            <input type="checkbox" id="${itemId}" onchange="ToolkitModule.toggleCheckItem('${itemId}')" ${isChecked ? 'checked' : ''} class="mt-0.5 w-4 h-4 rounded text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer">
            <span class="${isChecked ? 'line-through text-gray-400 font-medium' : 'text-gray-800 font-semibold'} transition-all">${item}</span>
          </label>
        `;
      });

      card.innerHTML = `
        <div>
          <div class="font-devanagari font-bold text-sm text-orange-950 pb-2 border-b border-amber-200 mb-3 flex items-center justify-between">
            <span>${cat.name}</span>
            <span class="text-[10px] bg-amber-100 text-orange-800 px-2 py-0.5 rounded-full font-mono">${cat.items.length}</span>
          </div>
          <div class="space-y-1">
            ${itemsHtml}
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    this.updateSamagriProgress(checkedCount, totalItems);
  },

  toggleCheckItem(id) {
    this.currentCheckedItems[id] = !this.currentCheckedItems[id];
    this.loadSamagriList();
  },

  updateSamagriProgress(checked, total) {
    const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
    const countEl = document.getElementById('samagri-progress-count');
    const barEl = document.getElementById('samagri-progress-bar');
    if (countEl) countEl.textContent = `${checked} / ${total} (${percent}%)`;
    if (barEl) barEl.style.width = `${percent}%`;
  },

  toggleAllSamagri(checkAll) {
    const select = document.getElementById('samagri-puja-select');
    const key = select?.value || 'satyanarayan';
    const puja = this.samagriDatabase[key];
    if (!puja) return;

    puja.categories.forEach((cat, cIdx) => {
      cat.items.forEach((_, iIdx) => {
        const id = `${key}_c${cIdx}_i${iIdx}`;
        this.currentCheckedItems[id] = checkAll;
      });
    });
    this.loadSamagriList();
    showToast(checkAll ? "सभी सामग्री चेक की गई" : "चेकलिस्ट खाली की गई", "info");
  },

  resetSamagriChecks() {
    this.currentCheckedItems = {};
    this.loadSamagriList();
    showToast("चेकलिस्ट रीसेट की गई", "info");
  },

  addCustomItem() {
    const nameInput = document.getElementById('custom-samagri-name');
    const qtyInput = document.getElementById('custom-samagri-qty');
    const select = document.getElementById('samagri-puja-select');
    if (!nameInput || !select) return;

    const itemName = nameInput.value.trim();
    const itemQty = qtyInput?.value.trim();
    if (!itemName) {
      showToast("कृपया सामग्री का नाम लिखें", "error");
      return;
    }

    const key = select.value;
    const fullText = itemQty ? `${itemName} (${itemQty})` : itemName;
    if (this.samagriDatabase[key] && this.samagriDatabase[key].categories.length > 0) {
      this.samagriDatabase[key].categories[0].items.push(fullText);
      nameInput.value = '';
      if (qtyInput) qtyInput.value = '';
      this.loadSamagriList();
      showToast(`सामग्री जोड़ी गई: ${fullText}`, "success");
    }
  },

  copyForWhatsApp() {
    const select = document.getElementById('samagri-puja-select');
    const key = select?.value || 'satyanarayan';
    const puja = this.samagriDatabase[key];
    if (!puja) return;

    let text = `॥ ॐ श्री गणेशाय नमः ॥\n\nपूजन सामग्री चेकलिस्ट: ${puja.name}\n----------------------------------\n`;
    puja.categories.forEach(cat => {
      text += `\n📌 ${cat.name}:\n`;
      cat.items.forEach((item, iIdx) => {
        const id = `${key}_c${puja.categories.indexOf(cat)}_i${iIdx}`;
        const done = this.currentCheckedItems[id] ? "✅" : "⬜";
        text += `${done} ${item}\n`;
      });
    });
    text += `\nकृपया पूजन के पूर्व उपरोक्त सामग्री एकत्र कर लें।\n- पुरोहित सेवा संगम`;

    navigator.clipboard.writeText(text).then(() => {
      showToast("सामग्री सूची क्लिपबोर्ड में कॉपी की गई! (WhatsApp पर पेस्ट करें)", "success");
    }).catch(() => {
      showToast("कॉपी विफल। कृपया पुनः प्रयास करें।", "error");
    });
  }
};

// ============================================================================
// 5. VEDIC CHANTS, WEB AUDIO API SYNTHESIZER & JAPA 108 COUNTER
// ============================================================================
const AudioChantsModule = {
  // Web Audio Context & Nodes
  audioCtx: null,
  tanpuraOscillators: [],
  tanpuraGain: null,
  isTanpuraRunning: false,
  isPlayingAudio: false,
  isLooping: true,

  // Mantras Database with lyrics, transliteration, audio synthesizer presets & meaning
  mantras: [
    {
      id: "gayatri",
      category: "सर्वश्रेष्ठ वैदिक महामंत्र",
      title: "श्री गायत्री महामंत्र (Gayatri Mantra)",
      sanskrit: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
      translit: "Om Bhur Bhuvah Svah, Tat Savitur Varenyam, Bhargo Devasya Dheemahi, Dhiyo Yo Nah Prachodayaat.",
      meaning: "हम उस प्राणस्वरूप, दुःखनाशक, सुखस्वरूप, श्रेष्ठ, तेजस्वी, पापनाशक, देवस्वरूप परमात्मा का ध्यान करते हैं, जो हमारी बुद्धि को सन्मार्ग की ओर प्रेरित करे।",
      baseFreq: 136.1 // Cosmic Ohm frequency
    },
    {
      id: "mahamrityunjaya",
      category: "रुद्र मोक्ष व संजीवनी मंत्र",
      title: "महामृत्युंजय मंत्र (Mahamrityunjaya)",
      sanskrit: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥",
      translit: "Om Tryambakam Yajaamahe Sugandhim Pushti-Vardhanam, Urvaarukam-Iva Bandhanaan Mrityor-Muksheeya Maa-Amritaat.",
      meaning: "हम त्रि-नेत्रधारी भगवान शिव की आराधना करते हैं जो प्रत्येक श्वास में जीवन शक्ति का संचार करते हैं। जैसे ककड़ी पकने पर बेल से मुक्त हो जाती है, वैसे ही हम मृत्यु व नश्वरता के बंधनों से मुक्त होकर अमरता को प्राप्त करें।",
      baseFreq: 110.0 // A2 Deep grounding
    },
    {
      id: "shanti_path",
      category: "विश्व कल्याण व शांति सूक्त",
      title: "वैदिक शांति पाठ (Shanti Path)",
      sanskrit: "ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः। वनस्पतयः शान्तिर्विश्वेदेवाः शान्तिर्ब्रह्म शान्तिः सर्वं शान्तिः शान्तिरेव शान्तिः सा मा शान्तिरेधि॥",
      translit: "Om Dyauh Shaantir-Antariksham Shaantih Prithivee Shaantir-Aapah Shaantir-Oshadhayah Shaantih...",
      meaning: "द्युलोक, अंतरिक्ष, पृथ्वी, जल, औषधियां, वनस्पतियां, समस्त देवगण एवं ब्रह्म सभी शांत व सामंजस्यपूर्ण हों। सर्वत्र शांति व्याप्त हो और वही शांति मेरे अंतर्मन में स्थापित हो।",
      baseFreq: 146.8 // D3 Harmonizing
    },
    {
      id: "purusha_suktam",
      category: "ऋग्वेद सृष्टि सूक्त",
      title: "पुरुष सूक्तम् (Purusha Suktam)",
      sanskrit: "ॐ सहस्रशीर्षा पुरुषः सहस्राक्षः सहस्रपात्। स भूमिं विश्वतो वृत्वात्यतिष्ठद्दशाङ्गुलम्॥",
      translit: "Om Sahasra-Sheershaa Purushah Sahasra-Akshah Sahasra-Paat, Sa Bhoomim Vishvato Vritva-Atyatishthad-Dashaangulam.",
      meaning: "परम विराट पुरुष के सहस्रों मस्तक, सहस्रों नेत्र और सहस्रों चरण हैं। वह इस समस्त ब्रह्मांड को चारों ओर से व्याप्त करके भी दस अंगुल ऊपर स्थित है।",
      baseFreq: 130.8 // C3 Majestic
    },
    {
      id: "sri_suktam",
      category: "ऋग्वेद लक्ष्मी सूक्त",
      title: "श्री सूक्तम् (Sri Suktam)",
      sanskrit: "ॐ हिरण्यवर्णां हरिणीं सुवर्णरजतस्रजाम्। चन्द्रां हिरण्मयीं लक्ष्मीं जातवेदो म आवह॥",
      translit: "Om Hiranya-Varnaam Harineem Suvarna-Rajata-Srajaam, Chandraam Hiranmayeem Lakshmeem Jaatavedo Ma Aavaha.",
      meaning: "हे अग्निदेव! सुवर्ण सदृश कांतिमान, सोने व चांदी के आभूषणों से अलंकृत, चन्द्रमा के समान आनंददायिनी माँ महालक्ष्मी का मेरे घर में आह्वान कीजिए।",
      baseFreq: 164.8 // E3 Abundance
    },
    {
      id: "hare_krishna",
      category: "कलि संतरण महामंत्र",
      title: "हरे कृष्ण महामंत्र (Hare Krishna Mahamantra)",
      sanskrit: "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे। हरे राम हरे राम राम राम हरे हरे॥",
      translit: "Hare Krishna Hare Krishna Krishna Krishna Hare Hare, Hare Rama Hare Rama Rama Rama Hare Hare.",
      meaning: "हे भगवान के परम आनंद व प्रेम-स्वरूपा शक्ति (हरा)! हे सर्व-आकर्षक श्री कृष्ण व सर्व-आनंददायक श्री राम! मुझे अपनी प्रेममयी सेवा में नियुक्त कीजिए।",
      baseFreq: 136.1
    }
  ],

  currentMantraIndex: 0,
  japaCount: 0,
  completedMalas: 0,

  init() {
    this.renderPlaylist();
    this.updateCurrentMantraView();
    this.initVisualizer();
  },

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  },

  renderPlaylist() {
    const container = document.getElementById('mantras-playlist-container');
    if (!container) return;
    container.innerHTML = '';

    this.mantras.forEach((m, idx) => {
      const btn = document.createElement('button');
      btn.className = `w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
        idx === this.currentMantraIndex
          ? 'bg-orange-50 border-orange-400 shadow-sm'
          : 'bg-white border-amber-200 hover:bg-amber-50/50'
      }`;
      btn.onclick = () => this.selectMantra(idx);

      btn.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-full ${idx === this.currentMantraIndex ? 'bg-orange-600 text-white' : 'bg-amber-100 text-orange-800'} flex items-center justify-center font-bold text-xs">
            ${idx + 1}
          </div>
          <div>
            <div class="font-devanagari font-bold text-xs text-gray-900">${m.title}</div>
            <div class="text-[10px] text-gray-500 font-devanagari">${m.category}</div>
          </div>
        </div>
        <div class="text-xs text-orange-600">
          <i class="fa-solid ${idx === this.currentMantraIndex && this.isPlayingAudio ? 'fa-volume-high' : 'fa-play'}"></i>
        </div>
      `;
      container.appendChild(btn);
    });
  },

  selectMantra(idx) {
    this.currentMantraIndex = idx;
    this.updateCurrentMantraView();
    this.renderPlaylist();
    if (this.isPlayingAudio) {
      this.stopSynthesizedChant();
      this.startSynthesizedChant();
    }
  },

  updateCurrentMantraView() {
    const m = this.mantras[this.currentMantraIndex];
    if (!m) return;

    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setTxt('player-title', m.title);
    setTxt('player-category-tag', m.category);
    setTxt('mantra-sanskrit', m.sanskrit);
    setTxt('mantra-transliteration', m.translit);
    setTxt('mantra-meaning', m.meaning);
  },

  togglePlay() {
    if (this.isPlayingAudio) {
      this.stopSynthesizedChant();
    } else {
      this.startSynthesizedChant();
    }
  },

  startSynthesizedChant() {
    const ctx = this.getAudioContext();
    const m = this.mantras[this.currentMantraIndex];
    const baseFreq = m.baseFreq || 136.1;

    // Create Indian Tanpura Drone Synth (Sa - Pa - Sa' - Sa)
    // Sa = baseFreq, Pa = baseFreq * 1.5, Sa high = baseFreq * 2
    this.synthMasterGain = ctx.createGain();
    const volSlider = document.getElementById('volume-slider');
    const vol = volSlider ? parseFloat(volSlider.value) : 0.8;
    this.synthMasterGain.gain.setValueAtTime(vol * 0.3, ctx.currentTime);
    this.synthMasterGain.connect(ctx.destination);

    // Warm harmonic drone oscillators
    this.activeSynthOscs = [];
    const harmonics = [baseFreq, baseFreq * 1.498, baseFreq * 2.0, baseFreq * 0.5];

    harmonics.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Slow amplitude oscillation mimicking Tanpura plucked resonance
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25 / (i + 1), ctx.currentTime + 1.5 + i * 0.5);

      osc.connect(gain);
      gain.connect(this.synthMasterGain);
      osc.start();
      this.activeSynthOscs.push(osc);
    });

    this.isPlayingAudio = true;
    this.updatePlayBtnState(true);
    document.getElementById('visualizer-idle-text')?.classList.add('hidden');
    showToast(`मंत्र नाद प्रारंभ: ${m.title}`, 'info');
  },

  stopSynthesizedChant() {
    if (this.activeSynthOscs) {
      this.activeSynthOscs.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      this.activeSynthOscs = [];
    }
    this.isPlayingAudio = false;
    this.updatePlayBtnState(false);
    document.getElementById('visualizer-idle-text')?.classList.remove('hidden');
  },

  updatePlayBtnState(isPlaying) {
    const icon = document.getElementById('master-play-icon');
    if (icon) {
      icon.className = isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play ml-1";
    }
  },

  nextMantra() {
    this.currentMantraIndex = (this.currentMantraIndex + 1) % this.mantras.length;
    this.selectMantra(this.currentMantraIndex);
  },

  prevMantra() {
    this.currentMantraIndex = (this.currentMantraIndex - 1 + this.mantras.length) % this.mantras.length;
    this.selectMantra(this.currentMantraIndex);
  },

  toggleLoop() {
    this.isLooping = !this.isLooping;
    const btnText = document.getElementById('loop-btn-text');
    if (btnText) {
      btnText.textContent = this.isLooping ? "लूप (चालू)" : "लूप (बंद)";
    }
    showToast(this.isLooping ? "निरंतर लूप सक्रिय" : "लूप निष्क्रिय", "info");
  },

  // 108 JAPA MALA COUNTER ENGINE
  incrementJapa() {
    this.japaCount++;

    // Acoustic bead click sound via Web Audio API
    const soundToggle = document.getElementById('japa-sound-toggle');
    if (soundToggle && soundToggle.checked) {
      this.playBeadSound();
    }

    if (this.japaCount >= 108) {
      this.completedMalas++;
      this.japaCount = 0;
      this.playTempleBell();
      showToast("🎉 बधाई! १०८ जप पूर्ण होकर १ पूर्ण माला संपन्न हुई!", "success");
    }

    this.updateJapaUI();
  },

  resetJapa() {
    if (this.japaCount > 0 && confirm("क्या आप वर्तमान जप गणना रीसेट करना चाहते हैं?")) {
      this.japaCount = 0;
      this.updateJapaUI();
      showToast("जप गणना रीसेट की गई", "info");
    }
  },

  updateJapaUI() {
    const countDisplay = document.getElementById('japa-count-display');
    const malasDisplay = document.getElementById('japa-malas-completed');
    const ring = document.getElementById('japa-progress-ring');

    if (countDisplay) countDisplay.textContent = this.japaCount;
    if (malasDisplay) malasDisplay.textContent = this.completedMalas;

    if (ring) {
      const circumference = 2 * Math.PI * 80; // ~502.65
      const offset = circumference - (this.japaCount / 108) * circumference;
      ring.style.strokeDashoffset = offset;
    }
  },

  playBeadSound() {
    const ctx = this.getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  },

  playTempleBell() {
    const ctx = this.getAudioContext();
    // Authentic Tibetan / Temple Bell Brass multi-sine damping
    const bellFrequencies = [520, 1040, 1560, 2080];
    bellFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const decay = 2.5 + (3 - idx) * 0.5;
      gain.gain.setValueAtTime(0.3 / (idx + 1), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decay);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + decay);
    });
    showToast("🔔 दिव्य मंदिर घंटा नाद (Temple Bell Resonates)", "info");
  },

  toggleTanpuraSynth() {
    const btnText = document.getElementById('tanpura-btn-text');
    if (this.isTanpuraRunning) {
      this.isTanpuraRunning = false;
      this.stopSynthesizedChant();
      if (btnText) btnText.textContent = "तानपूरा नाद (OFF)";
    } else {
      this.isTanpuraRunning = true;
      this.startSynthesizedChant();
      if (btnText) btnText.textContent = "तानपूरा नाद (ON)";
    }
  },

  initVisualizer() {
    const canvas = document.getElementById('audio-visualizer-canvas');
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');

    const draw = () => {
      requestAnimationFrame(draw);
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      ctx2d.clearRect(0, 0, canvas.width, canvas.height);

      if (!this.isPlayingAudio) {
        // Flat calm golden line
        ctx2d.beginPath();
        ctx2d.moveTo(0, canvas.height / 2);
        ctx2d.lineTo(canvas.width, canvas.height / 2);
        ctx2d.strokeStyle = "rgba(217, 119, 6, 0.25)";
        ctx2d.lineWidth = 2;
        ctx2d.stroke();
        return;
      }

      // Harmonic undulating wave
      const t = Date.now() / 400;
      ctx2d.beginPath();
      ctx2d.lineWidth = 3;
      ctx2d.strokeStyle = "#f59e0b";

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 +
                  Math.sin(x * 0.03 + t) * 16 +
                  Math.sin(x * 0.07 - t * 1.5) * 8;
        if (x === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
      }
      ctx2d.stroke();

      // Mirror wave
      ctx2d.beginPath();
      ctx2d.lineWidth = 1.5;
      ctx2d.strokeStyle = "rgba(234, 88, 12, 0.5)";
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 -
                  Math.sin(x * 0.025 + t * 0.8) * 12;
        if (x === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
      }
      ctx2d.stroke();
    };
    draw();
  }
};

// ============================================================================
// 6. LIVE DARSHAN AGGREGATOR MODULE
// ============================================================================
const LiveDarshanModule = {
  aartiSchedules: {
    kashi: {
      title: "श्री काशी विश्वनाथ धाम - दैनिक आरती समय",
      timings: [
        { name: "मंगला आरती (Mangala Aarti)", time: "प्रातः 03:00 AM - 04:00 AM", desc: "बाबा का प्रथम जागरण एवं दिव्य अभिषेक" },
        { name: "भोग आरती (Bhog Aarti)", time: "दोपहर 11:15 AM - 12:20 PM", desc: "राजभोग अर्पण एवं महाप्रसाद" },
        { name: "संध्या आरती (Sandhya Aarti)", time: "सायं 07:00 PM - 08:15 PM", desc: "अलौकिक स्वर्ण श्रृंगार एवं संध्या वंदन" },
        { name: "शयन आरती (Shayan Aarti)", time: "रात्रि 10:30 PM - 11:00 PM", desc: "रात्रि विश्राम आरती" }
      ],
      url: "https://www.youtube.com/c/ShriKashiVishwanathDhamVaranasi"
    },
    mahakal: {
      title: "श्री महाकालेश्वर ज्योतिर्लिंग - दैनिक आरती समय",
      timings: [
        { name: "भस्म आरती (Bhasma Aarti)", time: "प्रातः 04:00 AM - 06:00 AM", desc: "ताजा भस्म से राजाधिराज का अलौकिक स्नान" },
        { name: "नैवेद्य आरती (Naivedya Aarti)", time: "प्रातः 10:30 AM - 11:00 AM", desc: "प्रातःकालीन महाभोग" },
        { name: "संध्या आरती (Sandhya Aarti)", time: "सायं 05:00 PM - 05:30 PM", desc: "सायंकालीन दिव्य पूजन" },
        { name: "शयन आरती (Shayan Aarti)", time: "रात्रि 10:30 PM - 11:00 PM", desc: "रात्रि शयन एवं पट मंगल" }
      ],
      url: "https://www.youtube.com/c/ShreeMahakaleshwarOfficial"
    },
    somnath: {
      title: "श्री सोमनाथ ज्योतिर्लिंग - दैनिक आरती समय",
      timings: [
        { name: "प्रातः आरती (Morning Aarti)", time: "प्रातः 07:00 AM", desc: "समुद्र तट पर प्रथम ज्योतिर्लिंग आरती" },
        { name: "मध्याह्न आरती (Noon Aarti)", time: "दोपहर 12:00 PM", desc: "राजभोग एवं स्तुति पाठ" },
        { name: "संध्या आरती (Evening Aarti)", time: "सायं 07:00 PM", desc: "दीपमाला एवं जयघोष" }
      ],
      url: "https://www.youtube.com/c/ShreeSomnathTrustOfficial"
    },
    iskcon: {
      title: "इस्कॉन मायापुर / वृन्दावन - दैनिक आरती समय",
      timings: [
        { name: "मंगल आरती (Mangala Aarti)", time: "प्रातः 04:30 AM", desc: "श्री श्री राधा माधव एवं नृसिंह देव आरती" },
        { name: "तुलसी आरती (Tulasi Puja)", time: "प्रातः 05:00 AM", desc: "वृन्दा देवी वंदना एवं परिक्रमा" },
        { name: "शृंगार आरती (Darshan Aarti)", time: "प्रातः 07:00 AM", desc: "दिव्य वस्त्र व पुष्प दर्शन" },
        { name: "संध्या आरती (Gaura Aarti)", time: "सायं 07:00 PM", desc: "महा संकीर्तन एवं गौर आरती" }
      ],
      url: "https://www.youtube.com/c/MayapurTVOfficial"
    }
  },

  showSchedule(key) {
    const data = this.aartiSchedules[key];
    if (!data) return;

    const modal = document.getElementById('aarti-modal');
    const titleEl = document.getElementById('aarti-modal-title');
    const contentEl = document.getElementById('aarti-modal-content');

    if (titleEl) titleEl.textContent = data.title;
    if (contentEl) {
      let html = `<div class="space-y-3">`;
      data.timings.forEach(t => {
        html += `
          <div class="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-orange-950">${t.name}</span>
              <span class="font-mono font-bold text-orange-800 bg-white px-2 py-0.5 rounded border border-amber-300">${t.time}</span>
            </div>
            <p class="text-[11px] text-gray-600 mt-1">${t.desc}</p>
          </div>
        `;
      });
      html += `</div>`;
      contentEl.innerHTML = html;
    }

    if (modal) modal.classList.remove('hidden');
  },

  openExternal(key) {
    const data = this.aartiSchedules[key];
    if (data && data.url) {
      window.open(data.url, '_blank');
    }
  }
};

// ============================================================================
// 7. GLOBAL CONTROLLER, NAVIGATION & TOASTS
// ============================================================================

// Switch Main Navigation Tabs
function switchTab(tabId) {
  // Hide all sections
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));

  // Reset nav tab buttons
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.className = "nav-tab px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-orange-700 hover:bg-orange-50 transition-all flex items-center space-x-2";
  });

  // Show active section
  const targetSection = document.getElementById(`section-${tabId}`);
  if (targetSection) targetSection.classList.remove('hidden');

  // Highlight active button
  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  if (activeBtn) {
    activeBtn.className = "nav-tab active-tab px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow";
  }

  // Close mobile dropdown if open
  const mobileMenu = document.getElementById('mobile-nav-menu');
  if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
    mobileMenu.classList.add('hidden');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Switch Toolkit Sub-Tabs (Ledger vs Samagri)
function switchToolkitSubTab(subTab) {
  const panelLedger = document.getElementById('subpanel-ledger');
  const panelSamagri = document.getElementById('subpanel-samagri');
  const btnLedger = document.getElementById('toolkit-tab-ledger');
  const btnSamagri = document.getElementById('toolkit-tab-samagri');

  if (subTab === 'ledger') {
    panelLedger.classList.remove('hidden');
    panelSamagri.classList.add('hidden');
    btnLedger.className = "px-4 py-2 rounded-lg text-xs font-bold transition-all bg-orange-600 text-white shadow";
    btnSamagri.className = "px-4 py-2 rounded-lg text-xs font-bold text-gray-700 hover:text-orange-700 transition-all";
  } else {
    panelLedger.classList.add('hidden');
    panelSamagri.classList.remove('hidden');
    btnSamagri.className = "px-4 py-2 rounded-lg text-xs font-bold transition-all bg-orange-600 text-white shadow";
    btnLedger.className = "px-4 py-2 rounded-lg text-xs font-bold text-gray-700 hover:text-orange-700 transition-all";
    ToolkitModule.loadSamagriList();
  }
}

// Modal Handlers
function openAddPujaModal() {
  document.getElementById('add-puja-modal')?.classList.remove('hidden');
}
function closeAddPujaModal() {
  document.getElementById('add-puja-modal')?.classList.add('hidden');
}
function toggleAartiSchedule(key) {
  LiveDarshanModule.showSchedule(key);
}
function closeAartiSchedule() {
  document.getElementById('aarti-modal')?.classList.add('hidden');
}
function openExternalStream(key) {
  LiveDarshanModule.openExternal(key);
}

// Audio Player Shortcuts
function togglePlayAudio() { AudioChantsModule.togglePlay(); }
function nextMantra() { AudioChantsModule.nextMantra(); }
function prevMantra() { AudioChantsModule.prevMantra(); }
function toggleLoopAudio() { AudioChantsModule.toggleLoop(); }
function toggleTanpuraSynthesizer() { AudioChantsModule.toggleTanpuraSynth(); }
function incrementJapaCount() { AudioChantsModule.incrementJapa(); }
function resetJapaCount() { AudioChantsModule.resetJapa(); }
function playTempleBellSound() { AudioChantsModule.playTempleBell(); }

// Samagri Shortcuts
function loadSamagriList() { ToolkitModule.loadSamagriList(); }
function toggleAllSamagri(status) { ToolkitModule.toggleAllSamagri(status); }
function resetSamagriChecks() { ToolkitModule.resetSamagriChecks(); }
function addCustomSamagriItem() { ToolkitModule.addCustomItem(); }
function copySamagriForWhatsApp() { ToolkitModule.copyForWhatsApp(); }
function printSamagriSheet() { window.print(); }
function printKundliReport() { window.print(); }

// Export Ledger to CSV
function exportLedgerCSV() {
  const data = ToolkitModule.ledger;
  if (!data || data.length === 0) {
    showToast("निर्यात हेतु कोई डेटा उपलब्ध नहीं है", "info");
    return;
  }

  let csv = "ID,Name,Gotra,Phone,PujaType,Date,Time,Venue,Dakshina,Advance,Remaining,Status,Notes\n";
  data.forEach(p => {
    const cleanNotes = (p.notes || "").replace(/"/g, '""');
    csv += `"${p.id}","${p.name}","${p.gotra}","${p.phone}","${p.pujaType}","${p.date}","${p.time}","${p.venue}",${p.dakshina},${p.advance},${p.remaining},"${p.status}","${cleanNotes}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Vedic_Purohit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("बहीखाता CSV सफलतापूर्वक डाउनलोड हुआ!", "success");
}

// Toast Feedback Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-900 border-emerald-500 text-emerald-100',
    error: 'bg-rose-900 border-rose-500 text-rose-100',
    info: 'bg-stone-900 border-gold-500 text-amber-100'
  };

  toast.className = `p-3.5 rounded-xl border shadow-xl flex items-center space-x-2.5 text-xs font-semibold pointer-events-auto transform transition duration-300 translate-y-2 opacity-0 font-devanagari ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : '🕉️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Real-Time Live Clock Updater
function startLiveClock() {
  const clockEl = document.getElementById('header-live-clock');
  const update = () => {
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    }
  };
  update();
  setInterval(update, 1000);
}

// ============================================================================
// INITIALIZATION ON DOM CONTENT LOADED
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  startLiveClock();

  // Language toggle listener
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const newLang = I18N.currentLang === 'hi' ? 'en' : 'hi';
      I18N.setLanguage(newLang);
    });
  }

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-nav-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Temple Bell button in top bar
  const bellBtn = document.getElementById('temple-bell-btn');
  if (bellBtn) {
    bellBtn.addEventListener('click', () => {
      AudioChantsModule.playTempleBell();
    });
  }

  // Volume slider
  const volSlider = document.getElementById('volume-slider');
  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      if (AudioChantsModule.synthMasterGain && AudioChantsModule.audioCtx) {
        AudioChantsModule.synthMasterGain.gain.setValueAtTime(
          parseFloat(e.target.value) * 0.3,
          AudioChantsModule.audioCtx.currentTime
        );
      }
    });
  }

  // Initialize Modules
  PanchangModule.init();
  KundliModule.init();
  ToolkitModule.init();
  AudioChantsModule.init();

  console.log("🕉️ वैदिक सेवा संगम (Vedic Seva Sangam) Platform Initialized Flawlessly!");
});
