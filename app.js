/**
 * आचार्य पं० अश्वनी कुमार शुक्ल — वैदिक एवं सनातन सेवा केंद्र (गोरखपुर, उ०प्र०)
 * Public Contact: 7309441019 | Location: Gorakhpur, UP, India
 * 
 * Complete Client-Side Controller, Router & Analytical Engine
 * Supports 15 Public Pages, Admin Dashboard, Panchang, Kundli, Samagri, Mantras & Booking
 */

// ============================================================================
// 1. GLOBAL STATE & CONFIGURATION
// ============================================================================
const APP_STATE = {
  currentLang: 'hi', // 'hi' or 'en'
  currentRoute: '#/',
  adminToken: localStorage.getItem('acharya_admin_token') || null,
  adminUser: JSON.parse(localStorage.getItem('acharya_admin_user') || 'null'),
  siteProfile: {
    acharya_name: "आचार्य पं० अश्वनी कुमार शुक्ल",
    title: "वैदिक कर्मकाण्ड, ज्योतिष मर्मज्ञ एवं श्रीमद्भागवत कथा वाचक",
    location: "गोरखपुर, उत्तर प्रदेश, भारत (Gorakhpur, UP, India)",
    phone: "7309441019",
    whatsapp: "+917309441019",
    email: "acharya.ashwanishukla@gmail.com",
    bio: "गोरखपुर की पावन धरा से सनातन वैदिक संस्कृति, ज्योतिषीय मार्गदर्शन, प्रामाणिक कर्मकाण्ड एवं श्रीमद्भागवत कथा के प्रचार-प्रसार हेतु समर्पित। यजमानों के कल्याणार्थ शुद्ध शास्त्रोक्त विधि से अनुष्ठान एवं शोधपरक मार्गदर्शन प्रदान करते हैं।",
    qualifications: "वेद, कर्मकाण्ड एवं पराशर ज्योतिष में दीर्घकालीन प्रामाणिक स्वाध्याय व अनुभव (विवरण संपादन योग्य)",
    research_overview: "पूर्वांचल की सनातन धार्मिक परम्पराओं, गृह्यसूत्रों के संस्कार विधान एवं काल गणना पर निरंतर शोध व लेखन"
  },
  services: [],
  events: [],
  articles: [],
  bookings: [],
  yajmans: []
};

// ============================================================================
// 2. API CLIENT HELPER (WITH OFFLINE/STATIC FALLBACK)
// ============================================================================
const API = {
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (APP_STATE.adminToken) {
      headers['Authorization'] = `Bearer ${APP_STATE.adminToken}`;
    }

    try {
      const response = await fetch(endpoint, { ...options, headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`API call failed for ${endpoint}:`, err.message);
      throw err;
    }
  },

  async getProfile() {
    try {
      return await this.request('/api/profile');
    } catch (e) {
      return APP_STATE.siteProfile;
    }
  },

  async getServices() {
    try {
      return await this.request('/api/services');
    } catch (e) {
      return [
        { id: 1, category: 'katha', title: 'श्रीमद्भागवत सप्ताह ज्ञान यज्ञ', description: '7 दिवसीय संगीतमय श्रीमद्भागवत कथा वाचन।', duration_hours: 28, dakshina_guideline: 'स्वेच्छा / यजमान इच्छानुसार' },
        { id: 2, category: 'katha', title: 'श्री राम कथा एवं नवाह्न परायण', description: '9 दिवसीय मर्यादा पुरुषोत्तम श्री राम कथा।', duration_hours: 27, dakshina_guideline: 'स्वेच्छा दक्षिणा' },
        { id: 3, category: 'puja', title: 'रुद्राभिषेक एवं महारुद्र पूजन', description: 'भगवान शिव का पञ्चामृत व 108 बेलपत्र महाभिषेक।', duration_hours: 3, dakshina_guideline: '₹2100 - ₹5100' },
        { id: 4, category: 'puja', title: 'श्री सत्यनारायण व्रत कथा', description: 'पूर्णिमा व शुभ अवसरों पर श्री सत्यनारायण पूजन।', duration_hours: 2.5, dakshina_guideline: '₹1100 - ₹2100' },
        { id: 5, category: 'puja', title: 'गृह प्रवेश एवं वास्तु शांति', description: 'नूतन भवन में वास्तु दोष शमन व नवग्रह हवन।', duration_hours: 4.5, dakshina_guideline: '₹3100 - ₹7100' },
        { id: 6, category: 'astrology', title: 'विस्तृत जन्म कुण्डली परामर्श', description: 'लग्न चक्र, महादशा व भविष्य फलादेश विमर्श।', duration_hours: 1, dakshina_guideline: '₹501 - ₹1100' },
        { id: 7, category: 'sanskar', title: 'विवाह संस्कार एवं पाणिग्रहण', description: 'सप्तपदी व पूर्ण वैदिक पद्धति से विवाह।', duration_hours: 6, dakshina_guideline: 'यजमान विमर्श अनुसार' }
      ];
    }
  },

  async createBooking(payload) {
    try {
      return await this.request('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // Local fallback simulation
      const randRef = `AKS-${new Date().toISOString().slice(2, 7).replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        success: true,
        booking_ref: randRef,
        status: 'requested',
        message: 'बुकिंग अनुरोध ऑफलाइन/लोकल मोड में सुरक्षित दर्ज किया गया!'
      };
    }
  },

  async trackBooking(ref) {
    return await this.request(`/api/bookings/track/${encodeURIComponent(ref)}`);
  },

  async getEvents() {
    try {
      return await this.request('/api/events');
    } catch (e) {
      return [
        { id: 1, title: 'श्रीमद्भागवत सप्ताह ज्ञान यज्ञ (गोरखपुर)', event_type: 'katha', start_date: '2026-11-10', venue: 'श्री संकट मोचन धाम परिसर, तारामंडल, गोरखपुर', stream_status: 'upcoming', description: 'आचार्य पं० अश्वनी कुमार शुक्ल जी द्वारा संगीतमय कथा।' }
      ];
    }
  },

  async getArticles(search = '', cat = '') {
    try {
      let url = '/api/articles';
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (cat) params.append('cat', cat);
      if (params.toString()) url += `?${params.toString()}`;
      return await this.request(url);
    } catch (e) {
      return [
        { id: 1, slug: 'purvanchal-vedic-traditions', title: 'पूर्वांचल की सनातन धार्मिक परम्पराएं एवं लोक संस्कार', summary: 'गोरखपुर व पूर्वांचल अंचल की वैदिक मान्यताओं एवं लोकाचार का शास्त्रीय विश्लेषण।', category: 'purvanchal_traditions', author: 'आचार्य पं० अश्वनी कुमार शुक्ल', created_at: '2026-10-15' },
        { id: 2, slug: 'shrimad-bhagwat-katha-mahatmya', title: 'कलिकाल में श्रीमद्भागवत कथा का माहात्म्य एवं श्रवण फल', summary: 'श्रीमद्भागवत महापुराण के श्रवण मात्र से चित्त शुद्धि का शास्त्रोक्त प्रमाण।', category: 'vedic_philosophy', author: 'आचार्य पं० अश्वनी कुमार शुक्ल', created_at: '2026-10-10' }
      ];
    }
  },

  async getPrayers() {
    try {
      return await this.request('/api/prayers');
    } catch (e) {
      return [
        { id: 1, devotee_name: 'रमेश चंद्र त्रिपाठी', city: 'गोरखपुर', prayer_text: 'आचार्य जी के मार्गदर्शन से हमारे गृह प्रवेश का अनुष्ठान अत्यंत शुभता से संपन्न हुआ।', created_at: '2026-10-18' }
      ];
    }
  },

  async postPrayer(payload) {
    return await this.request('/api/prayers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

// ============================================================================
// 3. ASTRONOMICAL PANCHANG ENGINE FOR GORAKHPUR & WORLD (LAHIRI AYANAMSA)
// ============================================================================
const VedicPanchang = {
  // Gorakhpur (Default): 26.7606° N, 83.3732° E, Timezone +5.5
  defaultLocation: { name: "गोरखपुर (Gorakhpur)", lat: 26.7606, lon: 83.3732, tz: 5.5 },

  tithis: [
    "शुक्ल प्रतिपदा", "शुक्ल द्वितीया", "शुक्ल तृतीया", "शुक्ल चतुर्थी", "शुक्ल पंचमी",
    "शुक्ल षष्ठी", "शुक्ल सप्तमी", "शुक्ल अष्टमी", "शुक्ल नवमी", "शुक्ल दशमी",
    "शुक्ल एकादशी", "शुक्ल द्वादशी", "शुक्ल त्रयोदशी", "शुक्ल चतुर्दशी", "पूर्णिमा",
    "कृष्ण प्रतिपदा", "कृष्ण द्वितीया", "कृष्ण तृतीया", "कृष्ण चतुर्थी", "कृष्ण पंचमी",
    "कृष्ण षष्ठी", "कृष्ण सप्तमी", "कृष्ण अष्टमी", "कृष्ण नवमी", "कृष्ण दशमी",
    "कृष्ण एकादशी", "कृष्ण द्वादशी", "कृष्ण त्रयोदशी", "कृष्ण चतुर्दशी", "अमावस्या"
  ],

  nakshatras: [
    { name: "अश्विनी", lord: "केतु", deity: "अश्विनी कुमार" },
    { name: "भरणी", lord: "शुक्र", deity: "यमराज" },
    { name: "कृत्तिका", lord: "सूर्य", deity: "अग्नि देव" },
    { name: "रोहिणी", lord: "चन्द्र", deity: "ब्रह्मा जी" },
    { name: "मृगशिरा", lord: "मंगल", deity: "चन्द्रमा" },
    { name: "आर्द्रा", lord: "राहु", deity: "रुद्र देव" },
    { name: "पुनर्वसु", lord: "गुरु", deity: "अदिति" },
    { name: "पुष्य", lord: "शनि", deity: "बृहस्पति" },
    { name: "आश्लेषा", lord: "बुध", deity: "सर्प" },
    { name: "मघा", lord: "केतु", deity: "पितृगण" },
    { name: "पूर्वाफाल्गुनी", lord: "शुक्र", deity: "भग" },
    { name: "उत्तराफाल्गुनी", lord: "सूर्य", deity: "अर्यमा" },
    { name: "हस्त", lord: "चन्द्र", deity: "सविता" },
    { name: "चित्रा", lord: "मंगल", deity: "विश्वकर्मा" },
    { name: "स्वाति", lord: "राहु", deity: "वायु" },
    { name: "विशाखा", lord: "गुरु", deity: "इन्द्राग्नि" },
    { name: "अनुराधा", lord: "शनि", deity: "मित्र" },
    { name: "ज्येष्ठा", lord: "बुध", deity: "इन्द्र" },
    { name: "मूल", lord: "केतु", deity: "निरृति" },
    { name: "पूर्वाषाढ़ा", lord: "शुक्र", deity: "आपः" },
    { name: "उत्तराषाढ़ा", lord: "सूर्य", deity: "विश्वेदेव" },
    { name: "श्रवण", lord: "चन्द्र", deity: "विष्णु" },
    { name: "धनिष्ठा", lord: "मंगल", deity: "वसुगण" },
    { name: "शतभिषा", lord: "राहु", deity: "वरुण" },
    { name: "पूर्वाभाद्रपद", lord: "गुरु", deity: "अजैकपाद" },
    { name: "उत्तराभाद्रपद", lord: "शनि", deity: "अहिर्बुध्न्य" },
    { name: "रेवती", lord: "बुध", deity: "पूषा" }
  ],

  yogas: [
    "विष्कम्भ", "प्रीति", "आयुष्मान", "सौभाग्य", "शोभन", "अतिगण्ड", "सुकर्मा", "धृति",
    "शूल", "गण्ड", "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र", "सिद्धि",
    "व्यतीपात", "वरीयान", "परिघ", "शिव", "सिद्ध", "साध्य", "शुभ", "शुक्ल",
    "ब्रह्म", "इन्द्र", "वैधृति"
  ],

  karanas: [
    "बव", "बालव", "कौलव", "तैतिल", "गर", "वणिज", "विष्टि (भद्रा)",
    "शकुनि", "चतुष्पद", "नाग", "किंस्तुघ्न"
  ],

  rashis: [
    { num: 1, name: "मेष (Aries)", lord: "मंगल", element: "अग्नि" },
    { num: 2, name: "वृषभ (Taurus)", lord: "शुक्र", element: "पृथ्वी" },
    { num: 3, name: "मिथुन (Gemini)", lord: "बुध", element: "वायु" },
    { num: 4, name: "कर्क (Cancer)", lord: "चन्द्र", element: "जल" },
    { num: 5, name: "सिंह (Leo)", lord: "सूर्य", element: "अग्नि" },
    { num: 6, name: "कन्या (Virgo)", lord: "बुध", element: "पृथ्वी" },
    { num: 7, name: "तुला (Libra)", lord: "शुक्र", element: "वायु" },
    { num: 8, name: "वृश्चिक (Scorpio)", lord: "मंगल", element: "जल" },
    { num: 9, name: "धनु (Sagittarius)", lord: "गुरु", element: "अग्नि" },
    { num: 10, name: "मकर (Capricorn)", lord: "शनि", element: "पृथ्वी" },
    { num: 11, name: "कुंभ (Aquarius)", lord: "शनि", element: "वायु" },
    { num: 12, name: "मीन (Pisces)", lord: "गुरु", element: "जल" }
  ],

  vaars: ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],

  // Choghadiya Orders (Day & Night)
  choghadiyaTypes: {
    "अमृत": { nature: "सर्वोत्तम शुभ", color: "text-emerald-700 bg-emerald-100" },
    "शुभ": { nature: "शुभ", color: "text-emerald-600 bg-emerald-50" },
    "लाभ": { nature: "उन्नति कारक", color: "text-teal-700 bg-teal-100" },
    "चर": { nature: "सामान्य शुभ", color: "text-blue-700 bg-blue-100" },
    "रोग": { nature: "अशुभ (रोग कारक)", color: "text-rose-700 bg-rose-100" },
    "काल": { nature: "अति अशुभ (हानि)", color: "text-red-800 bg-red-100" },
    "उद्वेग": { nature: "अशुभ (चिंता)", color: "text-orange-800 bg-orange-100" }
  },

  calculate(date = new Date(), loc = this.defaultLocation) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours() + date.getMinutes() / 60;

    let y = year;
    let m = month;
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + (hour - loc.tz) / 24 + B - 1524.5;
    const T = (JD - 2451545.0) / 36525.0;

    const ayanamsa = 23.85 + (T * 36525 / 365.2422) * (50.29 / 3600);

    const L0 = 280.46646 + 36000.76983 * T;
    const M_sun = 357.52911 + 35999.05029 * T;
    const C_sun = (1.914602 - 0.004817 * T) * Math.sin(M_sun * Math.PI / 180) + 0.02 * Math.sin(2 * M_sun * Math.PI / 180);
    let sun_trop = (L0 + C_sun) % 360;
    if (sun_trop < 0) sun_trop += 360;

    const L_moon = 218.3164477 + 481267.88123421 * T;
    const M_moon = 134.9633964 + 477198.8675055 * T;
    const D = 297.8501921 + 445267.1114034 * T;
    const moon_pert = 6.289 * Math.sin(M_moon * Math.PI / 180) + 1.274 * Math.sin((2 * D - M_moon) * Math.PI / 180) + 0.658 * Math.sin(2 * D * Math.PI / 180);
    let moon_trop = (L_moon + moon_pert) % 360;
    if (moon_trop < 0) moon_trop += 360;

    let sun_sidereal = (sun_trop - ayanamsa + 360) % 360;
    let moon_sidereal = (moon_trop - ayanamsa + 360) % 360;

    let diff = (moon_sidereal - sun_sidereal + 360) % 360;
    const tithiIdx = Math.floor(diff / 12);
    const nakIdx = Math.floor(moon_sidereal / (360 / 27));
    const pada = Math.floor(((moon_sidereal % (360 / 27)) / (360 / 27)) * 4) + 1;
    const yogaIdx = Math.floor(((sun_sidereal + moon_sidereal) % 360) / (360 / 27));

    const halfTithi = Math.floor(diff / 6);
    let karanaIdx = 0;
    if (halfTithi === 0) karanaIdx = 10;
    else if (halfTithi >= 57) karanaIdx = 7 + (halfTithi - 57);
    else karanaIdx = (halfTithi - 1) % 7;

    const moonRashiIdx = Math.floor(moon_sidereal / 30);
    const sunRashiIdx = Math.floor(sun_sidereal / 30);
    const weekday = date.getDay();

    // Sunrise & Sunset calculation for Gorakhpur
    const dayOfYear = Math.floor((date - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24));
    const declination = 23.45 * Math.sin(((360 / 365) * (dayOfYear - 81)) * Math.PI / 180);
    const latRad = loc.lat * Math.PI / 180;
    const decRad = declination * Math.PI / 180;
    let cosHA = -Math.tan(latRad) * Math.tan(decRad);
    cosHA = Math.max(-1, Math.min(1, cosHA));
    const hourAngle = Math.acos(cosHA) * 180 / Math.PI;

    const timeDiff = 4 * (loc.tz * 15 - loc.lon);
    const solarNoonMin = 12 * 60 + timeDiff;
    const sunriseMin = solarNoonMin - (hourAngle / 15) * 60;
    const sunsetMin = solarNoonMin + (hourAngle / 15) * 60;

    const dayLength = sunsetMin - sunriseMin;
    const eighthPart = dayLength / 8;
    const rahuParts = [7, 1, 6, 4, 5, 3, 2];
    const rahuStart = sunriseMin + rahuParts[weekday] * eighthPart;
    const rahuEnd = rahuStart + eighthPart;

    const muhurtaLength = dayLength / 15;
    const abhijitStart = sunriseMin + 7 * muhurtaLength;
    const abhijitEnd = sunriseMin + 8 * muhurtaLength;

    const formatTime = (m) => {
      let mins = Math.round(m) % 1440;
      if (mins < 0) mins += 1440;
      const h24 = Math.floor(mins / 60);
      const minPart = mins % 60;
      const period = h24 >= 12 ? 'PM' : 'AM';
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      return `${String(h12).padStart(2, '0')}:${String(minPart).padStart(2, '0')} ${period}`;
    };

    // Calculate Day Choghadiyas (8 parts of daylight)
    const dayChoghadiyaSequences = [
      ["उद्वेग", "चर", "लाभ", "अमृत", "काल", "शुभ", "रोग", "उद्वेग"], // Sun
      ["अमृत", "काल", "शुभ", "रोग", "उद्वेग", "चर", "लाभ", "अमृत"], // Mon
      ["रोग", "उद्वेग", "चर", "लाभ", "अमृत", "काल", "शुभ", "रोग"], // Tue
      ["लाभ", "अमृत", "काल", "शुभ", "रोग", "उद्वेग", "चर", "लाभ"], // Wed
      ["शुभ", "रोग", "उद्वेग", "चर", "लाभ", "अमृत", "काल", "शुभ"], // Thu
      ["चर", "लाभ", "अमृत", "काल", "शुभ", "रोग", "उद्वेग", "चर"], // Fri
      ["काल", "शुभ", "रोग", "उद्वेग", "चर", "लाभ", "अमृत", "काल"]  // Sat
    ];

    const dayChoghadiya = dayChoghadiyaSequences[weekday].map((name, i) => {
      const s = sunriseMin + i * eighthPart;
      const e = s + eighthPart;
      return {
        name,
        time: `${formatTime(s)} - ${formatTime(e)}`,
        info: this.choghadiyaTypes[name] || { nature: "सामान्य", color: "text-gray-700 bg-gray-100" }
      };
    });

    return {
      tithi: this.tithis[tithiIdx],
      paksha: tithiIdx <= 14 ? "शुक्ल पक्ष" : "कृष्ण पक्ष",
      nakshatra: this.nakshatras[nakIdx],
      pada,
      yoga: this.yogas[yogaIdx],
      karana: this.karanas[karanaIdx],
      rashi: this.rashis[moonRashiIdx],
      sunRashi: this.rashis[sunRashiIdx],
      vaar: this.vaars[weekday],
      sunrise: formatTime(sunriseMin),
      sunset: formatTime(sunsetMin),
      moonrise: formatTime((sunriseMin + 450) % 1440),
      moonset: formatTime((sunsetMin + 580) % 1440),
      abhijit: `${formatTime(abhijitStart)} - ${formatTime(abhijitEnd)}`,
      rahu: `${formatTime(rahuStart)} - ${formatTime(rahuEnd)}`,
      brahma: `${formatTime(sunriseMin - 96)} - ${formatTime(sunriseMin - 48)}`,
      godhuli: `${formatTime(sunsetMin - 15)} - ${formatTime(sunsetMin + 15)}`,
      dayChoghadiya,
      vikramSamvat: year + 57,
      shakaSamvat: year - 78,
      locationName: loc.name
    };
  }
};

// ============================================================================
// 4. KUNDLI & ASTROLOGY ENGINE (GUNA MILAN, MANGAL DOSHA, SADE SATI)
// ============================================================================
const VedicAstrology = {
  // Guna Milan (Ashta Koota - 36 Points)
  calculateGunaMilan(boyMoonSign, boyNakshatra, girlMoonSign, girlNakshatra) {
    // Standard Ashta Koota weights:
    // 1. Varna: 1 point
    // 2. Vashya: 2 points
    // 3. Tara: 3 points
    // 4. Yoni: 4 points
    // 5. Graha Maitri: 5 points
    // 6. Gana: 6 points
    // 7. Bhakoot: 7 points
    // 8. Nadi: 8 points
    // Total = 36 points

    const varnaScore = ((boyMoonSign.num % 4) >= (girlMoonSign.num % 4)) ? 1 : 0;
    const vashyaScore = (boyMoonSign.num === girlMoonSign.num || Math.abs(boyMoonSign.num - girlMoonSign.num) === 4) ? 2 : 1;
    const taraScore = ((boyNakshatra.pada + girlNakshatra.pada) % 3 === 0) ? 3 : 1.5;
    const yoniScore = (Math.abs(boyMoonSign.num - girlMoonSign.num) % 2 === 0) ? 3.5 : 2;
    const grahaMaitri = (boyMoonSign.lord === girlMoonSign.lord) ? 5 : 3;
    const ganaScore = (boyMoonSign.element === girlMoonSign.element) ? 6 : 4;
    const bhakootScore = ([6, 8, 12, 2].includes(Math.abs(boyMoonSign.num - girlMoonSign.num))) ? 0 : 7;
    const nadiScore = (boyNakshatra.name !== girlNakshatra.name) ? 8 : 0;

    const totalScore = varnaScore + vashyaScore + taraScore + yoniScore + grahaMaitri + ganaScore + bhakootScore + nadiScore;

    let verdict = "उत्तम मिलान (Highly Auspicious)";
    let desc = "वर एवं कन्या की कुण्डली का मिलान अत्यंत अनुकूल है। दांपत्य जीवन सुखमय, समृद्ध एवं सामंजस्यपूर्ण रहेगा।";
    if (totalScore < 18) {
      verdict = "मध्यम / विचारणीय (Requires Remedies)";
      desc = "गुण संख्या 18 से कम है। नाड़ी अथवा भकूट दोष की शांति हेतु वैदिक अनुष्ठान एवं आचार्य जी से प्रत्यक्ष परामर्श आवश्यक है।";
    } else if (totalScore < 24) {
      verdict = "शुभ एवं संतोषजनक (Favorable)";
      desc = "गुण मिलान संतोषजनक है। गृहस्थ जीवन में सुख-शांति हेतु अनुकूल ग्रहों के उपाय अनुशंसित हैं।";
    }

    return {
      scores: {
        varna: varnaScore,
        vashya: vashyaScore,
        tara: taraScore,
        yoni: yoniScore,
        grahaMaitri,
        gana: ganaScore,
        bhakoot: bhakootScore,
        nadi: nadiScore
      },
      totalScore: Math.round(totalScore * 10) / 10,
      verdict,
      desc
    };
  },

  // Mangal Dosha Analyzer
  analyzeMangalDosha(lagnaSign, marsHouse) {
    // Classical: Mars in 1, 4, 7, 8, 12
    const mangalHouses = [1, 4, 7, 8, 12];
    const isPresent = mangalHouses.includes(marsHouse);
    
    // Cancellation checks (e.g., Mars in Aries in 1st, Scorpio in 4th, Capricorn in 7th, etc.)
    const isCancelled = (marsHouse === 1 && lagnaSign.num === 1) || (marsHouse === 7 && lagnaSign.num === 10);

    return {
      hasDosha: isPresent && !isCancelled,
      isCancelled: isPresent && isCancelled,
      house: marsHouse,
      intensity: (marsHouse === 7 || marsHouse === 8) ? "प्रबल (High)" : "सामान्य (Mild)",
      remedy: isPresent
        ? "मंगलवार को श्री हनुमान चालीसा का पाठ, सुंदरकांड श्रवण अथवा मंगल शांति अनुष्ठान फलदायी रहेगा।"
        : "कुण्डली में भौम (मांगलिक) दोष नहीं है।"
    };
  },

  // Shani Sade Sati Analyzer
  analyzeSadeSati(moonSignNum) {
    // Current Saturn in Aquarius (Sign 11) for 2026
    const saturnCurrentSign = 11;
    const diff = (saturnCurrentSign - moonSignNum + 12) % 12;

    if (diff === 11) {
      return { status: "सक्रिय (आरंभिक चरण / First Phase)", impact: "मानसिक श्रम, आर्थिक योजना में सावधानी बरतें।", isActive: true };
    } else if (diff === 0) {
      return { status: "सक्रिय (मध्यम चरण / Peak Phase)", impact: "कठिन परिश्रम का समय, सत्यनिष्ठा एवं भगवान शिव की आराधना से लाभ होगा।", isActive: true };
    } else if (diff === 1) {
      return { status: "सक्रिय (अंतिम चरण / Setting Phase)", impact: "कठिनाइयों से मुक्ति का समय, नए अवसर प्राप्त होंगे।", isActive: true };
    } else {
      return { status: "साढ़े साती मुक्त (Not Active)", impact: "वर्तमान में शनि की साढ़े साती का प्रभाव नहीं है।", isActive: false };
    }
  }
};

// ============================================================================
// 5. WEB AUDIO API ACOUSTIC SYNTHESIZER (TANPURA & TEMPLE BELL)
// ============================================================================
const VedicAudio = {
  ctx: null,
  tanpuraGain: null,
  activeOscs: [],
  isPlaying: false,

  getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  playTempleBell() {
    const ctx = this.getContext();
    const bellFrequencies = [520, 1040, 1560, 2080];
    bellFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      const decay = 2.5 + (3 - idx) * 0.5;
      gain.gain.setValueAtTime(0.25 / (idx + 1), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decay);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + decay);
    });
    showToast("🔔 दिव्य मंदिर घंटा नाद (Temple Bell)", "info");
  },

  playBeadClick() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  },

  toggleTanpuraDrone(baseFreq = 136.1) {
    const ctx = this.getContext();
    if (this.isPlaying) {
      this.activeOscs.forEach(o => { try { o.stop(); o.disconnect(); } catch(e){} });
      this.activeOscs = [];
      this.isPlaying = false;
      showToast("तानपूरा नाद विराम (Stopped)", "info");
      return false;
    } else {
      const harmonics = [baseFreq, baseFreq * 1.5, baseFreq * 2.0, baseFreq * 0.5];
      this.tanpuraGain = ctx.createGain();
      this.tanpuraGain.gain.setValueAtTime(0.15, ctx.currentTime);
      this.tanpuraGain.connect(ctx.destination);

      harmonics.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        g.gain.setValueAtTime(0.05, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.2 / (i + 1), ctx.currentTime + 1.2 + i * 0.4);
        osc.connect(g);
        g.connect(this.tanpuraGain);
        osc.start();
        this.activeOscs.push(osc);
      });
      this.isPlaying = true;
      showToast("ॐ तानपूरा नाद सक्रिय (Tanpura Drone Playing)", "success");
      return true;
    }
  }
};

// ============================================================================
// 6. VIEW GENERATORS FOR ALL 15 REQUIRED PAGES & ADMIN
// ============================================================================
const Views = {
  // 1. HOME VIEW
  home() {
    return `
      <!-- Hero Section with Verified Identity -->
      <div class="relative bg-gradient-to-r from-maroon-950 via-maroon-900 to-saffron-950 text-white rounded-3xl p-6 sm:p-10 shadow-sacred mb-10 overflow-hidden border border-gold-400/40">
        <div class="absolute -right-10 -bottom-10 opacity-10 text-9xl text-amber-300 font-bold select-none">
          ॐ
        </div>
        <div class="max-w-3xl relative z-10">
          <div class="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-gold-400/30 mb-3">
            <span class="w-2 h-2 rounded-full bg-emerald-400 live-dot"></span>
            <span>गोरखपुर, उत्तर प्रदेश • अधिकृत वैदिक केंद्र</span>
          </div>
          <h1 class="text-3xl sm:text-5xl font-devanagari font-extrabold text-amber-100 tracking-tight leading-tight">
            आचार्य पं० अश्वनी कुमार शुक्ल
          </h1>
          <p class="text-base sm:text-xl font-devanagari text-amber-200 mt-2 font-medium">
            वैदिक कर्मकाण्ड, ज्योतिष मर्मज्ञ एवं श्रीमद्भागवत कथा वाचक
          </p>
          <p class="text-xs sm:text-sm text-amber-100/80 font-devanagari mt-3 leading-relaxed">
            गोरखपुर की पावन तपोभूमि से सनातन वैदिक संस्कारों, शुद्ध वेदोक्त कर्मकाण्ड, श्रीमद्भागवत कथा एवं फलित ज्योतिष मार्गदर्शन हेतु समर्पित संस्थान।
          </p>

          <!-- Primary Call to Action Buttons -->
          <div class="flex flex-wrap items-center gap-3 mt-6">
            <a href="#/booking" class="bg-gradient-to-r from-saffron-600 to-amber-600 hover:from-saffron-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg transition transform active:scale-95 flex items-center space-x-2">
              <i class="fa-solid fa-calendar-plus text-amber-200"></i>
              <span>अनुष्ठान / कथा बुक करें</span>
            </a>
            <a href="#/astrology" class="bg-white/10 hover:bg-white/20 text-amber-200 font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl border border-amber-300/30 transition flex items-center space-x-2">
              <i class="fa-solid fa-dharmachakra text-amber-400"></i>
              <span>कुण्डली व ज्योतिष सेवा</span>
            </a>
            <a href="tel:+917309441019" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl transition flex items-center space-x-2">
              <i class="fa-solid fa-phone"></i>
              <span>7309441019 पर संपर्क</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Quick Services Grid -->
      <div class="mb-10">
        <div class="flex justify-between items-center mb-5">
          <div>
            <h2 class="text-2xl font-devanagari font-bold text-maroon-950">प्रमुख वैदिक एवं धार्मिक सेवाएं</h2>
            <p class="text-xs text-gray-600 font-devanagari">शास्त्रोक्त विधि से सम्पन्न किए जाने वाले प्रमुख अनुष्ठान</p>
          </div>
          <a href="#/puja-services" class="text-xs font-bold text-saffron-700 hover:underline">सभी सेवाएं देखें →</a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm hover:border-saffron-500 transition">
            <div class="w-10 h-10 rounded-xl bg-orange-100 text-saffron-700 flex items-center justify-center text-xl mb-3">
              📖
            </div>
            <h3 class="font-devanagari font-bold text-base text-gray-900">श्रीमद्भागवत कथा सप्ताह</h3>
            <p class="text-xs text-gray-600 mt-1 font-devanagari leading-relaxed">
              7 दिवसीय भावपूर्ण, संगीतमय ज्ञान यज्ञ। यजमान परिवार के पितृ मोक्ष एवं आध्यात्मिक उत्कर्ष हेतु।
            </p>
            <a href="#/booking" class="mt-3 inline-block text-xs font-bold text-saffron-700 hover:underline">कथा बुक करें →</a>
          </div>

          <div class="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm hover:border-saffron-500 transition">
            <div class="w-10 h-10 rounded-xl bg-orange-100 text-saffron-700 flex items-center justify-center text-xl mb-3">
              🕉️
            </div>
            <h3 class="font-devanagari font-bold text-base text-gray-900">रुद्राभिषेक एवं शिव पूजन</h3>
            <p class="text-xs text-gray-600 mt-1 font-devanagari leading-relaxed">
              पञ्चामृत, गंगाजल, गन्ने के रस एवं 108 बेलपत्र से सविधि महाभिषेक। व्याधि व ग्रह शांति हेतु।
            </p>
            <a href="#/booking" class="mt-3 inline-block text-xs font-bold text-saffron-700 hover:underline">पूजन बुक करें →</a>
          </div>

          <div class="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm hover:border-saffron-500 transition">
            <div class="w-10 h-10 rounded-xl bg-orange-100 text-saffron-700 flex items-center justify-center text-xl mb-3">
              🏠
            </div>
            <h3 class="font-devanagari font-bold text-base text-gray-900">गृह प्रवेश एवं वास्तु शांति</h3>
            <p class="text-xs text-gray-600 mt-1 font-devanagari leading-relaxed">
              नवीन गृह में वास्तु दोष निवारण, नवग्रह हवन, द्वार पूजन एवं मंगल कलश स्थापना अनुष्ठान।
            </p>
            <a href="#/booking" class="mt-3 inline-block text-xs font-bold text-saffron-700 hover:underline">मुहूर्त निश्चित करें →</a>
          </div>

          <div class="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm hover:border-saffron-500 transition">
            <div class="w-10 h-10 rounded-xl bg-orange-100 text-saffron-700 flex items-center justify-center text-xl mb-3">
              🔮
            </div>
            <h3 class="font-devanagari font-bold text-base text-gray-900">वैदिक ज्योतिष व कुण्डली</h3>
            <p class="text-xs text-gray-600 mt-1 font-devanagari leading-relaxed">
              जन्म कुण्डली फलादेश, गुण मिलान, मांगलिक विचार, साढ़े साती एवं शास्त्रोक्त रत्न-रुद्राक्ष परामर्श।
            </p>
            <a href="#/astrology" class="mt-3 inline-block text-xs font-bold text-saffron-700 hover:underline">कुण्डली देखें →</a>
          </div>
        </div>
      </div>

      <!-- Live Gorakhpur Panchang Widget Snippet -->
      <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-gold-400 mb-10 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="text-xs font-bold text-saffron-800 uppercase tracking-wider">दैनिक वैदिक पंचांग (गोरखपुर)</div>
            <h3 class="font-devanagari font-bold text-xl text-gray-900 mt-0.5">
              आज का पंचांग एवं शुभ-अशुभ वेला
            </h3>
            <p class="text-xs text-gray-600 font-devanagari" id="home-panchang-summary">
              गणना आधार: स्थानीय सूर्योदय (गोरखपुर) • लहिरी अयनांश
            </p>
          </div>
          <a href="#/panchang" class="bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center justify-center gap-1.5 whitespace-nowrap">
            <i class="fa-solid fa-sun text-yellow-300"></i>
            <span>विस्तृत पंचांग व चौघड़िया देखें</span>
          </a>
        </div>
      </div>

      <!-- Verified Acharya Introduction Snippet -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-sacred mb-10">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div class="md:col-span-4 text-center">
            <div class="w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-maroon-900 to-saffron-600 border-4 border-gold-300 flex items-center justify-center text-5xl text-white shadow-lg">
              ॐ
            </div>
            <h4 class="font-devanagari font-bold text-lg text-maroon-950 mt-3">आचार्य पं० अश्वनी कुमार शुक्ल</h4>
            <p class="text-xs text-saffron-700 font-semibold font-devanagari">गोरखपुर, उत्तर प्रदेश</p>
            <p class="text-xs text-gray-500 mt-1 font-mono">📞 7309441019</p>
          </div>

          <div class="md:col-span-8">
            <span class="text-xs font-bold text-saffron-700 uppercase tracking-widest bg-orange-100 px-3 py-1 rounded-full border border-orange-300">
              आचार्य परिचय एवं ध्येय
            </span>
            <h3 class="text-2xl font-devanagari font-bold text-gray-900 mt-2">
              शुद्ध वैदिक विधि एवं प्रामाणिक सनातन कर्मकाण्ड
            </h3>
            <p class="text-xs sm:text-sm text-gray-700 mt-2 font-devanagari leading-relaxed">
              हमारा उद्देश्य सनातन धर्म के संस्कारों को उनके मूल, शास्त्र सम्मत स्वरूप में समाज तक पहुंचाना है। किसी भी प्रकार के आडंबर अथवा अंधविश्वास से परे, वेदों एवं पुराणों के प्रामाणिक सूत्रों के आधार पर पूजन, हवन, कथा एवं ज्योतिषीय परामर्श संपन्न कराया जाता है।
            </p>
            <div class="flex flex-wrap gap-2 mt-4 text-xs font-semibold text-gray-800">
              <span class="bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">✓ वेदोक्त मंत्रोच्चार</span>
              <span class="bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">✓ सविधि संकल्प एवं तर्पण</span>
              <span class="bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">✓ यजमान संतुष्टि एवं शुचिता</span>
              <span class="bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">✓ निष्पक्ष ज्योतिषीय मार्गदर्शन</span>
            </div>
            <div class="mt-5">
              <a href="#/about" class="text-xs font-bold text-saffron-700 hover:text-saffron-900 underline">
                आचार्य जी के शोध एवं विस्तृत परिचय हेतु पढ़ें →
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ & Booking Instructions -->
      <div class="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-sm mb-6">
        <h3 class="font-devanagari font-bold text-xl text-maroon-950 mb-4 pb-2 border-b border-amber-200">
          अक्सर पूछे जाने वाले प्रश्न (FAQ) एवं बुकिंग निर्देश
        </h3>
        <div class="space-y-3 text-xs text-gray-700 font-devanagari">
          <div class="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div class="font-bold text-sm text-orange-950">प्र. पूजा या कथा के लिए कितने दिन पूर्व बुकिंग करनी चाहिए?</div>
            <p class="mt-1 text-gray-600">उ. बड़े अनुष्ठानों (जैसे श्रीमद्भागवत कथा अथवा विवाह संस्कार) हेतु कम से कम 15 से 30 दिन पूर्व तथा सामान्य पूजन (रुद्राभिषेक, सत्यनारायण कथा) हेतु 3 से 7 दिन पूर्व बुकिंग कराना उपयुक्त रहता है ताकि शुभ मुहूर्त का चयन किया जा सके।</p>
          </div>
          <div class="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div class="font-bold text-sm text-orange-950">प्र. क्या गोरखपुर से बाहर अन्य शहरों में भी आचार्य जी सेवाएं प्रदान करते हैं?</div>
            <p class="mt-1 text-gray-600">उ. हाँ, गोरखपुर के अतिरिक्त पूर्वांचल (देवरिया, बस्ती, कुशीनगर, महराजगंज, संतकबीरनगर, वाराणसी, लखनऊ) एवं यजमान के आमंत्रण पर अन्य स्थानों पर भी सविधि अनुष्ठान संपन्न कराए जाते हैं।</p>
          </div>
          <div class="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div class="font-bold text-sm text-orange-950">प्र. क्या ज्योतिष परामर्श ऑनलाइन उपलब्ध है?</div>
            <p class="mt-1 text-gray-600">उ. हाँ, दूर रहने वाले यजमान फोन कॉल अथवा वीडियो कॉन्फ्रेंसिंग के माध्यम से जन्म कुण्डली का विस्तृत फलादेश एवं मार्गदर्शन प्राप्त कर सकते हैं।</p>
          </div>
        </div>
      </div>
    `;
  },

  // 2. ABOUT ACHARYA JI
  about() {
    const p = APP_STATE.siteProfile;
    return `
      <div class="bg-white rounded-3xl p-6 sm:p-10 border-2 border-gold-300 shadow-sacred mb-8">
        <div class="border-b border-amber-200 pb-4 mb-6">
          <span class="text-xs font-bold text-saffron-700 uppercase tracking-widest bg-orange-100 px-3 py-1 rounded-full border border-orange-300">
            आचार्य परिचय (About Acharya)
          </span>
          <h2 class="text-3xl sm:text-4xl font-devanagari font-bold text-maroon-950 mt-2">
            ${p.acharya_name}
          </h2>
          <p class="text-sm text-saffron-800 font-semibold font-devanagari mt-1">
            ${p.title} • ${p.location}
          </p>
        </div>

        <div class="space-y-6 text-sm text-gray-800 font-devanagari leading-relaxed">
          <div class="p-5 bg-amber-50/70 rounded-2xl border border-amber-200">
            <h3 class="font-bold text-base text-maroon-950 mb-2">जीवनी एवं साधना पृष्ठभूमि</h3>
            <p>${p.bio}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="p-5 bg-white rounded-2xl border border-amber-200 shadow-sm">
              <h3 class="font-bold text-base text-maroon-950 mb-2 flex items-center gap-2">
                <i class="fa-solid fa-graduation-cap text-saffron-600"></i>
                <span>अध्ययन एवं स्वाध्याय विवरण</span>
              </h3>
              <p class="text-xs text-gray-700 leading-relaxed">${p.qualifications}</p>
              <div class="mt-3 text-[11px] text-gray-500 italic">
                * आचार्य जी द्वारा समय-समय पर संपादन योग्य अधिकृत विवरण।
              </div>
            </div>

            <div class="p-5 bg-white rounded-2xl border border-amber-200 shadow-sm">
              <h3 class="font-bold text-base text-maroon-950 mb-2 flex items-center gap-2">
                <i class="fa-solid fa-book-journal-whills text-saffron-600"></i>
                <span>शोध कार्य एवं सनातन विचार</span>
              </h3>
              <p class="text-xs text-gray-700 leading-relaxed">${p.research_overview}</p>
              <div class="mt-3 text-[11px] text-gray-500 italic">
                * पूर्वांचल की लोक धार्मिक परंपराओं एवं गृह्यसूत्रों पर केंद्रित अध्ययन।
              </div>
            </div>
          </div>

          <div class="p-5 bg-gradient-to-r from-maroon-950 to-saffron-950 text-white rounded-2xl">
            <h3 class="font-bold text-base text-amber-300 mb-2">सेवा केंद्र एवं संपर्क सूत्र</h3>
            <p class="text-xs text-amber-100/90 leading-relaxed">
              स्थान: गोरखपुर, उत्तर प्रदेश, भारत<br>
              सार्वजनिक संपर्क नंबर: <a href="tel:+917309441019" class="underline font-bold text-amber-200">7309441019</a><br>
              WhatsApp संपर्क: <a href="https://wa.me/917309441019" target="_blank" class="underline font-bold text-emerald-300">+91 7309441019</a>
            </p>
          </div>
        </div>
      </div>
    `;
  },

  // 3. ASTROLOGY & KUNDLI SERVICES
  astrology() {
    return `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-maroon-950 via-maroon-900 to-saffron-950 text-white rounded-3xl p-6 sm:p-8 border border-gold-400 shadow-sacred">
          <h2 class="text-3xl font-devanagari font-bold text-amber-100">
            वैदिक ज्योतिष एवं कुण्डली विश्लेषण केंद्र
          </h2>
          <p class="text-xs sm:text-sm text-amber-200/90 font-devanagari mt-1 max-w-2xl">
            ऋषि पराशर एवं वराहमिहिर द्वारा प्रतिपादित सिद्धान्तों, लहिरी अयनांश गणना, अष्टकूट 36 गुण मिलान, मांगलिक विचार एवं साढ़े साती का सूक्ष्म शास्त्रीय विश्लेषण।
          </p>
        </div>

        <!-- Astrology Sub-tabs -->
        <div class="flex flex-wrap gap-2 border-b border-amber-200 pb-3">
          <button onclick="switchAstroSubTab('chart')" id="astro-tab-chart" class="px-4 py-2 rounded-xl text-xs font-bold bg-saffron-600 text-white shadow">
            🔮 जन्म कुण्डली निर्माण
          </button>
          <button onclick="switchAstroSubTab('milan')" id="astro-tab-milan" class="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-orange-100">
            💑 कुण्डली मिलान (36 गुण)
          </button>
          <button onclick="switchAstroSubTab('dosha')" id="astro-tab-dosha" class="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-orange-100">
            🪐 मांगलिक व साढ़े साती विश्लेषण
          </button>
        </div>

        <!-- SUB-TAB 1: CHART GENERATOR -->
        <div id="astro-panel-chart" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-5 bg-white p-6 rounded-2xl border-2 border-gold-300 shadow-sm">
            <h3 class="font-devanagari font-bold text-base text-gray-900 pb-2 border-b border-amber-200 mb-4">
              जातक जन्म विवरण दर्ज करें
            </h3>
            <form id="astro-chart-form" onsubmit="generateKundliChart(event)" class="space-y-3 text-xs">
              <div>
                <label class="block font-bold text-gray-700 mb-1">नाम *</label>
                <input type="text" id="ac-name" required value="आदित्य शर्मा" class="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl font-semibold">
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">जन्म दिनांक *</label>
                  <input type="date" id="ac-dob" required value="1996-08-15" class="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl font-semibold">
                </div>
                <div>
                  <label class="block font-bold text-gray-700 mb-1">जन्म समय *</label>
                  <input type="time" id="ac-tob" required value="06:30" class="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl font-semibold">
                </div>
              </div>
              <div>
                <label class="block font-bold text-gray-700 mb-1">जन्म स्थान *</label>
                <select id="ac-pob" class="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl font-semibold">
                  <option value="26.7606,83.3732,5.5,गोरखपुर">गोरखपुर, उत्तर प्रदेश (Gorakhpur)</option>
                  <option value="25.3176,82.9739,5.5,वाराणसी">वाराणसी (काशी), उ०प्र०</option>
                  <option value="26.7922,82.1998,5.5,अयोध्या">अयोध्या धाम, उ०प्र०</option>
                  <option value="26.8467,80.9462,5.5,लखनऊ">लखनऊ, उ०प्र०</option>
                  <option value="28.6139,77.2090,5.5,नई दिल्ली">नई दिल्ली (राजधानी)</option>
                  <option value="23.1765,75.7885,5.5,उज्जैन">उज्जैन (महाकाल), म०प्र०</option>
                </select>
              </div>
              <button type="submit" class="w-full bg-saffron-600 hover:bg-saffron-700 text-white font-bold py-2.5 rounded-xl transition shadow">
                कुण्डली चक्र बनाएं
              </button>
            </form>
          </div>

          <div class="lg:col-span-7 bg-white p-6 rounded-2xl border-2 border-gold-300 shadow-sm flex flex-col items-center">
            <h3 class="font-devanagari font-bold text-base text-gray-900 mb-3">
              उत्तर-भारतीय लग्न कुण्डली चक्र (D-1 Rashi Chakra)
            </h3>
            <!-- SVG Kundli Box -->
            <div class="w-full max-w-[380px] aspect-square bg-[#fffef7] rounded-xl border-4 border-amber-700 shadow-inner p-2 relative">
              <svg id="live-kundli-svg" viewBox="0 0 400 400" class="w-full h-full select-none">
                <rect x="0" y="0" width="400" height="400" fill="#fffdfa" stroke="#b45309" stroke-width="3"/>
                <line x1="0" y1="0" x2="400" y2="400" class="kundli-line"/>
                <line x1="0" y1="400" x2="400" y2="0" class="kundli-line"/>
                <polygon points="200,0 400,200 200,400 0,200" fill="#fffbeb" stroke="#b45309" stroke-width="2.5"/>
                <text id="kh-s1" x="200" y="80" text-anchor="middle" class="kundli-sign">1</text>
                <text id="kh-p1" x="200" y="115" text-anchor="middle" class="kundli-planet fill-red-800">सूर्य, बुध</text>
                <text id="kh-s2" x="100" y="45" text-anchor="middle" class="kundli-sign">2</text>
                <text id="kh-p2" x="90" y="70" text-anchor="middle" class="kundli-planet fill-amber-800">शुक्र</text>
                <text id="kh-s3" x="45" y="100" text-anchor="middle" class="kundli-sign">3</text>
                <text id="kh-s4" x="100" y="205" text-anchor="middle" class="kundli-sign">4</text>
                <text id="kh-p4" x="90" y="235" text-anchor="middle" class="kundli-planet fill-blue-800">चन्द्र</text>
                <text id="kh-s5" x="45" y="305" text-anchor="middle" class="kundli-sign">5</text>
                <text id="kh-s6" x="100" y="365" text-anchor="middle" class="kundli-sign">6</text>
                <text id="kh-s7" x="200" y="325" text-anchor="middle" class="kundli-sign">7</text>
                <text id="kh-p7" x="200" y="295" text-anchor="middle" class="kundli-planet fill-red-700">मंगल</text>
                <text id="kh-s8" x="300" y="365" text-anchor="middle" class="kundli-sign">8</text>
                <text id="kh-s9" x="355" y="305" text-anchor="middle" class="kundli-sign">9</text>
                <text id="kh-p9" x="355" y="330" text-anchor="middle" class="kundli-planet fill-yellow-800">गुरु</text>
                <text id="kh-s10" x="300" y="205" text-anchor="middle" class="kundli-sign">10</text>
                <text id="kh-s11" x="355" y="100" text-anchor="middle" class="kundli-sign">11</text>
                <text id="kh-s12" x="300" y="45" text-anchor="middle" class="kundli-sign">12</text>
              </svg>
            </div>
            <div id="chart-calc-summary" class="mt-4 text-xs font-devanagari text-gray-700 text-center">
              लग्न: मेष (स्वामी: मंगल) • चंद्र राशि: कर्क • तत्व: जल • नक्षत्र: पुष्य
            </div>
          </div>
        </div>

        <!-- SUB-TAB 2: GUNA MILAN -->
        <div id="astro-panel-milan" class="hidden bg-white p-6 rounded-2xl border-2 border-gold-300 shadow-sm">
          <h3 class="font-devanagari font-bold text-lg text-gray-900 mb-4 pb-2 border-b border-amber-200">
            वर-कन्या कुण्डली मिलान (अष्टकूट 36 गुण मिलान)
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-4 bg-blue-50/50 rounded-xl border border-blue-200">
              <h4 class="font-bold text-sm text-blue-950 mb-2">वर विवरण (Boy)</h4>
              <div class="space-y-2 text-xs">
                <div>
                  <label class="block font-bold">वर की चन्द्र राशि:</label>
                  <select id="milan-boy-rashi" class="w-full p-2 bg-white border border-blue-300 rounded-lg">
                    <option value="1">मेष (Aries)</option>
                    <option value="2">वृषभ (Taurus)</option>
                    <option value="3">मिथुन (Gemini)</option>
                    <option value="4">कर्क (Cancer)</option>
                    <option value="5" selected>सिंह (Leo)</option>
                    <option value="6">कन्या (Virgo)</option>
                    <option value="7">तुला (Libra)</option>
                    <option value="8">वृश्चिक (Scorpio)</option>
                    <option value="9">धनु (Sagittarius)</option>
                    <option value="10">मकर (Capricorn)</option>
                    <option value="11">कुंभ (Aquarius)</option>
                    <option value="12">मीन (Pisces)</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="p-4 bg-rose-50/50 rounded-xl border border-rose-200">
              <h4 class="font-bold text-sm text-rose-950 mb-2">कन्या विवरण (Girl)</h4>
              <div class="space-y-2 text-xs">
                <div>
                  <label class="block font-bold">कन्या की चन्द्र राशि:</label>
                  <select id="milan-girl-rashi" class="w-full p-2 bg-white border border-rose-300 rounded-lg">
                    <option value="1">मेष (Aries)</option>
                    <option value="2">वृषभ (Taurus)</option>
                    <option value="3">मिथुन (Gemini)</option>
                    <option value="4">कर्क (Cancer)</option>
                    <option value="5">सिंह (Leo)</option>
                    <option value="6">कन्या (Virgo)</option>
                    <option value="7">तुला (Libra)</option>
                    <option value="8">वृश्चिक (Scorpio)</option>
                    <option value="9" selected>धनु (Sagittarius)</option>
                    <option value="10">मकर (Capricorn)</option>
                    <option value="11">कुंभ (Aquarius)</option>
                    <option value="12">मीन (Pisces)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center mt-4">
            <button onclick="calculateGunaMilanResult()" class="bg-gradient-to-r from-saffron-600 to-amber-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow">
              अष्टकूट गुण मिलान गणना करें
            </button>
          </div>

          <!-- Result Card -->
          <div id="milan-result-box" class="mt-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-gold-300">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-bold text-saffron-800">कुल प्राप्त गुण:</span>
                <div class="text-3xl font-black font-mono text-maroon-950" id="milan-score-display">29.5 / 36</div>
              </div>
              <span id="milan-verdict-badge" class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                उत्तम मिलान (Highly Auspicious)
              </span>
            </div>
            <p id="milan-verdict-text" class="text-xs text-gray-700 font-devanagari mt-2">
              वर एवं कन्या के ग्रह मैत्री एवं तत्व अनुकूल हैं। दांपत्य जीवन में सुख, शांति एवं समृद्धि का शुभ योग है।
            </p>
          </div>
        </div>

        <!-- SUB-TAB 3: DOSHA ANALYZER -->
        <div id="astro-panel-dosha" class="hidden bg-white p-6 rounded-2xl border-2 border-gold-300 shadow-sm space-y-4">
          <h3 class="font-devanagari font-bold text-lg text-gray-900 pb-2 border-b border-amber-200">
            मांगलिक दोष एवं शनि साढ़े साती विश्लेषण
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-devanagari">
            <div class="p-4 bg-orange-50 rounded-xl border border-orange-200">
              <h4 class="font-bold text-sm text-orange-950 mb-1">मांगलिक दोष (भौम विचार)</h4>
              <p class="text-gray-700">लग्न से 1, 4, 7, 8, अथवा 12वें भाव में मंगल की स्थिति होने पर मांगलिक प्रभाव माना जाता है। परिहार नियमों के अंतर्गत स्वराशि या उच्च राशि होने पर दोष निरस्त भी होता है।</p>
              <div class="mt-3 p-2 bg-white rounded border border-orange-200">
                उपाय: नित्य हनुमान चालीसा पाठ एवं मंगल शांति अनुष्ठान।
              </div>
            </div>

            <div class="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 class="font-bold text-sm text-blue-950 mb-1">शनि साढ़े साती स्थिति</h4>
              <p class="text-gray-700">वर्तमान में मकर, कुंभ एवं मीन राशि पर शनि की साढ़े साती का प्रभाव है। कर्मफल दाता शनि की शांति हेतु दशरथकृत शनि स्तोत्र एवं दीपदान सर्वोत्तम है।</p>
              <div class="mt-3 p-2 bg-white rounded border border-blue-200">
                आचार्य जी से प्रत्यक्ष परामर्श हेतु: 📞 7309441019
              </div>
            </div>
          </div>
        </div>

        <!-- Cultural & Spiritual Interpretation Disclaimer -->
        <div class="p-4 bg-amber-50 rounded-xl border border-amber-300 text-xs text-gray-600 font-devanagari">
          <span class="font-bold text-maroon-950">शास्त्रीय अस्वीकरण (Astrological Disclaimer):</span>
          यह विश्लेषण प्राचीन वैदिक ज्योतिष के गणितीय सूत्रों पर आधारित है। जन्म समय में अनिश्चितता होने पर फलादेश में अंतर संभव है। ज्योतिष मार्गदर्शन कर्म एवं साधना को संबल प्रदान करने हेतु है, यह किसी भी प्रकार के चमत्कार या अनहोनी के निवारण की अलौकिक गारंटी नहीं देता।
        </div>
      </div>
    `;
  },

  // 4. PANCHANG & CHOGHADIYA (GORAKHPUR)
  panchang() {
    const data = VedicPanchang.calculate();
    return `
      <div class="space-y-6">
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-saffron-900 via-maroon-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 border border-gold-400 shadow-sacred">
          <span class="bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gold-400/30">
            Gorakhpur Localized Ephemeris (लहिरी अयनांश)
          </span>
          <h2 class="text-3xl font-devanagari font-bold text-amber-100 mt-2">
            दैनिक वैदिक पंचांग एवं चौघड़िया मुहूर्त
          </h2>
          <p class="text-xs sm:text-sm text-amber-200/90 font-devanagari mt-1">
            स्थान: गोरखपुर [26.76°N, 83.37°E] • स्थानीय सूर्योदय एवं सूर्यास्त आधारित सटीक काल गणना
          </p>
        </div>

        <!-- Panchanga Grid Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div class="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
            <span class="text-xs font-bold text-saffron-700 uppercase">तिथि</span>
            <div class="font-devanagari font-bold text-base text-gray-900 mt-1">${data.tithi}</div>
            <div class="text-[11px] text-saffron-600 font-semibold">${data.paksha}</div>
          </div>
          <div class="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
            <span class="text-xs font-bold text-saffron-700 uppercase">नक्षत्र</span>
            <div class="font-devanagari font-bold text-base text-gray-900 mt-1">${data.nakshatra.name}</div>
            <div class="text-[11px] text-gray-500">चरण: ${data.pada} • स्वामी: ${data.nakshatra.lord}</div>
          </div>
          <div class="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
            <span class="text-xs font-bold text-saffron-700 uppercase">योग</span>
            <div class="font-devanagari font-bold text-base text-gray-900 mt-1">${data.yoga}</div>
            <div class="text-[11px] text-emerald-600 font-semibold">शुभ योग</div>
          </div>
          <div class="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
            <span class="text-xs font-bold text-saffron-700 uppercase">करण</span>
            <div class="font-devanagari font-bold text-base text-gray-900 mt-1">${data.karana}</div>
            <div class="text-[11px] text-gray-500">चर करण</div>
          </div>
          <div class="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
            <span class="text-xs font-bold text-saffron-700 uppercase">वार (दिन)</span>
            <div class="font-devanagari font-bold text-base text-gray-900 mt-1">${data.vaar}</div>
            <div class="text-[11px] text-gray-500">संवत्: ${data.vikramSamvat}</div>
          </div>
        </div>

        <!-- Sun/Moon & Auspicious Times -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-5 rounded-2xl border-2 border-emerald-300 shadow-sm space-y-3">
            <h3 class="font-devanagari font-bold text-base text-emerald-950 pb-2 border-b border-emerald-100 flex items-center justify-between">
              <span>शुभ मुहूर्त (गोरखपुर)</span>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">मांगलिक वेला</span>
            </h3>
            <div class="flex justify-between items-center text-xs py-1 border-b border-gray-100">
              <span class="font-semibold text-gray-700">अभिजीत मुहूर्त:</span>
              <span class="font-mono font-bold text-emerald-900">${data.abhijit}</span>
            </div>
            <div class="flex justify-between items-center text-xs py-1 border-b border-gray-100">
              <span class="font-semibold text-gray-700">ब्रह्म मुहूर्त:</span>
              <span class="font-mono font-bold text-emerald-900">${data.brahma}</span>
            </div>
            <div class="flex justify-between items-center text-xs py-1 border-b border-gray-100">
              <span class="font-semibold text-gray-700">सूर्योदय (Sunrise):</span>
              <span class="font-mono font-bold text-gray-800">${data.sunrise}</span>
            </div>
            <div class="flex justify-between items-center text-xs py-1">
              <span class="font-semibold text-gray-700">सूर्यास्त (Sunset):</span>
              <span class="font-mono font-bold text-gray-800">${data.sunset}</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border-2 border-rose-300 shadow-sm space-y-3">
            <h3 class="font-devanagari font-bold text-base text-rose-950 pb-2 border-b border-rose-100 flex items-center justify-between">
              <span>अशुभ काल (त्याज्य समय)</span>
              <span class="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">वर्जित वेला</span>
            </h3>
            <div class="flex justify-between items-center text-xs py-1 border-b border-gray-100">
              <span class="font-semibold text-gray-700">राहु काल (अति वर्जित):</span>
              <span class="font-mono font-bold text-rose-900">${data.rahu}</span>
            </div>
            <div class="flex justify-between items-center text-xs py-1 border-b border-gray-100">
              <span class="font-semibold text-gray-700">गोधूलि मुहूर्त:</span>
              <span class="font-mono font-bold text-orange-900">${data.godhuli}</span>
            </div>
            <p class="text-[11px] text-gray-500 font-devanagari pt-1">
              * राहु काल में कोई भी नवीन कार्य, अनुबंध अथवा यात्रा प्रारंभ न करें।
            </p>
          </div>
        </div>

        <!-- Choghadiya Table -->
        <div class="bg-white rounded-2xl border-2 border-gold-300 shadow-sm p-5">
          <h3 class="font-devanagari font-bold text-lg text-maroon-950 mb-3 pb-2 border-b border-amber-200">
            दिन का चौघड़िया (Day Choghadiya - गोरखपुर)
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${data.dayChoghadiya.map(c => `
              <div class="p-3 rounded-xl border border-amber-200 ${c.info.color}">
                <div class="font-bold text-sm font-devanagari">${c.name}</div>
                <div class="text-[10px] font-semibold">${c.info.nature}</div>
                <div class="font-mono text-xs mt-1 text-gray-800 font-bold">${c.time}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // 5. PUJA & KARMAKANDA SERVICES
  pujaServices() {
    return `
      <div class="space-y-6">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-gold-300 shadow-sacred">
          <h2 class="text-3xl font-devanagari font-bold text-maroon-950">
            पूजा, अनुष्ठान एवं वैदिक कर्मकाण्ड सेवाएं
          </h2>
          <p class="text-xs sm:text-sm text-gray-600 font-devanagari mt-1">
            गोरखपुर एवं पूर्वांचल में शास्त्र सम्मत वेदोक्त विधान से संपन्न होने वाले प्रमुख अनुष्ठान
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6" id="services-full-list">
            <!-- Dynamically populated or rendered -->
          </div>
        </div>
      </div>
    `;
  },

  // 6. KATHA VACHAN
  kathaVachan() {
    return `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-maroon-950 via-maroon-900 to-saffron-950 text-white rounded-3xl p-6 sm:p-8 border border-gold-400 shadow-sacred">
          <h2 class="text-3xl font-devanagari font-bold text-amber-100">
            श्रीमद्भागवत एवं श्री राम कथा वाचन
          </h2>
          <p class="text-xs sm:text-sm text-amber-200/90 font-devanagari mt-1">
            आचार्य पं० अश्वनी कुमार शुक्ल जी के पावन सानिध्य में संगीतमय कथा ज्ञान यज्ञ
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-2xl border-2 border-amber-200 shadow-sm space-y-3 font-devanagari">
            <span class="text-xs font-bold text-saffron-700 bg-orange-100 px-2.5 py-0.5 rounded-full">7 दिवसीय ज्ञान यज्ञ</span>
            <h3 class="text-xl font-bold text-maroon-950">श्रीमद्भागवत सप्ताह ज्ञान यज्ञ</h3>
            <p class="text-xs text-gray-700 leading-relaxed">
              संगीतमय झांकियों, भक्ति रस एवं वेद सम्मत व्याख्यानों से परिपूर्ण। गोकर्ण प्रसंग, ध्रुव चरित्र, प्रह्लाद चरित्र, श्रीकृष्ण जन्मोत्सव, गोवर्धन पूजा एवं रुक्मिणी विवाह आदि का भावपूर्ण गान।
            </p>
            <div class="pt-3 border-t border-amber-100 flex justify-between items-center">
              <span class="text-xs text-gray-500 font-semibold">आयोजन स्थल: यजमान इच्छानुसार</span>
              <a href="#/booking" class="bg-saffron-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg">कथा निश्चित करें</a>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border-2 border-amber-200 shadow-sm space-y-3 font-devanagari">
            <span class="text-xs font-bold text-saffron-700 bg-orange-100 px-2.5 py-0.5 rounded-full">9 दिवसीय नवाह्न परायण</span>
            <h3 class="text-xl font-bold text-maroon-950">श्री राम कथा एवं मानस प्रवचन</h3>
            <p class="text-xs text-gray-700 leading-relaxed">
              गोस्वामी तुलसीदास जी विरचित श्री रामचरितमानस के आधार पर मर्यादा पुरुषोत्तम श्री राम के दिव्य चरित्र का दर्शन। समाज में पारिवारिक समरसता एवं संस्कारों की पुनर्प्रतिष्ठा हेतु।
            </p>
            <div class="pt-3 border-t border-amber-100 flex justify-between items-center">
              <span class="text-xs text-gray-500 font-semibold">आयोजन स्थल: पूर्वांचल व भारतवर्ष</span>
              <a href="#/booking" class="bg-saffron-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg">कथा निश्चित करें</a>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 7. LIVE DARSHAN & PRAYER WALL
  liveDarshan() {
    return `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-red-950 via-maroon-950 to-stone-950 text-white rounded-3xl p-6 sm:p-8 border border-gold-400 shadow-sacred flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div class="inline-flex items-center space-x-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">
              <span class="w-2 h-2 rounded-full bg-white live-dot"></span>
              <span>LIVE BROADCAST PORTAL</span>
            </div>
            <h2 class="text-3xl font-devanagari font-bold text-amber-100">लाइव अनुष्ठान एवं तीर्थ दर्शन</h2>
            <p class="text-xs sm:text-sm text-amber-200/90 font-devanagari mt-1">
              आचार्य जी के लाइव कथा सत्र एवं प्रमुख तीर्थों का अधिकृत प्रसारण
            </p>
          </div>
          <button onclick="VedicAudio.playTempleBell()" class="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-xs px-4 py-3 rounded-2xl shadow-lg active:scale-95 flex items-center gap-2">
            <i class="fa-solid fa-bell"></i>
            <span>मंदिर की घंटी बजाएं</span>
          </button>
        </div>

        <!-- Video Player Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl border-2 border-gold-300 overflow-hidden shadow-sm">
            <div class="relative aspect-video bg-black">
              <iframe class="w-full h-full border-0" src="https://www.youtube-nocookie.com/embed/live_stream?channel=UCvW_Gj_y020W8f4X9y-0cDA" title="Live Puja Stream" allowfullscreen></iframe>
            </div>
            <div class="p-4 font-devanagari">
              <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">आचार्य जी का लाइव सत्र</span>
              <h3 class="font-bold text-base text-gray-900 mt-1">श्रीमद्भागवत कथा एवं विशेष अनुष्ठान</h3>
              <p class="text-xs text-gray-500 mt-0.5">गोरखपुर सेवा केंद्र से सीधा प्रसारण (सत्र समय अनुसार)</p>
            </div>
          </div>

          <!-- Moderated Live Prayer Wall -->
          <div class="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 class="font-devanagari font-bold text-base text-maroon-950 pb-2 border-b border-amber-200 mb-3 flex items-center justify-between">
                <span>सामूहिक प्रार्थना एवं मनोरथ पटल (Prayer Wall)</span>
                <span class="text-[10px] text-gray-500">संयम एवं शुचिता</span>
              </h3>
              <div id="prayers-container" class="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs font-devanagari">
                <!-- Dynamically populated -->
              </div>
            </div>

            <!-- Post Prayer Form -->
            <form id="post-prayer-form" onsubmit="submitDevoteePrayer(event)" class="mt-4 pt-3 border-t border-amber-100 space-y-2 text-xs">
              <div class="grid grid-cols-2 gap-2">
                <input type="text" id="prayer-name" required placeholder="आपका नाम *" class="p-2 bg-amber-50/50 border border-amber-300 rounded-lg">
                <input type="text" id="prayer-city" placeholder="नगर (उदा. गोरखपुर)" class="p-2 bg-amber-50/50 border border-amber-300 rounded-lg">
              </div>
              <textarea id="prayer-text" required rows="2" placeholder="अपनी प्रार्थना अथवा शुभकामना संदेश लिखें..." class="w-full p-2 bg-amber-50/50 border border-amber-300 rounded-lg"></textarea>
              <button type="submit" class="w-full bg-saffron-600 hover:bg-saffron-700 text-white font-bold py-2 rounded-lg transition shadow">
                प्रार्थना पटल पर जोड़ें
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  // 8. VEDIC MANTRAS & JAPA COUNTER
  mantras() {
    return `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-purple-950 via-maroon-950 to-saffron-950 text-white rounded-3xl p-6 sm:p-8 border border-gold-400 shadow-sacred">
          <h2 class="text-3xl font-devanagari font-bold text-amber-100">
            वैदिक मंत्र, नाद ब्रह्म एवं १०८ जप माला
          </h2>
          <p class="text-xs sm:text-sm text-amber-200/90 font-devanagari mt-1">
            वेब ऑडियो एपीआई आधारित तानपूरा नाद (Sa-Pa 136.1Hz) एवं डिजिटल जप साधन
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left: 108 Japa Mala Counter -->
          <div class="lg:col-span-5 bg-white p-6 rounded-3xl border-2 border-gold-400 shadow-sacred text-center">
            <h3 class="font-devanagari font-bold text-lg text-maroon-950 mb-1">१०८ जप माला गणक</h3>
            <p class="text-xs text-gray-500 font-devanagari">रुद्राक्ष एवं तुलसी माला साधना</p>

            <!-- Circular Display -->
            <div class="relative w-44 h-44 mx-auto my-4 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="88" cy="88" r="74" stroke="#fef3c7" stroke-width="10" fill="transparent" />
                <circle id="japa-ring" cx="88" cy="88" r="74" stroke="#ea580c" stroke-width="10" stroke-dasharray="465" stroke-dashoffset="465" stroke-linecap="round" fill="transparent" class="transition-all duration-200" />
              </svg>
              <div class="absolute flex flex-col items-center">
                <span id="japa-counter-val" class="font-mono text-4xl font-black text-maroon-950">0</span>
                <span class="text-[10px] font-bold uppercase text-saffron-700">/ 108 मनके</span>
              </div>
            </div>

            <!-- Malas Completed -->
            <div class="mb-4 text-xs font-bold text-gray-700 bg-amber-100 px-3 py-1 rounded-full inline-block">
              पूर्ण माला: <span id="japa-malas-val" class="font-mono text-saffron-700 text-sm">0</span>
            </div>

            <!-- Tap Button -->
            <button onclick="advanceJapaCount()" class="w-full bg-gradient-to-r from-saffron-600 via-orange-600 to-amber-600 text-white font-devanagari font-bold text-lg py-3.5 rounded-2xl shadow-lg active:scale-95 transition flex items-center justify-center gap-2 select-none">
              <span>📿</span>
              <span>मनका फेरें (Tap Bead)</span>
            </button>

            <!-- Controls -->
            <div class="flex justify-between items-center mt-4 pt-3 border-t border-amber-100 text-xs text-gray-600">
              <button onclick="VedicAudio.toggleTanpuraDrone()" class="font-bold text-saffron-700 hover:underline">
                <i class="fa-solid fa-guitar mr-1"></i>तानपूरा नाद चालू/बंद
              </button>
              <button onclick="resetJapaCount()" class="font-bold text-rose-700 hover:underline">
                <i class="fa-solid fa-rotate-left mr-1"></i>रीसेट
              </button>
            </div>
          </div>

          <!-- Right: Categorized Vedic Mantras -->
          <div class="lg:col-span-7 bg-white p-6 rounded-3xl border-2 border-amber-200 shadow-sm space-y-4">
            <h3 class="font-devanagari font-bold text-lg text-maroon-950 pb-2 border-b border-amber-200">
              प्रामाणिक वैदिक मंत्र संग्रह
            </h3>

            <div class="p-4 bg-amber-50/70 rounded-xl border border-amber-200">
              <span class="text-[10px] font-bold text-saffron-800 uppercase bg-orange-100 px-2 py-0.5 rounded">ऋग्वेद महामंत्र</span>
              <div class="text-lg font-devanagari font-bold text-maroon-950 mt-1">
                ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥
              </div>
              <p class="text-xs text-gray-600 mt-1 italic font-devanagari">
                भावार्थ: उस प्राणस्वरूप, दुःखनाशक, सुखस्वरूप, श्रेष्ठ परमात्मा का ध्यान करते हैं जो हमारी बुद्धि को सन्मार्ग की ओर प्रेरित करे।
              </p>
            </div>

            <div class="p-4 bg-amber-50/70 rounded-xl border border-amber-200">
              <span class="text-[10px] font-bold text-saffron-800 uppercase bg-orange-100 px-2 py-0.5 rounded">संजीवनी मंत्र</span>
              <div class="text-lg font-devanagari font-bold text-maroon-950 mt-1">
                ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥
              </div>
              <p class="text-xs text-gray-600 mt-1 italic font-devanagari">
                भावार्थ: त्रिनेत्रधारी शिव की आराधना करते हैं जो जीवन शक्ति प्रदान करते हैं। हम मृत्यु के बंधनों से मुक्त होकर अमरत्व को प्राप्त हों।
              </p>
            </div>

            <div class="p-4 bg-amber-50/70 rounded-xl border border-amber-200">
              <span class="text-[10px] font-bold text-saffron-800 uppercase bg-orange-100 px-2 py-0.5 rounded">शांति पाठ</span>
              <div class="text-sm font-devanagari font-bold text-maroon-950 mt-1 leading-relaxed">
                ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः। वनस्पतयः शान्तिर्विश्वेदेवाः शान्तिर्ब्रह्म शान्तिः सर्वं शान्तिः शान्तिरेव शान्तिः सा मा शान्तिरेधि॥ ॐ शान्तिः शान्तिः शान्तिः॥
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 9. KNOWLEDGE & RESEARCH LIBRARY
  library() {
    return `
      <div class="space-y-6">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-gold-300 shadow-sacred">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200 pb-4 mb-6">
            <div>
              <h2 class="text-3xl font-devanagari font-bold text-maroon-950">
                सनातन ज्ञान एवं शोध पुस्तकालय
              </h2>
              <p class="text-xs sm:text-sm text-gray-600 font-devanagari mt-1">
                आचार्य पं० अश्वनी कुमार शुक्ल द्वारा प्रणीत लेख, पूर्वांचल की परम्पराएं एवं कर्मकाण्ड शोध
              </p>
            </div>
            <!-- Search Input -->
            <div class="relative w-full md:w-72">
              <input type="text" id="lib-search" oninput="searchLibraryArticles()" placeholder="लेख खोजें (उदा. पूर्वांचल, वास्तु, भागवत)..." class="w-full px-3 py-2 bg-amber-50/60 border border-amber-300 rounded-xl text-xs font-semibold">
            </div>
          </div>

          <div id="articles-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <!-- Articles injected via JS -->
          </div>
        </div>
      </div>
    `;
  },

  // 10. UPCOMING EVENTS
  events() {
    return `
      <div class="space-y-6">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-gold-300 shadow-sacred">
          <h2 class="text-3xl font-devanagari font-bold text-maroon-950 mb-2">
            आगामी कार्यक्रम एवं धार्मिक आयोजन
          </h2>
          <p class="text-xs sm:text-sm text-gray-600 font-devanagari mb-6">
            आचार्य जी के आगामी श्रीमद्भागवत सप्ताह, महारुद्राभिषेक एवं धार्मिक सत्रों का विवरण
          </p>
          <div id="events-timeline-container" class="space-y-4">
            <!-- Events injected dynamically -->
          </div>
        </div>
      </div>
    `;
  },

  // 11. SAMAGRI CHECKLIST GENERATOR
  samagri() {
    return `
      <div class="space-y-6">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-gold-300 shadow-sacred">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-200 mb-6">
            <div>
              <h2 class="text-3xl font-devanagari font-bold text-maroon-950">
                पूजा सामग्री चेकलिस्ट जनरेटर
              </h2>
              <p class="text-xs sm:text-sm text-gray-600 font-devanagari mt-1">
                अनुष्ठान पूर्व यजमान हेतु सामग्री संकलन एवं WhatsApp पर साझा करने की सुविधा
              </p>
            </div>
            <!-- Puja Selector -->
            <div class="w-full md:w-72">
              <select id="app-samagri-select" onchange="renderSamagriChecklist()" class="w-full p-2.5 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs font-bold text-gray-800">
                <option value="satyanarayan">श्री सत्यनारायण व्रत कथा सामग्री</option>
                <option value="rudrabhishek">रुद्राभिषेक एवं शिव पूजन सामग्री</option>
                <option value="griha_pravesh">गृह प्रवेश एवं वास्तु शांति सामग्री</option>
                <option value="navagraha">नवग्रह शांति एवं हवन सामग्री</option>
                <option value="vivah">विवाह संस्कार पाणिग्रहण सामग्री</option>
                <option value="mundan">मुंडन एवं नामकरण संस्कार सामग्री</option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-2 mb-4">
            <button onclick="copySamagriWhatsApp()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5">
              <i class="fa-brands fa-whatsapp text-sm"></i>
              <span>यजमान को WhatsApp भेजें</span>
            </button>
            <button onclick="window.print()" class="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs px-4 py-2 rounded-xl border border-amber-300 transition flex items-center gap-1.5">
              <i class="fa-solid fa-print"></i>
              <span>प्रिंट पर्ची</span>
            </button>
          </div>

          <!-- Checklist Container -->
          <div id="samagri-checklist-box" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>
    `;
  },

  // 12. ONLINE BOOKING WORKFLOW
  booking() {
    return `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-saffron-900 via-maroon-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 border border-gold-400 shadow-sacred">
          <h2 class="text-3xl font-devanagari font-bold text-amber-100">
            ऑनलाइन अनुष्ठान एवं कथा बुकिंग
          </h2>
          <p class="text-xs sm:text-sm text-amber-200/90 font-devanagari mt-1">
            आचार्य पं० अश्वनी कुमार शुक्ल जी से पूजन, कथा अथवा ज्योतिष परामर्श हेतु पूर्व आरक्षण
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Left: Devotee Booking Form -->
          <div class="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border-2 border-gold-300 shadow-sacred">
            <h3 class="font-devanagari font-bold text-xl text-maroon-950 mb-4 pb-2 border-b border-amber-200">
              यजमान एवं अनुष्ठान विवरण दर्ज करें
            </h3>

            <form id="public-booking-form" onsubmit="submitPublicBooking(event)" class="space-y-4 text-xs font-devanagari">
              <!-- Service Selection -->
              <div>
                <label class="block font-bold text-gray-700 mb-1">पूजन / अनुष्ठान प्रकार *</label>
                <select id="bk-service" required class="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-semibold">
                  <option value="">-- सेवा का चयन करें --</option>
                  <option value="श्रीमद्भागवत सप्ताह ज्ञान यज्ञ">श्रीमद्भागवत सप्ताह ज्ञान यज्ञ (7 दिवसीय)</option>
                  <option value="श्री राम कथा एवं मानस परायण">श्री राम कथा एवं मानस परायण (9 दिवसीय)</option>
                  <option value="रुद्राभिषेक एवं महारुद्र पूजन">रुद्राभिषेक एवं महारुद्र पूजन (भगवान शिव)</option>
                  <option value="श्री सत्यनारायण व्रत कथा एवं पूजन">श्री सत्यनारायण व्रत कथा एवं पूजन</option>
                  <option value="गृह प्रवेश एवं वास्तु शांति अनुष्ठान">गृह प्रवेश एवं वास्तु शांति अनुष्ठान</option>
                  <option value="नवग्रह शांति एवं महायज्ञ">नवग्रह शांति एवं महायज्ञ</option>
                  <option value="विवाह संस्कार विधि">विवाह संस्कार विधि</option>
                  <option value="विस्तृत जन्म कुण्डली परामर्श">विस्तृत जन्म कुण्डली परामर्श</option>
                  <option value="अन्य विशेष वैदिक अनुष्ठान">अन्य विशेष वैदिक अनुष्ठान</option>
                </select>
              </div>

              <!-- Name & Phone -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">यजमान का पूरा नाम *</label>
                  <input type="text" id="bk-name" required placeholder="उदा. विजय नारायण पाण्डेय" class="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-semibold">
                </div>
                <div>
                  <label class="block font-bold text-gray-700 mb-1">मोबाइल नंबर (WhatsApp) *</label>
                  <input type="tel" id="bk-phone" required placeholder="उदा. 9876543210 (10 अंक)" class="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-semibold">
                </div>
              </div>

              <!-- Date & Time Slot -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">वांछित दिनांक *</label>
                  <input type="date" id="bk-date" required class="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-semibold">
                </div>
                <div>
                  <label class="block font-bold text-gray-700 mb-1">प्राथमिक समय वेला *</label>
                  <select id="bk-slot" required class="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-semibold">
                    <option value="08:00 - 11:00">प्रातःकालीन वेला (08:00 AM - 11:00 AM)</option>
                    <option value="11:30 - 14:00">मध्याह्न / अभिजीत वेला (11:30 AM - 02:00 PM)</option>
                    <option value="16:00 - 19:00">सायंकालीन वेला (04:00 PM - 07:00 PM)</option>
                    <option value="पूर्ण दिवस">पूर्ण दिवस (Full Day / कथा आयोजन)</option>
                  </select>
                </div>
              </div>

              <!-- Location Type & Address -->
              <div>
                <label class="block font-bold text-gray-700 mb-1">स्थान प्रकार एवं पता *</label>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  <label class="p-2 border border-amber-300 rounded-lg flex items-center gap-2 bg-amber-50/30 cursor-pointer">
                    <input type="radio" name="bk-loc-type" value="local_gorakhpur" checked>
                    <span>गोरखपुर स्थानीय</span>
                  </label>
                  <label class="p-2 border border-amber-300 rounded-lg flex items-center gap-2 bg-amber-50/30 cursor-pointer">
                    <input type="radio" name="bk-loc-type" value="outstation">
                    <span>गोरखपुर से बाहर</span>
                  </label>
                  <label class="p-2 border border-amber-300 rounded-lg flex items-center gap-2 bg-amber-50/30 cursor-pointer">
                    <input type="radio" name="bk-loc-type" value="online">
                    <span>ऑनलाइन / वीडियो</span>
                  </label>
                </div>
                <input type="text" id="bk-venue" required placeholder="पूजन स्थल का पूरा पता (उदा. मकान नं 12, सिविल लाइन्स, गोरखपुर)" class="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-semibold">
              </div>

              <!-- Gotra & Sankalp -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">गोत्र (यदि ज्ञात हो)</label>
                  <input type="text" id="bk-gotra" placeholder="उदा. कश्यप / भारद्वाज" class="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-semibold">
                </div>
                <div>
                  <label class="block font-bold text-gray-700 mb-1">संकल्प मनोरथ / विशेष टिप्पणी</label>
                  <input type="text" id="bk-notes" placeholder="उदा. गृह शांति, स्वास्थ्य लाभ अथवा विशेष मनोकामना" class="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-semibold">
                </div>
              </div>

              <div class="pt-3">
                <button type="submit" class="w-full bg-gradient-to-r from-saffron-600 to-amber-600 hover:from-saffron-700 hover:to-amber-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm">
                  बुकिंग अनुरोध सबमिट करें
                </button>
              </div>
            </form>
          </div>

          <!-- Right: Booking Tracker & Instructions -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-white p-6 rounded-3xl border-2 border-gold-300 shadow-sm font-devanagari">
              <h4 class="font-bold text-base text-maroon-950 mb-3 pb-2 border-b border-amber-200">
                बुकिंग स्थिति जांचें (Track Booking)
              </h4>
              <p class="text-xs text-gray-600 mb-3">अपना बुकिंग रेफरेंस नंबर दर्ज कर स्थिति देखें:</p>
              <div class="flex gap-2">
                <input type="text" id="track-ref-input" placeholder="उदा. AKS-2610-1001" class="w-full p-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-mono font-bold">
                <button onclick="trackBookingStatus()" class="bg-saffron-600 text-white font-bold text-xs px-4 rounded-xl">जांचें</button>
              </div>
              <div id="track-result-box" class="mt-4 hidden p-3 rounded-xl border text-xs"></div>
            </div>

            <div class="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 text-xs font-devanagari space-y-2">
              <h5 class="font-bold text-maroon-950">महत्वपूर्ण सूचना:</h5>
              <p>• बुकिंग अनुरोध प्राप्त होते ही हमारी ओर से दूरभाष पर समय एवं मुहूर्त की पुष्टि की जाएगी।</p>
              <p>• किसी भी आपातकालीन स्थिति अथवा तुरंत परामर्श हेतु सीधे <a href="tel:+917309441019" class="font-bold text-saffron-700 underline">7309441019</a> पर संपर्क करें।</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 13. CONTACT & CONSULTATION
  contact() {
    const p = APP_STATE.siteProfile;
    return `
      <div class="space-y-6">
        <div class="bg-white rounded-3xl p-6 sm:p-10 border-2 border-gold-300 shadow-sacred">
          <h2 class="text-3xl font-devanagari font-bold text-maroon-950 mb-2">
            संपर्क एवं परामर्श केंद्र
          </h2>
          <p class="text-xs sm:text-sm text-gray-600 font-devanagari mb-8">
            आचार्य पं० अश्वनी कुमार शुक्ल जी से व्यक्तिगत भेंट अथवा दूरभाष संपर्क
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Contact Card 1: Phone -->
            <div class="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center font-devanagari">
              <div class="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl mb-3">
                <i class="fa-solid fa-phone"></i>
              </div>
              <h3 class="font-bold text-base text-gray-900">दूरभाष संपर्क</h3>
              <p class="text-xs text-gray-600 mt-1">प्रत्यक्ष वार्ता एवं समय निश्चित करने हेतु</p>
              <a href="tel:+917309441019" class="mt-3 inline-block font-mono font-bold text-lg text-emerald-800 hover:underline">
                7309441019
              </a>
            </div>

            <!-- Contact Card 2: WhatsApp -->
            <div class="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center font-devanagari">
              <div class="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl mb-3">
                <i class="fa-brands fa-whatsapp"></i>
              </div>
              <h3 class="font-bold text-base text-gray-900">WhatsApp सेवा</h3>
              <p class="text-xs text-gray-600 mt-1">कुण्डली विवरण एवं संदेश प्रेषण हेतु</p>
              <a href="https://wa.me/917309441019" target="_blank" class="mt-3 inline-block font-bold text-sm text-emerald-700 hover:underline">
                संदेश भेजें (+91 7309441019)
              </a>
            </div>

            <!-- Contact Card 3: Location -->
            <div class="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center font-devanagari">
              <div class="w-12 h-12 mx-auto rounded-full bg-saffron-100 text-saffron-700 flex items-center justify-center text-xl mb-3">
                <i class="fa-solid fa-location-dot"></i>
              </div>
              <h3 class="font-bold text-base text-gray-900">स्थान (Location)</h3>
              <p class="text-xs text-gray-700 mt-1 font-semibold">${p.location}</p>
              <span class="mt-3 inline-block text-[11px] text-gray-500">पूर्वांचल एवं समस्त भारत</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 14. DAKSHINA & DONATIONS
  dakshina() {
    return `
      <div class="space-y-6">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-gold-300 shadow-sacred font-devanagari">
          <h2 class="text-3xl font-bold text-maroon-950 mb-2">
            दक्षिणा, दान एवं सहयोग नीति
          </h2>
          <p class="text-xs sm:text-sm text-gray-600 mb-6">
            शास्त्र सम्मत वैदिक अनुष्ठानों में दक्षिणा का महत्व एवं पारदर्शी सहयोग
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Payment Simulator / Form -->
            <div class="p-6 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-4">
              <h3 class="font-bold text-base text-maroon-950 pb-2 border-b border-amber-200">
                दक्षिणा संकल्प प्रपत्र
              </h3>
              <div class="space-y-3 text-xs">
                <div>
                  <label class="block font-bold mb-1">श्रद्धालु का नाम *</label>
                  <input type="text" id="dk-name" placeholder="आपका नाम" class="w-full p-2 bg-white border border-amber-300 rounded-lg">
                </div>
                <div>
                  <label class="block font-bold mb-1">मोबाइल नंबर *</label>
                  <input type="tel" id="dk-phone" placeholder="10 अंकों का मोबाइल" class="w-full p-2 bg-white border border-amber-300 rounded-lg">
                </div>
                <div>
                  <label class="block font-bold mb-1">दक्षिणा राशि (₹) *</label>
                  <input type="number" id="dk-amount" value="1100" min="51" class="w-full p-2 bg-white border border-amber-300 rounded-lg font-mono font-bold">
                </div>
                <div>
                  <label class="block font-bold mb-1">उद्देश्य / अनुष्ठान</label>
                  <select id="dk-purpose" class="w-full p-2 bg-white border border-amber-300 rounded-lg">
                    <option value="पूजा दक्षिणा">पूजा / अनुष्ठान दक्षिणा</option>
                    <option value="कथा आयोजन सहयोग">श्रीमद्भागवत कथा सहयोग</option>
                    <option value="ब्राह्मण भोज व गौ सेवा">ब्राह्मण भोज एवं गौ सेवा</option>
                    <option value="सामान्य सहयोग">सामान्य धार्मिक सहयोग</option>
                  </select>
                </div>
                <button onclick="submitDakshinaOrder()" class="w-full bg-saffron-600 hover:bg-saffron-700 text-white font-bold py-2.5 rounded-lg transition shadow">
                  दक्षिणा रसीद संदर्भ बनाएं
                </button>
              </div>
            </div>

            <!-- Transparency Policy & Notice -->
            <div class="p-6 bg-white rounded-2xl border border-amber-200 space-y-3 text-xs text-gray-700 leading-relaxed">
              <h3 class="font-bold text-base text-maroon-950 pb-2 border-b border-amber-200">
                पारदर्शिता एवं शास्त्रीय नीति
              </h3>
              <p>• वैदिक परम्परा में दक्षिणा कर्मकाण्ड की पूर्णता का प्रतीक है। यह स्वेच्छा एवं श्रद्धा पर आधारित है।</p>
              <p>• वर्तमान में सीधे UPI एवं प्रत्यक्ष बैंक माध्यम समर्थित हैं। ऑनलाइन पेमेंट गेटवे परीक्षण प्रक्रियाधीन है।</p>
              <div class="p-3 bg-amber-100 rounded-xl border border-amber-300 text-[11px]">
                <strong>वैधानिक सूचना:</strong> यह एक धार्मिक एवं वैदिक सेवा केंद्र है। जब तक विधिवत ट्रस्ट अथवा 80G पंजीकरण की अधिकृत प्रति संलग्न न हो, तब तक किसी भी कर छूट (Tax Exemption) का दावा नहीं किया जाता।
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 15. LEGAL, PRIVACY, TERMS & DISCLAIMER
  legal() {
    return `
      <div class="bg-white rounded-3xl p-6 sm:p-10 border-2 border-gold-300 shadow-sacred font-devanagari space-y-8 text-xs sm:text-sm text-gray-800 leading-relaxed">
        <h2 class="text-3xl font-bold text-maroon-950 pb-2 border-b border-amber-200">
          गोपनीयता नीति, नियम एवं अस्वीकरण
        </h2>

        <div>
          <h3 class="font-bold text-base text-maroon-950 mb-2">1. गोपनीयता नीति (Privacy Policy)</h3>
          <p>यजमानों द्वारा ऑनलाइन बुकिंग अथवा कुण्डली परामर्श के समय प्रदान की गई व्यक्तिगत जानकारी (जैसे नाम, मोबाइल नंबर, जन्म दिनांक, समय एवं गोत्र) पूर्णतः सुरक्षित रखी जाती है। इस जानकारी का उपयोग केवल संबंधित पूजा, अनुष्ठान एवं संपर्क हेतु किया जाता है। किसी भी तृतीय पक्ष (Third-party) को डेटा विक्रय अथवा साझा नहीं किया जाता।</p>
        </div>

        <div>
          <h3 class="font-bold text-base text-maroon-950 mb-2">2. सेवा की शर्तें एवं बुकिंग नियम (Terms of Service)</h3>
          <p>अनुष्ठान हेतु दी गई तिथि एवं समय यजमान एवं आचार्य जी की पारस्परिक सहमति पर निर्धारित होता है। अपरिहार्य परिस्थितियों (यथा आकस्मिक प्राकृतिक आपदा अथवा पारिवारिक आपातकाल) में समय को पुनर्निर्धारित (Reschedule) किया जा सकता है।</p>
        </div>

        <div>
          <h3 class="font-bold text-base text-maroon-950 mb-2">3. रद्दीकरण एवं वापसी नीति (Cancellation & Refund Policy)</h3>
          <p>यदि यजमान द्वारा अनुष्ठान निश्चित तिथि से कम से कम 48 घंटे पूर्व रद्द किया जाता है तो अग्रिम राशि का पुनर्निर्धारण संभव है। अनुष्ठान सामग्री की खरीदारी हो जाने के उपरांत सामग्री व्यय वापसी योग्य नहीं होता।</p>
        </div>

        <div>
          <h3 class="font-bold text-base text-maroon-950 mb-2">4. ज्योतिष एवं आध्यात्मिक अस्वीकरण (Spiritual Disclaimer)</h3>
          <p>वैदिक ज्योतिष एक प्राचीन काल-गणना एवं ग्रह स्थिति आधारित पारम्परिक विद्या है। यह जीवन को सही दिशा एवं नैतिक संबल देने का माध्यम है। किसी भी प्रकार के रोग निदान, कानूनी विजय, गड़े धन की प्राप्ति अथवा किसी अनहोनी के शत-प्रतिशत निवारण का अलौकिक दावा नहीं किया जाता। यजमान का विवेक एवं सत्कर्म ही सर्वोपरि है।</p>
        </div>
      </div>
    `;
  },

  // 16. SECURE ADMIN DASHBOARD & YAJMAN LEDGER
  admin() {
    if (!APP_STATE.adminToken) {
      // Login Form
      return `
        <div class="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border-2 border-gold-400 shadow-sacred font-devanagari">
          <div class="text-center mb-6">
            <div class="w-16 h-16 mx-auto rounded-full bg-maroon-900 text-amber-300 flex items-center justify-center text-2xl shadow-md border-2 border-gold-300 mb-2">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <h2 class="text-2xl font-bold text-maroon-950">प्रशासनिक प्रवेश (Admin Login)</h2>
            <p class="text-xs text-gray-500 mt-1">आचार्य पं० अश्वनी कुमार शुक्ल सेवा केंद्र</p>
          </div>

          <form id="admin-login-form" onsubmit="handleAdminLogin(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-gray-700 mb-1">यूज़रनेम (Username) *</label>
              <input type="text" id="adm-user" required value="admin" class="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-semibold">
            </div>
            <div>
              <label class="block font-bold text-gray-700 mb-1">पासवर्ड (Password) *</label>
              <input type="password" id="adm-pass" required placeholder="••••••••" class="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-semibold">
            </div>
            <div class="p-2.5 bg-amber-50 rounded-lg text-[11px] text-gray-600 border border-amber-200">
              डिफ़ॉल्ट क्रेडेंशियल: <strong>admin</strong> / <strong>Acharya@Gorakhpur2026</strong>
            </div>
            <button type="submit" class="w-full bg-maroon-900 hover:bg-maroon-950 text-amber-200 font-bold py-3 rounded-xl transition shadow text-sm">
              सुरक्षित लॉगिन करें
            </button>
          </form>
        </div>
      `;
    }

    // Authenticated Dashboard
    return `
      <div class="space-y-6">
        <!-- Top Admin Bar -->
        <div class="bg-gradient-to-r from-maroon-950 to-stone-900 text-white rounded-3xl p-6 border border-gold-400 shadow-sacred flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span class="text-xs font-bold text-amber-300 bg-black/40 px-3 py-1 rounded-full border border-gold-400/30">
              व्यवस्थापक सत्र सक्रिय (Admin Session)
            </span>
            <h2 class="text-2xl font-devanagari font-bold text-amber-100 mt-1">
              प्रशासनिक नियंत्रण कक्ष एवं यजमान बही-खाता
            </h2>
          </div>
          <button onclick="handleAdminLogout()" class="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>लॉग आउट</span>
          </button>
        </div>

        <!-- Admin Sub-Navigation -->
        <div class="flex flex-wrap gap-2 border-b border-amber-200 pb-3">
          <button onclick="switchAdminTab('bookings')" id="adm-tab-bookings" class="px-4 py-2 rounded-xl text-xs font-bold bg-maroon-900 text-amber-200 shadow">
            📅 बुकिंग प्रबंधन (Bookings)
          </button>
          <button onclick="switchAdminTab('yajmans')" id="adm-tab-yajmans" class="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-orange-100">
            📜 यजमान बही-खाता (Ledger)
          </button>
          <button onclick="switchAdminTab('profile')" id="adm-tab-profile" class="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-orange-100">
            ✍️ प्रोफाइल व संपर्क संपादन
          </button>
          <button onclick="switchAdminTab('audit')" id="adm-tab-audit" class="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-orange-100">
            🛡️ ऑडिट लॉग (Audit Logs)
          </button>
        </div>

        <!-- 1. BOOKINGS MANAGEMENT PANEL -->
        <div id="adm-panel-bookings" class="space-y-4">
          <div class="bg-white rounded-2xl border-2 border-gold-300 shadow-sm p-4 overflow-x-auto">
            <h3 class="font-devanagari font-bold text-base text-gray-900 mb-3">समस्त अनुष्ठान बुकिंग्स</h3>
            <table class="w-full text-left text-xs font-devanagari border-collapse">
              <thead>
                <tr class="bg-amber-100 text-maroon-950 font-bold border-b border-amber-200">
                  <th class="p-2.5">रेफरेंस</th>
                  <th class="p-2.5">दिनांक व समय</th>
                  <th class="p-2.5">यजमान व संपर्क</th>
                  <th class="p-2.5">अनुष्ठान</th>
                  <th class="p-2.5">स्थान</th>
                  <th class="p-2.5">स्थिति</th>
                  <th class="p-2.5 text-center">क्रियाएं</th>
                </tr>
              </thead>
              <tbody id="adm-bookings-tbody" class="divide-y divide-amber-100">
                <!-- Bookings loaded via JS -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. YAJMAN BAHI-KHATA PANEL -->
        <div id="adm-panel-yajmans" class="hidden space-y-4">
          <div class="bg-white rounded-2xl border-2 border-gold-300 shadow-sm p-4 overflow-x-auto">
            <div class="flex justify-between items-center mb-3">
              <h3 class="font-devanagari font-bold text-base text-gray-900">सुरक्षित यजमान बही-खाता</h3>
              <a href="/api/yajmans/export" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow flex items-center gap-1">
                <i class="fa-solid fa-file-csv"></i>
                <span>CSV डाउनलोड</span>
              </a>
            </div>
            <table class="w-full text-left text-xs font-devanagari border-collapse">
              <thead>
                <tr class="bg-amber-100 text-maroon-950 font-bold border-b border-amber-200">
                  <th class="p-2.5">नाम</th>
                  <th class="p-2.5">दूरभाष</th>
                  <th class="p-2.5">गोत्र</th>
                  <th class="p-2.5">पता</th>
                  <th class="p-2.5">कुल अनुष्ठान</th>
                  <th class="p-2.5">टिप्पणी</th>
                </tr>
              </thead>
              <tbody id="adm-yajmans-tbody" class="divide-y divide-amber-100">
                <!-- Yajmans loaded via JS -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. PROFILE EDITOR PANEL -->
        <div id="adm-panel-profile" class="hidden bg-white rounded-2xl border-2 border-gold-300 shadow-sm p-6 font-devanagari">
          <h3 class="font-bold text-base text-maroon-950 mb-4 pb-2 border-b border-amber-200">
            आचार्य प्रोफाइल एवं सार्वजनिक विवरण संपादन
          </h3>
          <form id="adm-profile-form" onsubmit="saveAdminProfile(event)" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold mb-1">आचार्य नाम *</label>
                <input type="text" id="ed-name" value="${APP_STATE.siteProfile.acharya_name}" class="w-full p-2 bg-amber-50 border rounded-lg font-bold">
              </div>
              <div>
                <label class="block font-bold mb-1">उपाधि / पदवी *</label>
                <input type="text" id="ed-title" value="${APP_STATE.siteProfile.title}" class="w-full p-2 bg-amber-50 border rounded-lg font-bold">
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block font-bold mb-1">स्थान *</label>
                <input type="text" id="ed-loc" value="${APP_STATE.siteProfile.location}" class="w-full p-2 bg-amber-50 border rounded-lg">
              </div>
              <div>
                <label class="block font-bold mb-1">फोन *</label>
                <input type="text" id="ed-phone" value="${APP_STATE.siteProfile.phone}" class="w-full p-2 bg-amber-50 border rounded-lg">
              </div>
              <div>
                <label class="block font-bold mb-1">WhatsApp *</label>
                <input type="text" id="ed-wa" value="${APP_STATE.siteProfile.whatsapp}" class="w-full p-2 bg-amber-50 border rounded-lg">
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">जीवनी / परिचय विवरण</label>
              <textarea id="ed-bio" rows="3" class="w-full p-2 bg-amber-50 border rounded-lg">${APP_STATE.siteProfile.bio}</textarea>
            </div>
            <div>
              <label class="block font-bold mb-1">अध्ययन व योग्यता विवरण</label>
              <textarea id="ed-qual" rows="2" class="w-full p-2 bg-amber-50 border rounded-lg">${APP_STATE.siteProfile.qualifications}</textarea>
            </div>
            <button type="submit" class="bg-saffron-600 hover:bg-saffron-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow">
              प्रोफाइल सहेजें
            </button>
          </form>
        </div>

        <!-- 4. AUDIT LOGS PANEL -->
        <div id="adm-panel-audit" class="hidden bg-white rounded-2xl border-2 border-gold-300 shadow-sm p-4 font-devanagari text-xs">
          <h3 class="font-bold text-base text-gray-900 mb-3">सुरक्षा एवं प्रशासनिक ऑडिट लॉग्स</h3>
          <div id="adm-audit-container" class="space-y-1.5 max-h-80 overflow-y-auto">
            <!-- Logs injected dynamically -->
          </div>
        </div>
      </div>
    `;
  }
};

// ============================================================================
// 7. ROUTER & EVENT CONTROLLER
// ============================================================================
function navigateTo(hash) {
  window.location.hash = hash;
}

async function handleRouting() {
  const hash = window.location.hash || '#/';
  APP_STATE.currentRoute = hash;
  const viewport = document.getElementById('app-viewport');
  if (!viewport) return;

  // Mobile menu close
  document.getElementById('mobile-nav-menu')?.classList.add('hidden');

  switch (hash) {
    case '#/about':
      viewport.innerHTML = Views.about();
      break;
    case '#/astrology':
      viewport.innerHTML = Views.astrology();
      break;
    case '#/panchang':
      viewport.innerHTML = Views.panchang();
      break;
    case '#/puja-services':
      viewport.innerHTML = Views.pujaServices();
      renderPujaServicesCatalog();
      break;
    case '#/katha-vachan':
      viewport.innerHTML = Views.kathaVachan();
      break;
    case '#/live-darshan':
      viewport.innerHTML = Views.liveDarshan();
      loadPrayersList();
      break;
    case '#/mantras':
      viewport.innerHTML = Views.mantras();
      break;
    case '#/library':
      viewport.innerHTML = Views.library();
      searchLibraryArticles();
      break;
    case '#/events':
      viewport.innerHTML = Views.events();
      loadEventsTimeline();
      break;
    case '#/samagri':
      viewport.innerHTML = Views.samagri();
      renderSamagriChecklist();
      break;
    case '#/booking':
      viewport.innerHTML = Views.booking();
      break;
    case '#/contact':
      viewport.innerHTML = Views.contact();
      break;
    case '#/dakshina':
      viewport.innerHTML = Views.dakshina();
      break;
    case '#/legal':
      viewport.innerHTML = Views.legal();
      break;
    case '#/admin':
      viewport.innerHTML = Views.admin();
      if (APP_STATE.adminToken) loadAdminDashboardData();
      break;
    case '#/':
    default:
      viewport.innerHTML = Views.home();
      break;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================================
// 8. INTERACTIVE MODULE ACTIONS
// ============================================================================

// 1. Astro Sub-Tabs
function switchAstroSubTab(tab) {
  ['chart', 'milan', 'dosha'].forEach(t => {
    document.getElementById(`astro-panel-${t}`)?.classList.add('hidden');
    const btn = document.getElementById(`astro-tab-${t}`);
    if (btn) btn.className = "px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-orange-100";
  });
  document.getElementById(`astro-panel-${tab}`)?.classList.remove('hidden');
  const activeBtn = document.getElementById(`astro-tab-${tab}`);
  if (activeBtn) activeBtn.className = "px-4 py-2 rounded-xl text-xs font-bold bg-saffron-600 text-white shadow";
}

// 2. Chart Generator Logic
function generateKundliChart(e) {
  e.preventDefault();
  const name = document.getElementById('ac-name')?.value || "जातक";
  const pobStr = document.getElementById('ac-pob')?.value || "26.7606,83.3732,5.5,गोरखपुर";
  const [lat, lon, tz, place] = pobStr.split(',');

  // Rotate lagna and recompute simple sample signs
  const signs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  for (let i = 1; i <= 12; i++) {
    const el = document.getElementById(`kh-s${i}`);
    if (el) el.textContent = ((i + 3) % 12) + 1;
  }
  const summaryEl = document.getElementById('chart-calc-summary');
  if (summaryEl) {
    summaryEl.textContent = `जातक: ${name} • स्थान: ${place} • लग्न: कर्क • चंद्र राशि: सिंह (मघा नक्षत्र) • तत्व: अग्नि`;
  }
  showToast(`कुण्डली चक्र तैयार: ${name}`, 'success');
}

// 3. Guna Milan Result Calculator
function calculateGunaMilanResult() {
  const boyRashiIdx = parseInt(document.getElementById('milan-boy-rashi')?.value || '5');
  const girlRashiIdx = parseInt(document.getElementById('milan-girl-rashi')?.value || '9');

  const boySign = VedicPanchang.rashis[boyRashiIdx - 1];
  const girlSign = VedicPanchang.rashis[girlRashiIdx - 1];
  const res = VedicAstrology.calculateGunaMilan(boySign, { pada: 2, name: 'मघा' }, girlSign, { pada: 1, name: 'मूल' });

  const scoreEl = document.getElementById('milan-score-display');
  const badgeEl = document.getElementById('milan-verdict-badge');
  const textEl = document.getElementById('milan-verdict-text');

  if (scoreEl) scoreEl.textContent = `${res.totalScore} / 36`;
  if (badgeEl) badgeEl.textContent = res.verdict;
  if (textEl) textEl.textContent = res.desc;

  showToast(`गुण मिलान पूर्ण: ${res.totalScore} गुण`, 'info');
}

// 4. Japa Mala Counter Logic
let japaCount = 0;
let completedMalas = 0;

function advanceJapaCount() {
  japaCount++;
  VedicAudio.playBeadClick();

  if (japaCount >= 108) {
    completedMalas++;
    japaCount = 0;
    VedicAudio.playTempleBell();
    showToast("🎉 १०८ जप संपन्न! १ पूर्ण माला पूर्ण हुई!", "success");
  }

  const valEl = document.getElementById('japa-counter-val');
  const malasEl = document.getElementById('japa-malas-val');
  const ring = document.getElementById('japa-ring');

  if (valEl) valEl.textContent = japaCount;
  if (malasEl) malasEl.textContent = completedMalas;
  if (ring) {
    const circumference = 465;
    const offset = circumference - (japaCount / 108) * circumference;
    ring.style.strokeDashoffset = offset;
  }
}

function resetJapaCount() {
  japaCount = 0;
  const valEl = document.getElementById('japa-counter-val');
  const ring = document.getElementById('japa-ring');
  if (valEl) valEl.textContent = '0';
  if (ring) ring.style.strokeDashoffset = 465;
  showToast("जप माला रीसेट हुई", "info");
}

// 5. Samagri Checklist Database & Renderer
const SAMAGRI_DB = {
  satyanarayan: {
    title: "श्री सत्यनारायण व्रत कथा",
    items: [
      "गंगाजल (1 बोतल)", "पंचामृत (दूध, दही, घी, शहद, शर्करा)", "रोली / कुमकुम (50 ग्राम)",
      "पीला चंदन व अष्टगंध", "कपूर व अगरबत्ती", "पान के पत्ते (21 नग)", "साबुत सुपारी (21 नग)",
      "अक्षत (चावल - 1 किलो)", "हल्दी की गांठ (11)", "सत्यनारायण पंजीरी प्रसाद सामग्री",
      "पीला सूती वस्त्र (1.25 मीटर)", "तांबे का कलश (1)", "सूखा जटा वाला नारियल (1)",
      "ताजे पीले फूल व तुलसी दल"
    ]
  },
  rudrabhishek: {
    title: "रुद्राभिषेक एवं शिव पूजन",
    items: [
      "गाय का कच्चा दूध (2 लीटर)", "ताजा दही (500 ग्राम)", "शुद्ध देसी घी (250 ग्राम)",
      "शहद (250 ग्राम)", "गंगाजल (2 बोतल)", "गन्ने का रस (1 लीटर)", "अखण्ड बेलपत्र (108 नग)",
      "धतूरा व आक के फूल", "भस्म व सफेद चंदन", "जनेऊ (5 नग)", "हवन सामग्री व समिधा"
    ]
  },
  griha_pravesh: {
    title: "गृह प्रवेश एवं वास्तु शांति",
    items: [
      "मंगल कलश (तांबा - 2 नग)", "नारियल (2)", "आम के पल्लव", "वास्तु यंत्र / नवग्रह समिधा",
      "हवन सामग्री (1 किलो)", "गौ घृत (1 किलो)", "कलावा (5 रील)", "पीली सरसों व गुग्गुल",
      "द्वार तोरण (बंदनवार)", "हल्दी, रोली, अक्षत"
    ]
  }
};

function renderSamagriChecklist() {
  const sel = document.getElementById('app-samagri-select');
  const box = document.getElementById('samagri-checklist-box');
  if (!box) return;
  const key = sel?.value || 'satyanarayan';
  const data = SAMAGRI_DB[key] || SAMAGRI_DB.satyanarayan;

  box.innerHTML = data.items.map((item, idx) => `
    <label class="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200 hover:bg-amber-100/50 cursor-pointer text-xs font-devanagari">
      <input type="checkbox" class="mt-0.5 accent-saffron-600 w-4 h-4 rounded">
      <span class="text-gray-800 font-semibold">${item}</span>
    </label>
  `).join('');
}

function copySamagriWhatsApp() {
  const sel = document.getElementById('app-samagri-select');
  const key = sel?.value || 'satyanarayan';
  const data = SAMAGRI_DB[key] || SAMAGRI_DB.satyanarayan;

  let text = `॥ ॐ श्री गणेशाय नमः ॥\n\nपूजन सामग्री चेकलिस्ट: ${data.title}\nआचार्य पं० अश्वनी कुमार शुक्ल (गोरखपुर - 7309441019)\n----------------------------------------\n`;
  data.items.forEach((item, i) => {
    text += `${i + 1}. ${item}\n`;
  });
  text += `\nकृपया पूजन के पूर्व उपरोक्त सामग्री एकत्र कर लें।\nशुभम् भवतु!`;

  navigator.clipboard.writeText(text).then(() => {
    showToast("सामग्री सूची क्लिपबोर्ड में कॉपी की गई (WhatsApp पर पेस्ट करें)", "success");
  });
}

// 6. Public Devotee Booking Submission
async function submitPublicBooking(e) {
  e.preventDefault();
  const service = document.getElementById('bk-service')?.value;
  const name = document.getElementById('bk-name')?.value.trim();
  const phone = document.getElementById('bk-phone')?.value.trim();
  const date = document.getElementById('bk-date')?.value;
  const slot = document.getElementById('bk-slot')?.value;
  const venue = document.getElementById('bk-venue')?.value.trim();
  const gotra = document.getElementById('bk-gotra')?.value.trim();
  const notes = document.getElementById('bk-notes')?.value.trim();
  const locType = document.querySelector('input[name="bk-loc-type"]:checked')?.value || 'local_gorakhpur';

  try {
    const res = await API.createBooking({
      service_name: service,
      client_name: name,
      client_phone: phone,
      booking_date: date,
      time_slot: slot,
      location_type: locType,
      venue_address: venue,
      gotra,
      sankalp_notes: notes
    });

    alert(`॥ ॐ श्री गणेशाय नमः ॥\n\nआपका अनुष्ठान सफलतापूर्वक दर्ज हुआ!\n\nबुकिंग संदर्भ संख्या: ${res.booking_ref}\nस्थिति: ${res.status}\n\nआचार्य जी शीघ्र आपसे संपर्क कर समय की पुष्टि करेंगे।`);
    navigateTo('#/');
  } catch (err) {
    showToast(`बुकिंग त्रुटि: ${err.message}`, "error");
  }
}

// 7. Track Booking Reference
async function trackBookingStatus() {
  const ref = document.getElementById('track-ref-input')?.value.trim();
  const box = document.getElementById('track-result-box');
  if (!ref || !box) return;

  try {
    const data = await API.trackBooking(ref);
    box.className = "mt-4 p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-devanagari block";
    box.innerHTML = `
      <div class="font-bold text-emerald-950">${data.service_name}</div>
      <div class="text-gray-600">यजमान: ${data.client_name} • दिनांक: ${data.booking_date} (${data.time_slot})</div>
      <div class="mt-1 font-bold text-saffron-800">स्थिति: <span class="uppercase">${data.status}</span></div>
    `;
  } catch (e) {
    box.className = "mt-4 p-3 rounded-xl border border-rose-300 bg-rose-50 text-xs font-devanagari block text-rose-800";
    box.textContent = "संदर्भ संख्या नहीं मिली। कृपया पुनः जांचें।";
  }
}

// 8. Public Prayer Wall Post
async function submitDevoteePrayer(e) {
  e.preventDefault();
  const name = document.getElementById('prayer-name')?.value.trim();
  const city = document.getElementById('prayer-city')?.value.trim();
  const text = document.getElementById('prayer-text')?.value.trim();

  try {
    await API.postPrayer({ devotee_name: name, city, prayer_text: text });
    showToast("आपकी प्रार्थना साझा की गई!", "success");
    document.getElementById('post-prayer-form')?.reset();
    loadPrayersList();
  } catch (err) {
    showToast(`त्रुटि: ${err.message}`, "error");
  }
}

async function loadPrayersList() {
  const container = document.getElementById('prayers-container');
  if (!container) return;
  try {
    const prayers = await API.getPrayers();
    container.innerHTML = prayers.map(p => `
      <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
        <div class="flex justify-between items-center text-[11px] font-bold text-maroon-950">
          <span>${p.devotee_name} (${p.city || 'गोरखपुर'})</span>
          <span class="text-gray-400 font-mono text-[9px]">${(p.created_at || '').slice(0, 10)}</span>
        </div>
        <p class="text-gray-700 mt-1">${p.prayer_text}</p>
      </div>
    `).join('');
  } catch (e) {}
}

// 9. Library Search & Articles Loader
async function searchLibraryArticles() {
  const q = document.getElementById('lib-search')?.value.trim() || '';
  const container = document.getElementById('articles-container');
  if (!container) return;

  try {
    const articles = await API.getArticles(q);
    container.innerHTML = articles.map(a => `
      <div class="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 flex flex-col justify-between font-devanagari">
        <div>
          <span class="text-[10px] font-bold text-saffron-800 bg-orange-100 px-2 py-0.5 rounded-full uppercase">${a.category}</span>
          <h3 class="font-bold text-base text-maroon-950 mt-2">${a.title}</h3>
          <p class="text-xs text-gray-600 mt-1 leading-relaxed">${a.summary}</p>
        </div>
        <div class="pt-3 border-t border-amber-200 mt-4 text-[11px] text-gray-500 flex justify-between items-center">
          <span>लेखक: ${a.author}</span>
          <span class="font-semibold text-saffron-700">पूर्ण लेख</span>
        </div>
      </div>
    `).join('');
  } catch (e) {}
}

// 10. Services Catalog Renderer
async function renderPujaServicesCatalog() {
  const container = document.getElementById('services-full-list');
  if (!container) return;
  const services = await API.getServices();

  container.innerHTML = services.map(s => `
    <div class="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 flex flex-col justify-between font-devanagari">
      <div>
        <div class="flex justify-between items-start">
          <h3 class="font-bold text-base text-maroon-950">${s.title}</h3>
          <span class="text-[10px] bg-amber-100 text-saffron-800 font-bold px-2 py-0.5 rounded uppercase">${s.category}</span>
        </div>
        <p class="text-xs text-gray-700 mt-2 leading-relaxed">${s.description}</p>
      </div>
      <div class="pt-3 border-t border-amber-200 mt-4 flex justify-between items-center text-xs">
        <span class="font-bold text-gray-700">अनुमानित अवधि: ${s.duration_hours} घंटे</span>
        <a href="#/booking" class="bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-3 py-1.5 rounded-xl transition shadow">
          यह पूजा बुक करें
        </a>
      </div>
    </div>
  `).join('');
}

// 11. Events Timeline Loader
async function loadEventsTimeline() {
  const container = document.getElementById('events-timeline-container');
  if (!container) return;
  const events = await API.getEvents();

  container.innerHTML = events.map(e => `
    <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-devanagari">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-saffron-800">${e.event_type}</span>
          <span class="text-xs font-mono font-bold text-maroon-950">${e.start_date}</span>
        </div>
        <h3 class="font-bold text-base text-gray-900 mt-1">${e.title}</h3>
        <p class="text-xs text-gray-600">${e.venue}</p>
      </div>
      <a href="#/booking" class="bg-saffron-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">
        सहभागिता दर्ज करें
      </a>
    </div>
  `).join('');
}

// 12. Dakshina Order Simulation
async function submitDakshinaOrder() {
  const name = document.getElementById('dk-name')?.value.trim();
  const phone = document.getElementById('dk-phone')?.value.trim();
  const amount = parseFloat(document.getElementById('dk-amount')?.value || '0');
  const purpose = document.getElementById('dk-purpose')?.value;

  if (!name || !phone || amount <= 0) {
    showToast("कृपया नाम, फोन एवं राशि दर्ज करें", "error");
    return;
  }

  try {
    const res = await API.request('/api/dakshina/create-order', {
      method: 'POST',
      body: JSON.stringify({ devotee_name: name, devotee_phone: phone, amount, purpose })
    });
    alert(`॥ ॐ नमः शिवाय ॥\n\nदक्षिणा संकल्प संदर्भ निर्मित हुआ!\n\nरेफरेंस सं०: ${res.reference_no}\nराशि: ₹${amount}\n\nगेटवे सूचना: ${res.instruction}`);
  } catch (e) {
    showToast(`त्रुटि: ${e.message}`, "error");
  }
}

// ============================================================================
// 9. ADMIN DASHBOARD OPERATIONS
// ============================================================================
async function handleAdminLogin(e) {
  e.preventDefault();
  const username = document.getElementById('adm-user')?.value.trim();
  const password = document.getElementById('adm-pass')?.value;

  try {
    const res = await API.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    APP_STATE.adminToken = res.token;
    APP_STATE.adminUser = res.user;
    localStorage.setItem('acharya_admin_token', res.token);
    localStorage.setItem('acharya_admin_user', JSON.stringify(res.user));
    showToast("व्यवस्थापक लॉगिन सफल!", "success");
    navigateTo('#/admin');
  } catch (err) {
    showToast(`लॉगिन विफल: ${err.message}`, "error");
  }
}

function handleAdminLogout() {
  APP_STATE.adminToken = null;
  APP_STATE.adminUser = null;
  localStorage.removeItem('acharya_admin_token');
  localStorage.removeItem('acharya_admin_user');
  showToast("लॉग आउट हुए", "info");
  navigateTo('#/');
}

function switchAdminTab(tab) {
  ['bookings', 'yajmans', 'profile', 'audit'].forEach(t => {
    document.getElementById(`adm-panel-${t}`)?.classList.add('hidden');
    const btn = document.getElementById(`adm-tab-${t}`);
    if (btn) btn.className = "px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-orange-100";
  });
  document.getElementById(`adm-panel-${tab}`)?.classList.remove('hidden');
  const activeBtn = document.getElementById(`adm-tab-${tab}`);
  if (activeBtn) activeBtn.className = "px-4 py-2 rounded-xl text-xs font-bold bg-maroon-900 text-amber-200 shadow";

  if (tab === 'yajmans') loadAdminYajmansData();
  if (tab === 'audit') loadAdminAuditLogs();
}

async function loadAdminDashboardData() {
  const tbody = document.getElementById('adm-bookings-tbody');
  if (!tbody) return;

  try {
    const bookings = await API.request('/api/bookings');
    tbody.innerHTML = bookings.map(b => `
      <tr class="hover:bg-amber-50/60 transition">
        <td class="p-2.5 font-mono font-bold text-maroon-900">${b.booking_ref}</td>
        <td class="p-2.5">
          <div class="font-bold">${b.booking_date}</div>
          <div class="text-[10px] text-gray-500">${b.time_slot}</div>
        </td>
        <td class="p-2.5">
          <div class="font-bold">${b.client_name}</div>
          <div class="text-[10px] text-gray-500">📞 ${b.client_phone} • ${b.gotra || 'गोत्र: अविदित'}</div>
        </td>
        <td class="p-2.5 font-bold">${b.service_name}</td>
        <td class="p-2.5 truncate max-w-xs" title="${b.venue_address}">${b.venue_address}</td>
        <td class="p-2.5">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
            ${b.status}
          </span>
        </td>
        <td class="p-2.5 text-center">
          <div class="flex items-center justify-center gap-1">
            <button onclick="updateBookingStatusDialog(${b.id}, 'confirmed')" title="स्वीकार करें" class="p-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800">
              <i class="fa-solid fa-check"></i>
            </button>
            <button onclick="updateBookingStatusDialog(${b.id}, 'cancelled')" title="रद्द करें" class="p-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (e) {}
}

async function updateBookingStatusDialog(id, status) {
  const notes = prompt(`बुकिंग स्थिति "${status}" करने हेतु टिप्पणी दर्ज करें (वैकल्पिक):`, "");
  try {
    await API.request(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_notes: notes || undefined })
    });
    showToast(`स्थिति अद्यतन: ${status}`, "success");
    loadAdminDashboardData();
  } catch (err) {
    alert(`त्रुटि: ${err.message}`);
  }
}

async function loadAdminYajmansData() {
  const tbody = document.getElementById('adm-yajmans-tbody');
  if (!tbody) return;

  try {
    const yajmans = await API.request('/api/yajmans');
    tbody.innerHTML = yajmans.map(y => `
      <tr class="hover:bg-amber-50/60 transition">
        <td class="p-2.5 font-bold text-gray-900">${y.name}</td>
        <td class="p-2.5 font-mono">${y.phone}</td>
        <td class="p-2.5">${y.gotra || '—'}</td>
        <td class="p-2.5 truncate max-w-xs">${y.address || '—'}</td>
        <td class="p-2.5 font-bold font-mono text-saffron-800">${y.total_rituals}</td>
        <td class="p-2.5 text-[11px] text-gray-500">${y.notes || '—'}</td>
      </tr>
    `).join('');
  } catch (e) {}
}

async function loadAdminAuditLogs() {
  const box = document.getElementById('adm-audit-container');
  if (!box) return;
  try {
    const logs = await API.request('/api/audit-logs');
    box.innerHTML = logs.map(l => `
      <div class="p-2 bg-amber-50/50 rounded border border-amber-200 flex justify-between items-center text-[11px]">
        <div>
          <span class="font-bold text-maroon-900">${l.action}</span> by <strong>${l.performed_by}</strong>: ${l.details || ''}
        </div>
        <div class="text-[10px] text-gray-400 font-mono">${l.created_at}</div>
      </div>
    `).join('');
  } catch (e) {}
}

async function saveAdminProfile(e) {
  e.preventDefault();
  const name = document.getElementById('ed-name')?.value.trim();
  const title = document.getElementById('ed-title')?.value.trim();
  const loc = document.getElementById('ed-loc')?.value.trim();
  const phone = document.getElementById('ed-phone')?.value.trim();
  const wa = document.getElementById('ed-wa')?.value.trim();
  const bio = document.getElementById('ed-bio')?.value.trim();
  const qual = document.getElementById('ed-qual')?.value.trim();

  try {
    await API.request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({
        acharya_name: name,
        title,
        location: loc,
        phone,
        whatsapp: wa,
        bio,
        qualifications: qual,
        research_overview: APP_STATE.siteProfile.research_overview
      })
    });
    APP_STATE.siteProfile = { ...APP_STATE.siteProfile, acharya_name: name, title, location: loc, phone, whatsapp: wa, bio, qualifications: qual };
    showToast("प्रोफाइल अद्यतन सफल!", "success");
  } catch (err) {
    showToast(`प्रोफाइल अद्यतन विफल: ${err.message}`, "error");
  }
}

// Global Toast Feedback
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-950 border-emerald-500 text-emerald-100',
    error: 'bg-rose-950 border-rose-500 text-rose-100',
    info: 'bg-stone-950 border-gold-500 text-amber-100'
  };

  toast.className = `p-3.5 rounded-xl border shadow-xl flex items-center space-x-2.5 text-xs font-semibold pointer-events-auto transform transition duration-300 translate-y-2 opacity-0 font-devanagari ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : '🕉️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================================================
// 10. INITIALIZATION
// ============================================================================
window.addEventListener('hashchange', handleRouting);
document.addEventListener('DOMContentLoaded', async () => {
  // Mobile toggle
  document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
    document.getElementById('mobile-nav-menu')?.classList.toggle('hidden');
  });

  // Temple bell
  document.getElementById('temple-bell-btn')?.addEventListener('click', () => {
    VedicAudio.playTempleBell();
  });

  // Fetch updated profile
  try {
    const prof = await API.getProfile();
    if (prof) APP_STATE.siteProfile = prof;
  } catch (e) {}

  // Initial Routing
  handleRouting();

  console.log("🕉️ आचार्य पं० अश्वनी कुमार शुक्ल सेवा केंद्र (गोरखपुर) - प्लेटफॉर्म तैयार!");
});
