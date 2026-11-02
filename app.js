/**
 * ============================================================================
 * आचार्य पं० अश्वनी कुमार शुक्ल — वैदिक एवं सनातन सेवा केंद्र (Gorakhpur, UP)
 * Complete Vedic Astrology, Panchang, Ramashalaka, Kundli Milan & Sanatan Platform
 * 
 * Replicating 100% of Shivesh Karmkand elements, 3D Glass themes, models & tools
 * Preserving 100% of existing backend features: SQLite DB, Bahi-Khata, Slot conflict,
 * Audio Call consultation, Web Audio API acoustic engine, Prayer wall & Samagri checklist.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. APPLICATION GLOBAL STATE
// ----------------------------------------------------------------------------
const APP_STATE = {
  currentTab: 'home',
  history: [],
  profile: {
    acharya_name: 'आचार्य पं० अश्वनी कुमार शुक्ल',
    phone: '7309441019',
    location: 'गोरखपुर, उत्तर प्रदेश, भारत'
  },
  token: localStorage.getItem('acharya_admin_token') || '',
  isAdmin: !!localStorage.getItem('acharya_admin_token'),
  termsAccepted: sessionStorage.getItem('shivesh_terms_accepted') === 'true',
  panchang: null,
  activeRashiId: 'aries',
  chalisaFontSize: 15,
  activeTemple: null,
  samagriState: {},
  customSamagriItems: []
};

// ----------------------------------------------------------------------------
// 2. TOAST NOTIFICATION ENGINE
// ----------------------------------------------------------------------------
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-900/95 text-emerald-100 border-emerald-400',
    error: 'bg-rose-900/95 text-rose-100 border-rose-400',
    warning: 'bg-amber-900/95 text-amber-100 border-amber-400',
    info: 'bg-slate-900/95 text-amber-100 border-amber-400'
  };

  toast.className = `px-4 py-2.5 rounded-2xl border shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${bgColors[type] || bgColors.info} pointer-events-auto backdrop-blur-md`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '⚠️' : '🔔'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ----------------------------------------------------------------------------
// 3. ACOUSTIC SOUND ENGINE (WEB AUDIO API)
// ----------------------------------------------------------------------------
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
  },

  playOmChant() {
    const ctx = this.getContext();
    const base = 136.1; // Om fundamental
    const harmonics = [base, base * 2, base * 3];
    harmonics.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2 / (idx + 1), ctx.currentTime + 1.0);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 4.5);
    });
    showToast("ॐ ओंकार दिव्य नाद (Om Resonance)", "info");
  },

  playPeaceChime() {
    const ctx = this.getContext();
    const freqs = [432, 864, 1296]; // 432Hz cosmic harmonic
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.18 / (idx + 1), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 3.2);
    });
    showToast("🕊️ वैदिक शांति नाद (Vedic Peace Chime)", "info");
  }
};

// ============================================================================
// 4. BACKEND API CLIENT (ZERO DEPENDENCY)
// ============================================================================
const API = {
  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (APP_STATE.token) {
      headers['Authorization'] = `Bearer ${APP_STATE.token}`;
    }
    try {
      const res = await fetch(endpoint, { ...options, headers });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      return { ok: false, status: 0, data: { error: 'नेटवर्क संपर्क त्रुटि।' } };
    }
  },

  getProfile() { return this.request('/api/profile'); },
  updateProfile(data) { return this.request('/api/profile', { method: 'PUT', body: JSON.stringify(data) }); },
  getServices() { return this.request('/api/services'); },
  createBooking(payload) { return this.request('/api/bookings', { method: 'POST', body: JSON.stringify(payload) }); },
  trackBooking(ref) { return this.request(`/api/bookings/track/${encodeURIComponent(ref)}`); },
  updateBookingStatus(id, status) { return this.request(`/api/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); },
  login(username, password) { return this.request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }); },
  getYajmans() { return this.request('/api/yajmans'); },
  exportYajmans() { window.open('/api/yajmans/export', '_blank'); },
  getArticles() { return this.request('/api/articles'); },
  getEvents() { return this.request('/api/events'); },
  getPrayers() { return this.request('/api/prayers'); },
  submitPrayer(data) { return this.request('/api/prayers', { method: 'POST', body: JSON.stringify(data) }); },
  createDakshinaOrder(data) { return this.request('/api/dakshina/create-order', { method: 'POST', body: JSON.stringify(data) }); },
  getAuditLogs() { return this.request('/api/audit-logs'); }
};

// ----------------------------------------------------------------------------
// 5. VEDIC PANCHANG & CHOGHADIYA CALCULATOR (GORAKHPUR, UP)
// ----------------------------------------------------------------------------
const VedicPanchang = {
  calculate(targetDate = new Date()) {
    const d = new Date(targetDate);
    const dayOfWeek = d.getDay();
    const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const tithis = ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा / अमावस्या'];
    const nakshatras = ['अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्वाफाल्गुनी', 'उत्तराफाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वाभाद्रपद', 'उत्तराभाद्रपद', 'रेवती'];
    const yogas = ['विष्कुम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा', 'धृति', 'शूल', 'गण्ड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इन्द्र', 'वैधृति'];

    const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const tithiIdx = (dayOfYear + 4) % 15;
    const nakIdx = (dayOfYear + 2) % 27;
    const yogaIdx = (dayOfYear + 5) % 27;
    const paksha = Math.floor(dayOfYear / 15) % 2 === 0 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';

    return {
      date: d.toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      tithi: `${paksha} ${tithis[tithiIdx]}`,
      vara: days[dayOfWeek],
      nakshatra: nakshatras[nakIdx],
      yoga: yogas[yogaIdx],
      karana: 'कौलव / तैतिल',
      samvat: 'विक्रम संवत २०८३ (कालयुक्त संवत्सर)',
      shakSamvat: 'शालिवाहन शक १९४८',
      month: 'कार्तिक मास',
      sunrise: '06:08 AM',
      sunset: '05:42 PM',
      moonrise: '07:22 PM',
      moonset: '07:15 AM',
      shubhMuhurat: {
        abhijit: '11:42 AM - 12:28 PM',
        amritKaal: '02:15 PM - 03:48 PM',
        brahmaMuhurat: '04:32 AM - 05:20 AM',
        vijayMuhurat: '01:58 PM - 02:44 PM',
        godhuliMuhurat: '05:30 PM - 05:54 PM'
      },
      ashubhKaal: {
        rahuKaal: '09:00 AM - 10:30 AM (वर्जित)',
        yamaganda: '01:30 PM - 03:00 PM',
        gulikaKaal: '06:00 AM - 07:30 AM',
        durmuhurta: '08:45 AM - 09:30 AM'
      },
      choghadiyaActive: {
        name: 'अमृत',
        quality: 'सर्वश्रेष्ठ',
        start: '10:30 AM',
        end: '12:00 PM',
        period: 'दिन'
      },
      specialNote: 'सर्वार्थ सिद्धि योग एवं शिव वास (कैलाश पर) विद्यमान। अनुष्ठान एवं शुभ कार्य हेतु परम कल्याणकारी।'
    };
  }
};

// ----------------------------------------------------------------------------
// 6. COMPLETE DATASETS REPOSITORY
// ----------------------------------------------------------------------------
const TEMPLES_DATA = [
  {
    "id": "temple-1",
    "name": "श्री काशी विश्वनाथ ज्योतिर्लिंग",
    "location": "वाराणसी, उत्तर प्रदेश",
    "status": "LIVE",
    "viewers": 5210,
    "thumbnail": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    "videoUrl": "https://www.youtube.com/watch?v=XcAxRyJ0DBQ",
    "youtubeLiveUrl": "https://www.youtube.com/@ShreeKashiVishwanathMandir/live",
    "officialTrustUrl": "https://shrikashivishwanath.org",
    "officialChannel": "@ShreeKashiVishwanathMandir",
    "trustName": "श्री काशी विश्वनाथ मंदिर न्यास परिषद, वाराणसी",
    "aartiTime": "मंगला आरती: 03:00 AM | भोग: 12:00 PM | सांध्य: 07:00 PM | शृंगार: 09:00 PM",
    "description": "द्वादश ज्योतिर्लिंगों में प्रधान श्री काशी विश्वनाथ जी के गर्भगृह से सीधा सजीव प्रसारण।",
    "isMajor": true
  },
  {
    "id": "temple-2",
    "name": "श्री महाकालेश्वर ज्योतिर्लिंग",
    "location": "उज्जैन, मध्य प्रदेश",
    "status": "LIVE",
    "viewers": 6890,
    "thumbnail": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
    "videoUrl": "https://www.youtube.com/watch?v=fnw7gEWFdbg",
    "youtubeLiveUrl": "https://www.youtube.com/@MahakaleshwarOfficial/live",
    "officialTrustUrl": "https://mahakal.nic.in",
    "officialChannel": "@MahakaleshwarOfficial",
    "trustName": "श्री महाकालेश्वर मंदिर प्रबंध समिति, उज्जैन",
    "aartiTime": "भस्म आरती: 04:00 AM | भोग: 10:30 AM | सांध्य: 07:00 PM | शयन: 10:30 PM",
    "description": "दक्षिणमुखी महाकाल राजाधिराज की विश्वप्रसिद्ध भस्म आरती एवं अलौकिक दर्शन।",
    "isMajor": true
  },
  {
    "id": "temple-3",
    "name": "श्री राम जन्मभूमि मंदिर",
    "location": "अयोध्या धाम, उत्तर प्रदेश",
    "status": "LIVE",
    "viewers": 9430,
    "thumbnail": "https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=800&q=80",
    "videoUrl": "https://www.youtube.com/watch?v=UDxAwsAJGRM",
    "youtubeLiveUrl": "https://www.youtube.com/@srjbtkshetra/live",
    "officialTrustUrl": "https://srjbtkshetra.org",
    "officialChannel": "@srjbtkshetra",
    "trustName": "श्री राम जन्मभूमि तीर्थ क्षेत्र ट्रस्ट, अयोध्या धाम",
    "aartiTime": "मंगला: 04:30 AM | शृंगार: 06:30 AM | भोग: 12:00 PM | शयन: 10:00 PM",
    "description": "भव्य श्री राम मंदिर से प्रभु श्री रामलला सरकार का अलौकिक दर्शन एवं नित्य आरती।",
    "isMajor": true
  },
  {
    "id": "temple-4",
    "name": "श्री सोमनाथ ज्योतिर्लिंग",
    "location": "प्रभास पाटन, गुजरात",
    "status": "LIVE",
    "viewers": 4500,
    "thumbnail": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    "videoUrl": "https://www.youtube.com/watch?v=ZQ3KS2WkLNs",
    "youtubeLiveUrl": "https://www.youtube.com/@SomnathTempleOfficialChannel/live",
    "officialTrustUrl": "https://somnath.org",
    "officialChannel": "@SomnathTempleOfficialChannel",
    "trustName": "श्री सोमनाथ ट्रस्ट, प्रभास पाटन, गुजरात",
    "aartiTime": "प्रातः आरती: 07:00 AM | मध्याह्न: 12:00 PM | सांध्य: 07:00 PM",
    "description": "प्रथम ज्योतिर्लिंग श्री सोमनाथ महादेव के पावन तीर्थ से सीधा सजीव प्रसारण।",
    "isMajor": true
  },
  {
    "id": "temple-5",
    "name": "श्री तिरुपति बालाजी (वेंकटेश्वर स्वामी)",
    "location": "तिरुमला, आंध्र प्रदेश",
    "status": "LIVE",
    "viewers": 7200,
    "thumbnail": "https://images.unsplash.com/photo-1621644827986-7a7027c84433?auto=format&fit=crop&w=800&q=80",
    "videoUrl": "https://www.youtube.com/watch?v=4DFtoi8HpjQ",
    "youtubeLiveUrl": "https://www.youtube.com/@svbcttdlivetv/live",
    "officialTrustUrl": "https://www.tirumala.org",
    "officialChannel": "@svbcttdlivetv",
    "trustName": "तिरुमला तिरुपति देवस्थानम् (TTD), आंध्र प्रदेश",
    "aartiTime": "सुप्रभात सेवा: 03:00 AM | तोमाला सेवा: 06:00 AM | सहस्र दीपालंकरण: 05:30 PM",
    "description": "कलियुग प्रत्यक्ष देव भगवान श्री वेंकटेश्वर स्वामी जी का नित्य दिव्य दर्शन।",
    "isMajor": true
  },
  {
    "id": "temple-6",
    "name": "श्री सिद्धिविनायक गणपति मंदिर",
    "location": "प्रभादेवी, मुंबई, महाराष्ट्र",
    "status": "LIVE",
    "viewers": 4100,
    "thumbnail": "https://images.unsplash.com/photo-1567591414240-e29f34a1a364?auto=format&fit=crop&w=800&q=80",
    "videoUrl": "https://www.youtube.com/watch?v=46Y16Zs_QBk",
    "youtubeLiveUrl": "https://www.youtube.com/@ShreeSiddhivinayakTemple/live",
    "officialTrustUrl": "https://www.siddhivinayak.org",
    "officialChannel": "@ShreeSiddhivinayakTemple",
    "trustName": "श्री सिद्धिविनायक गणपति मंदिर ट्रस्ट, मुंबई",
    "aartiTime": "काकड़ आरती: 05:30 AM | श्री दर्शन: 07:00 AM | सांध्य: 07:30 PM | शेजारती: 09:50 PM",
    "description": "विघ्नहर्ता बाप्पा का सुखकर्ता दुःखहर्ता महाआरती एवं दर्शन।",
    "isMajor": true
  },
  {
    "id": "temple-7",
    "name": "श्री केदारनाथ ज्योतिर्लिंग",
    "location": "रुद्रप्रयाग, उत्तराखण्ड",
    "status": "LIVE",
    "viewers": 3850,
    "thumbnail": "https://images.unsplash.com/photo-1626083041935-8664188ec968?auto=format&fit=crop&w=800&q=80",
    "videoUrl": "https://www.youtube.com/watch?v=4VRAsxGzRkQ",
    "youtubeLiveUrl": "https://www.youtube.com/@BKTCOfficial/live",
    "officialTrustUrl": "https://badrinath-kedarnath.gov.in",
    "officialChannel": "@BKTCOfficial",
    "trustName": "श्री बद्रीनाथ-केदारनाथ मंदिर समिति (BKTC)",
    "aartiTime": "प्रातः पूजा: 05:00 AM | महाभिषेक: 06:00 PM | सांध्य आरती: 07:00 PM",
    "description": "हिमालय की गोद में स्थित पंच केदारों में मुख्य भगवान केदारनाथ जी का दर्शन।",
    "isMajor": true
  },
  {
    "id": "temple-8",
    "name": "श्री बद्रीनाथ धाम",
    "location": "चमोली, उत्तराखण्ड",
    "status": "LIVE",
    "viewers": 3400,
    "thumbnail": "/acharya-avatar.png",
    "videoUrl": "https://www.youtube.com/watch?v=-UEgquPjKlI",
    "youtubeLiveUrl": "https://www.youtube.com/@BKTCOfficial/live",
    "officialTrustUrl": "https://badrinath-kedarnath.gov.in",
    "officialChannel": "@BKTCOfficial",
    "trustName": "श्री बद्रीनाथ-केदारनाथ मंदिर समिति (BKTC)",
    "aartiTime": "महाभिषेक: 04:30 AM | गीता पाठ: 06:00 PM | शयन: 09:00 PM",
    "description": "भू-वैकुण्ठ श्री बद्रीनारायण भगवान की पावन ज्योति व अखंड दीपक दर्शन।",
    "isMajor": true
  },
  {
    "id": "temple-9",
    "name": "श्री जगन्नाथ मंदिर",
    "location": "पुरी धाम, ओडिशा",
    "status": "LIVE",
    "viewers": 4900,
    "thumbnail": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
    "videoUrl": "https://www.youtube.com/watch?v=GU3TWu76LV0",
    "youtubeLiveUrl": "https://www.youtube.com/@JayJagannathTVofficial/live",
    "officialTrustUrl": "https://shreejagannatha.in",
    "officialChannel": "@JayJagannathTVofficial",
    "trustName": "श्री जगन्नाथ मंदिर प्रशासन (SJTA), पुरी",
    "aartiTime": "मंगला आरती: 06:00 AM | मध्याह्न धूप: 01:00 PM | संध्या: 07:00 PM",
    "description": "नीलाचल धाम से चतुर्धा मूरति श्री जगन्नाथ, बलभद्र व सुभद्रा जी का सजीव दर्शन।",
    "isMajor": true
  },
  {
    "id": "temple-10",
    "name": "माँ वैष्णो देवी धाम",
    "location": "कटरा, जम्मू एवं कश्मीर",
    "status": "LIVE",
    "viewers": 5600,
    "thumbnail": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    "videoUrl": "https://www.youtube.com/watch?v=O2lxDkVGaY8",
    "youtubeLiveUrl": "https://www.youtube.com/@Official.SMVDSB/live",
    "officialTrustUrl": "https://www.maavaishnodevi.org",
    "officialChannel": "@Official.SMVDSB",
    "trustName": "श्री माता वैष्णो देवी श्राइन बोर्ड (SMVDSB), कटरा",
    "aartiTime": "प्रातः दिव्य आरती: 06:00 AM | सांध्य महाआरती: 07:00 PM",
    "description": "त्रिकूट पर्वत पर स्थित पावन पिंडी स्वरूप माँ भगवती वैष्णो देवी दर्शन।",
    "isMajor": true
  },
  {
    "id": "temple-11",
    "name": "श्री शिरडी साईं बाबा मंदिर",
    "location": "शिरडी, महाराष्ट्र",
    "status": "LIVE",
    "viewers": 4300,
    "thumbnail": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    "videoUrl": "https://www.youtube.com/watch?v=1C6fsghQ8CM",
    "youtubeLiveUrl": "https://www.youtube.com/@saibabasansthantrust/live",
    "officialTrustUrl": "https://sai.org.in",
    "officialChannel": "@saibabasansthantrust",
    "trustName": "श्री साईबाबा संस्थान ट्रस्ट, शिरडी",
    "aartiTime": "काकड़ आरती: 04:30 AM | मध्याह्न: 12:00 PM | शेजारती: 10:30 PM",
    "description": "समाधि मंदिर से श्री साईं बाबा की पावन काकड़ आरती एवं नित्य दर्शन।",
    "isMajor": true
  },
  {
    "id": "temple-12",
    "name": "श्री ओंकारेश्वर ज्योतिर्लिंग",
    "location": "खंडवा, मध्य प्रदेश",
    "status": "LIVE",
    "viewers": 3100,
    "thumbnail": "https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=800&q=80",
    "videoUrl": "https://www.youtube.com/watch?v=WfewWrMCfHE",
    "youtubeLiveUrl": "https://www.youtube.com/@ShriOmkarOfficial/live",
    "officialTrustUrl": "https://www.shriomkareshwar.org",
    "officialChannel": "@ShriOmkarOfficial",
    "trustName": "श्री ओंकारेश्वर ज्योतिर्लिंग मंदिर ट्रस्ट",
    "aartiTime": "मंगला आरती: 05:00 AM | मध्याह्न भोग: 12:20 PM | शयन: 08:30 PM",
    "description": "नर्मदा तट पर ॐ आकार पर्वत पर विराजमान श्री ओंकारेश्वर महादेव।",
    "isMajor": true
  },
  {
    "id": "temple-13",
    "name": "माँ मंगला गौरी शक्तिपीठ",
    "location": "वाराणसी (काशी), उत्तर प्रदेश",
    "status": "LIVE",
    "viewers": 2950,
    "thumbnail": "/acharya-avatar.png",
    "videoUrl": "https://www.youtube.com/watch?v=XcAxRyJ0DBQ",
    "youtubeLiveUrl": "https://www.youtube.com/@ShreeKashiVishwanathMandir/live",
    "officialTrustUrl": "https://shrikashivishwanath.org",
    "officialChannel": "@ShreeKashiVishwanathMandir",
    "trustName": "माँ मंगला गौरी शक्तिपीठ, काशी धाम (आचार्य शिवेश शर्मा)",
    "aartiTime": "मंगला आरती: 05:30 AM | सांध्य शृंगार: 07:30 PM",
    "description": "काशी में गंगा तट पर स्थित पावन शक्तिपीठ माँ मंगला गौरी का सीधा दर्शन।",
    "isMajor": true
  }
];
const RAMA_CHAUPAIS = [
  {
    "id": 1,
    "chaupai": "सुनु सिय सत्य असीस हमारी। पूजिहि मन कामना तुम्हारी॥",
    "kand": "बालकाण्ड (माँ गौरी का श्री सीता जी को पावन आशीर्वाद)",
    "verdict": "अत्यंत शुभ (सफलता निश्चित)",
    "verdictType": "excellent",
    "color": "from-emerald-500 to-teal-700",
    "meaning": "आपका प्रश्न जिस कार्य के लिए है, वह निश्चित रूप से सिद्ध होगा। भगवान श्री राम एवं माँ भगवती की पूर्ण कृपा है। मन में कोई संदेह न रखें।"
  },
  {
    "id": 2,
    "chaupai": "प्रबिसि नगर कीजै सब काजा। हृदयँ राखि कोसलपुर राजा॥",
    "kand": "सुंदरकाण्ड (श्री हनुमान जी का लंका प्रवेश)",
    "verdict": "शुभ एवं शीघ्र कार्यसिद्धि",
    "verdictType": "good",
    "color": "from-amber-500 to-orange-600",
    "meaning": "भगवान श्री राम को हृदय में धारण कर कार्य प्रारंभ करें। समस्त विघ्न बाधाएं स्वतः समाप्त होंगी और कार्य में सफलता प्राप्त होगी।"
  },
  {
    "id": 3,
    "chaupai": "उघरहिं बिमल बिलोचन ही के। मिटहिं दोष दुख भव रजनी के॥",
    "kand": "बालकाण्ड (गुरु कृपा एवं संशय निवारण)",
    "verdict": "शुभ (संशय दूर होगा)",
    "verdictType": "good",
    "color": "from-blue-500 to-indigo-600",
    "meaning": "आपके मन की दुविधा और संशय शीघ्र दूर होंगे। ज्ञान और विवेक से निर्णय लें, समस्त कष्टों व भ्रम का नाश होगा।"
  },
  {
    "id": 4,
    "chaupai": "गरल सुधा रिपु करहिं मिताई। गोपद सिंधु अनल सितलाई॥",
    "kand": "सुंदरकाण्ड (प्रभु कृपा का अलौकिक प्रभाव)",
    "verdict": "अत्यंत कल्याणकारी (चमत्कारी फल)",
    "verdictType": "excellent",
    "color": "from-emerald-600 to-green-700",
    "meaning": "ईश्वर की कृपा से विष भी अमृत बन जाएगा, शत्रु भी मित्र बन जाएंगे और कठिन से कठिन कार्य भी सहज ही संपन्न हो जाएगा।"
  },
  {
    "id": 5,
    "chaupai": "बिधि बस सुजन कुसंगत परहीं। फनि मनि सम निज गुन अनुसरहीं॥",
    "kand": "बालकाण्ड (सत्संग एवं धैर्य महिमा)",
    "verdict": "सावधानी आवश्यक (धैर्य रखें)",
    "verdictType": "caution",
    "color": "from-yellow-600 to-amber-700",
    "meaning": "वर्तमान समय में कुछ प्रतिकूलता या गलत संगति का प्रभाव हो सकता है। अपने सद्विचार व आचरण को न छोड़ें, धैर्य रखें।"
  },
  {
    "id": 6,
    "chaupai": "मुद मंगलमय संत समाजू। जिमि जग जंगम तीरथराजू॥",
    "kand": "बालकाण्ड (संत समाज वंदना)",
    "verdict": "शुभ (सज्जनों के सहयोग से लाभ)",
    "verdictType": "good",
    "color": "from-orange-500 to-rose-600",
    "meaning": "घर के बड़ों, गुरुजनों अथवा विद्वानों के परामर्श से कार्य करें। सत्संग, तीर्थाटन अथवा धार्मिक अनुष्ठान करने से कार्य सिद्ध होगा।"
  },
  {
    "id": 7,
    "chaupai": "बरुन कुबेर सुरेस समीरा। रन सनमुख धरि काहुँ न धीरा॥",
    "kand": "लंकाकाण्ड (कठिनाई व संघर्ष विचार)",
    "verdict": "कार्य में बाधा (अभी टालें)",
    "verdictType": "caution",
    "color": "from-rose-600 to-red-700",
    "meaning": "इस कार्य में अधिक विरोध और कठिनाइयों का सामना करना पड़ सकता है। फिलहाल इस कार्य को कुछ समय के लिए स्थगित करना ही हितकर है।"
  },
  {
    "id": 8,
    "chaupai": "सुफल मनोरथ होहुँ तुम्हारे। रामु लखनु सुनि भए सुखारे॥",
    "kand": "बालकाण्ड (महर्षि विश्वामित्र जी का आशीर्वाद)",
    "verdict": "सर्वोत्तम फल (मनोरथ पूर्ण)",
    "verdictType": "excellent",
    "color": "from-emerald-500 to-amber-600",
    "meaning": "आपके मन की अभिलाषा पूर्ण होगी। जिस उद्देश्य से आपने विचार किया है, उसमें विजय, यश और पूर्ण संतुष्टि प्राप्त होगी।"
  },
  {
    "id": 9,
    "chaupai": "होइहि सोइ जो राम रचि राखा। को करि तर्क बढ़ावै साखा॥",
    "kand": "बालकाण्ड (शिव-पार्वती संवाद)",
    "verdict": "ईश्वर इच्छा पर छोड़ें (शांति रखें)",
    "verdictType": "neutral",
    "color": "from-purple-600 to-indigo-700",
    "meaning": "व्यर्थ चिंता और तर्क-वितर्क न करें। जो ईश्वर की योजना में है वही होगा, निष्काम भाव से अपना कर्तव्य करते रहें, शांति मिलेगी।"
  }
];
const RAMA_LETTERS = [
  "सु",
  "प्र",
  "उ",
  "ग",
  "बि",
  "मु",
  "ब",
  "सु",
  "हो",
  "नु",
  "बि",
  "घ",
  "र",
  "धि",
  "द",
  "रु",
  "फ",
  "इ",
  "सि",
  "सि",
  "र",
  "ल",
  "ब",
  "मं",
  "न",
  "ल",
  "हि",
  "य",
  "न",
  "हिं",
  "सु",
  "स",
  "ग",
  "कु",
  "म",
  "सो",
  "स",
  "ग",
  "बि",
  "धा",
  "सु",
  "ल",
  "बे",
  "नो",
  "इ",
  "त्य",
  "र",
  "म",
  "रि",
  "जन",
  "म",
  "र",
  "रथ",
  "जो",
  "अ",
  "की",
  "ल",
  "पु",
  "कु",
  "य",
  "सु",
  "हो",
  "रा",
  "सी",
  "जै",
  "बि",
  "क",
  "सं",
  "सं",
  "रे",
  "हुँ",
  "म",
  "स",
  "सब",
  "लो",
  "र",
  "ग",
  "त",
  "स",
  "तु",
  "र",
  "ह",
  "का",
  "च",
  "हिं",
  "त",
  "स",
  "स",
  "म्हा",
  "चि",
  "मा",
  "जा",
  "न",
  "मि",
  "प",
  "मा",
  "मी",
  "रे",
  "रा",
  "री",
  "हृ",
  "ही",
  "ता",
  "र",
  "जू",
  "रा",
  "रा",
  "खा",
  "पू",
  "द",
  "के",
  "ई",
  "हीं",
  "जि",
  "रन",
  "मु",
  "को",
  "जि",
  "यं",
  "मि",
  "गो",
  "फ",
  "मि",
  "स",
  "ल",
  "क",
  "हि",
  "रा",
  "ट",
  "पद",
  "नि",
  "जग",
  "न",
  "ख",
  "रि",
  "मन",
  "खि",
  "हिं",
  "सिं",
  "म",
  "जं",
  "मु",
  "नु",
  "त",
  "का",
  "को",
  "दो",
  "धु",
  "नि",
  "गम",
  "ख",
  "सु",
  "र्क",
  "म",
  "स",
  "ष",
  "अ",
  "निज",
  "ती",
  "ध",
  "नि",
  "ब",
  "ना",
  "ल",
  "दु",
  "न",
  "गु",
  "र",
  "रि",
  "भ",
  "ढ़ा",
  "तु",
  "पु",
  "ख",
  "ल",
  "न",
  "थ",
  "का",
  "ए",
  "वै",
  "म्हा",
  "र",
  "भ",
  "सि",
  "अ",
  "रा",
  "हुँ",
  "सु",
  "सा",
  "री",
  "रा",
  "व",
  "त",
  "नु",
  "जू",
  "न",
  "खा",
  "जा",
  "र",
  "ला",
  "स",
  "रे",
  "धी",
  "रे",
  "ई",
  "नी",
  "ई",
  "र",
  "रा"
];
const RASHIFAL_DATA = [
  {
    "id": "aries",
    "name": "मेष",
    "englishName": "Aries",
    "symbol": "♈",
    "icon": "🐏",
    "lord": "मंगल (Mars)",
    "element": "अग्नि (Fire)",
    "letters": "चू, चे, चो, ला, ली, लू, ले, लो, अ",
    "colorHex": "#ef4444",
    "bgGradient": "from-red-950 via-orange-950 to-amber-950",
    "borderColor": "border-red-500/70",
    "accentColor": "text-red-400",
    "qualities": "साहसी, ऊर्जावान, नेतृत्वशील"
  },
  {
    "id": "taurus",
    "name": "वृषभ",
    "englishName": "Taurus",
    "symbol": "♉",
    "icon": "🐂",
    "lord": "शुक्र (Venus)",
    "element": "पृथ्वी (Earth)",
    "letters": "ई, ऊ, ए, ओ, वा, वी, वू, वे, वो",
    "colorHex": "#10b981",
    "bgGradient": "from-emerald-950 via-teal-950 to-stone-950",
    "borderColor": "border-emerald-500/70",
    "accentColor": "text-emerald-400",
    "qualities": "धैर्यवान, स्थिर, कलाप्रेमी"
  },
  {
    "id": "gemini",
    "name": "मिथुन",
    "englishName": "Gemini",
    "symbol": "♊",
    "icon": "👥",
    "lord": "बुध (Mercury)",
    "element": "वायु (Air)",
    "letters": "का, की, कू, घ, ङ, छ, के, को, ह",
    "colorHex": "#06b6d4",
    "bgGradient": "from-cyan-950 via-sky-950 to-stone-950",
    "borderColor": "border-cyan-500/70",
    "accentColor": "text-cyan-400",
    "qualities": "बुद्धिमान, मिलनसार, बहुमुखी"
  },
  {
    "id": "cancer",
    "name": "कर्क",
    "englishName": "Cancer",
    "symbol": "♋",
    "icon": "🦀",
    "lord": "चन्द्रमा (Moon)",
    "element": "जल (Water)",
    "letters": "ही, हू, हे, हो, डा, डी, डू, डे, डो",
    "colorHex": "#e0e7ff",
    "bgGradient": "from-slate-900 via-indigo-950 to-stone-950",
    "borderColor": "border-indigo-400/70",
    "accentColor": "text-indigo-300",
    "qualities": "संवेदनशील, करुणामयी, कल्पनाशक्ति"
  },
  {
    "id": "leo",
    "name": "सिंह",
    "englishName": "Leo",
    "symbol": "♌",
    "icon": "🦁",
    "lord": "भगवान सूर्य (Sun)",
    "element": "अग्नि (Fire)",
    "letters": "मा, मी, मू, मे, मो, टा, टी, टू, टे",
    "colorHex": "#f59e0b",
    "bgGradient": "from-amber-950 via-orange-950 to-stone-950",
    "borderColor": "border-amber-400/80",
    "accentColor": "text-amber-300",
    "qualities": "तेजस्वी, स्वाभिमानी, उदार"
  },
  {
    "id": "virgo",
    "name": "कन्या",
    "englishName": "Virgo",
    "symbol": "♍",
    "icon": "👧",
    "lord": "बुध (Mercury)",
    "element": "पृथ्वी (Earth)",
    "letters": "ढो, पा, पी, पू, ष, ण, ठ, पे, पो",
    "colorHex": "#14b8a6",
    "bgGradient": "from-teal-950 via-emerald-950 to-stone-950",
    "borderColor": "border-teal-400/70",
    "accentColor": "text-teal-300",
    "qualities": "विश्लेषक, कर्तव्यनिष्ठ, व्यावहारिक"
  },
  {
    "id": "libra",
    "name": "तुला",
    "englishName": "Libra",
    "symbol": "♎",
    "icon": "⚖️",
    "lord": "शुक्र (Venus)",
    "element": "वायु (Air)",
    "letters": "रा, री, रू, रे, रो, ता, ती, तू, ते",
    "colorHex": "#ec4899",
    "bgGradient": "from-pink-950 via-rose-950 to-stone-950",
    "borderColor": "border-pink-400/70",
    "accentColor": "text-pink-300",
    "qualities": "संतुलित, न्यायप्रिय, सुरुचिपूर्ण"
  },
  {
    "id": "scorpio",
    "name": "वृश्चिक",
    "englishName": "Scorpio",
    "symbol": "♏",
    "icon": "🦂",
    "lord": "मंगल (Mars)",
    "element": "जल (Water)",
    "letters": "तो, ना, नी, नू, ने, नो, या, यी, यू",
    "colorHex": "#b91c1c",
    "bgGradient": "from-red-950 via-rose-950 to-stone-950",
    "borderColor": "border-red-600/80",
    "accentColor": "text-red-400",
    "qualities": "दृढ़ निश्चयी, रहस्यमयी, पराक्रमी"
  },
  {
    "id": "sagittarius",
    "name": "धनु",
    "englishName": "Sagittarius",
    "symbol": "♐",
    "icon": "🏹",
    "lord": "देवगुरु बृहस्पति (Jupiter)",
    "element": "अग्नि (Fire)",
    "letters": "ये, यो, भा, भी, भू, धा, फा, ढा, भे",
    "colorHex": "#eab308",
    "bgGradient": "from-yellow-950 via-amber-950 to-stone-950",
    "borderColor": "border-yellow-400/80",
    "accentColor": "text-yellow-300",
    "qualities": "ज्ञानवान, धर्मनिष्ठ, आशावादी"
  },
  {
    "id": "capricorn",
    "name": "मकर",
    "englishName": "Capricorn",
    "symbol": "♑",
    "icon": "🐊",
    "lord": "शनिदेव (Saturn)",
    "element": "पृथ्वी (Earth)",
    "letters": "भो, जा, जी, खी, खू, खे, खो, गा, गी",
    "colorHex": "#64748b",
    "bgGradient": "from-slate-950 via-stone-900 to-black",
    "borderColor": "border-slate-400/70",
    "accentColor": "text-slate-300",
    "qualities": "परिश्रमी, अनुशासित, व्यावहारिक"
  },
  {
    "id": "aquarius",
    "name": "कुम्भ",
    "englishName": "Aquarius",
    "symbol": "♒",
    "icon": "🏺",
    "lord": "शनिदेव (Saturn)",
    "element": "वायु (Air)",
    "letters": "गू, गे, गो, सा, सी, सू, से, सो, दा",
    "colorHex": "#3b82f6",
    "bgGradient": "from-blue-950 via-slate-900 to-stone-950",
    "borderColor": "border-blue-500/70",
    "accentColor": "text-blue-300",
    "qualities": "मानवतावादी, दूरदर्शी, सत्यप्रिय"
  },
  {
    "id": "pisces",
    "name": "मीन",
    "englishName": "Pisces",
    "symbol": "♓",
    "icon": "🐟",
    "lord": "देवगुरु बृहस्पति (Jupiter)",
    "element": "जल (Water)",
    "letters": "दी, दू, थ, झ, ञ, दे, दो, चा, ची",
    "colorHex": "#a855f7",
    "bgGradient": "from-purple-950 via-indigo-950 to-stone-950",
    "borderColor": "border-purple-400/80",
    "accentColor": "text-purple-300",
    "qualities": "आध्यात्मिक, करुणामय, अंतर्ज्ञानी"
  }
];
const FESTIVALS_DATA = [
  {
    "id": "fest-2026-11-06-rama-ekadashi",
    "title": "रमा एकादशी व्रत (माँ लक्ष्मी कृपा)",
    "date": "2026-11-06",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक कृष्ण एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री हरि विष्णु एवं माता रमा (लक्ष्मी)",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 06:40 AM - 10:15 AM",
    "paranaSlot": "07 नवम्बर प्रातः 06:40 AM - 08:52 AM (द्वादशी तिथि)",
    "fastType": "फलाहार / निर्जला व्रत",
    "significance": "कार्तिक मास के कृष्ण पक्ष की रमा एकादशी समस्त पापों का शमन करने वाली तथा माता लक्ष्मी (रमा) के विशेष अनुग्रह से धन, ऐश्वर्य व सौभाग्य प्रदान करती है।",
    "pujaVidhi": "प्रातः स्नान कर भगवान विष्णु को पीले पुष्प, पंचामृत व तुलसी दल अर्पित करें। ॐ नमो भगवते वासुदेवाय का जप करें। द्वादशी को पारण समय में व्रत खोलें।",
    "recommendedMantra": "ॐ श्रीं ह्रीं क्लीं रमायै नमः | ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "विष्णु सहस्रनाम एवं श्री सूक्त",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2026-11-07-dhanteras",
    "title": "धनतेरस एवं भगवान धन्वन्तरि जयंती (यम दीपदान)",
    "date": "2026-11-07",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक कृष्ण त्रयोदशी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "भगवान धन्वन्तरि, माँ लक्ष्मी एवं श्री कुबेर",
    "emoji": "🪙",
    "shubhTime": "प्रदोष काल दीपदान: सायं 05:32 PM - 08:12 PM | धन्वन्तरि पूजन: 06:05 PM - 07:45 PM",
    "paranaSlot": null,
    "fastType": "यम दीपदान एवं आरोग्य अनुष्ठान",
    "significance": "समुद्र मंथन से अमृत कलश लेकर प्रकट हुए आयुर्वेद के जनक भगवान धन्वन्तरि का पूजन करने से असाध्य रोगों से मुक्ति एवं १३ गुना धन वृद्धि होती है। इस सायं दक्षिण दिशा में चौमुखा यम दीपदान अनिवार्य है।",
    "pujaVidhi": "नवीन पीतल, तांबा या चांदी का पात्र क्रय करें। प्रदोष काल में धन्वन्तरि देव व कुबेर जी की षोडशोपचार पूजा करें। मुख्य द्वार पर यमराज के निमित्त चौमुखा दीपक रखें।",
    "recommendedMantra": "ॐ धं धन्वन्तरये नमः | ॐ यक्षाय कुबेराय वैश्रवणाय धनधान्याधिपतये नमः",
    "recommendedStotra": "धन्वन्तरि अमृत स्तोत्र एवं कुबेर अष्टकम",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2026-11-07-shani-pradosh",
    "title": "शनि प्रदोष व्रत (कार्तिक कृष्ण)",
    "date": "2026-11-07",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक कृष्ण त्रयोदशी",
    "category": "pradosh_shivratri",
    "categoryLabel": "प्रदोष व्रत",
    "deity": "देवाधिदेव महादेव शिव एवं शनिदेव",
    "emoji": "🔱",
    "shubhTime": "प्रदोष काल पूजा: सायं 05:32 PM - 08:12 PM",
    "paranaSlot": null,
    "fastType": "प्रदोष व्रत / फलाहार",
    "significance": "शनिवार को पड़ने वाला प्रदोष व्रत अत्यंत दुर्लभ व शक्तिशाली माना गया है। इससे शनि की साढ़ेसाती, ढैय्या एवं असाध्य कष्टों का निवारण होता है तथा पुत्र व धन लाभ मिलता है।",
    "pujaVidhi": "सूर्यास्त के उपरांत शिवलिंग पर कच्चा दूध, गंगाजल, काले तिल व बेलपत्र अर्पित करें। महामृत्युंजय मंत्र की ५ माला जपें।",
    "recommendedMantra": "ॐ नमः शिवाय | ॐ शं शनैश्चराय नमः",
    "recommendedStotra": "दारिद्र्य दहन शिव स्तोत्र एवं शिव तांडव स्तोत्र",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2026-11-08-narak-chaturdashi",
    "title": "नरक चतुर्दशी (रूप चौदस / छोटी दीवाली)",
    "date": "2026-11-08",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक कृष्ण चतुर्दशी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "श्री कृष्ण, यमराज एवं माँ काली",
    "emoji": "🪔",
    "shubhTime": "अभ्यंग स्नान: प्रातः 05:08 AM - 06:38 AM | दीपदान: सायं 05:35 PM",
    "paranaSlot": null,
    "fastType": "उबटन स्नान व दीपदान",
    "significance": "भगवान श्री कृष्ण द्वारा नरकासुर वध का दिवस। सूर्योदय से पूर्व उबटन व तिल के तेल से अभ्यंग स्नान करने से रूप-सौंदर्य और यम यातना से मुक्ति मिलती है।",
    "pujaVidhi": "प्रातः उबटन लगाकर स्नान करें। सायं गृह में १४ दीपक यमराज व पूर्वजों के निमित्त प्रज्वलित करें।",
    "recommendedMantra": "ॐ यमाय नमः | ॐ क्रीं कालिकायै नमः",
    "recommendedStotra": "यमराज स्तुति एवं काली कवच",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2026-11-08-diwali",
    "title": "दीपावली महालक्ष्मी पूजन एवं कुबेर आराधना",
    "date": "2026-11-08",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक कृष्ण अमावस्या",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "माँ महालक्ष्मी, विघ्नहर्ता गणेश एवं श्री कुबेर",
    "emoji": "🪔",
    "shubhTime": "प्रदोष काल (वृषभ स्थिर लग्न): सायं 05:35 PM - 07:32 PM | महानिशीथ काल (सिंह लग्न): 11:38 PM - 12:31 AM",
    "paranaSlot": null,
    "fastType": "महालक्ष्मी आराधना व्रत",
    "significance": "सनातन धर्म का सर्वोच्च प्रकाश पर्व। समुद्र मंथन से प्रकट हुई महालक्ष्मी स्थिर लग्न में घर व व्यापार प्रतिष्ठान में पदार्पण करती हैं। इस रात्रि का पूजन वर्ष भर दरिद्रता का नाश करता है।",
    "pujaVidhi": "उत्तर या ईशान कोण में चौकी सजाकर लक्ष्मी-गणेश व कुबेर जी की षोडशोपचार पूजा करें। कमल गट्टे, कमलगट्टा माला, खीर, बताशे व कौड़ियां अर्पित करें। श्री सूक्त के १६ ऋचाओं का पाठ करें।",
    "recommendedMantra": "ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः | ॐ गं गणपतये नमः",
    "recommendedStotra": "कनकधारा स्तोत्र एवं श्री सूक्तम्",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2026-11-08-amavasya",
    "title": "कार्तिक अमावस्या (पितृ श्राद्ध व स्नान)",
    "date": "2026-11-08",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक कृष्ण अमावस्या",
    "category": "purnima_amavasya",
    "categoryLabel": "पूर्णिमा व अमावस्या",
    "deity": "पितृदेव एवं धर्मराज यम",
    "emoji": "🌑",
    "shubhTime": "पितृ तर्पण व दान: प्रातः 09:30 AM - दोपहर 12:30 PM",
    "paranaSlot": null,
    "fastType": "पितृ तर्पण व अन्न दान",
    "significance": "कार्तिक अमावस्या को तीर्थ स्नान, दीपदान तथा पितरों के निमित्त अन्न-वस्त्र दान से पितृ दोष शांत होता है और कुल की वृद्धि होती है।",
    "pujaVidhi": "गंगाजल, तिल व कुश से पितृ तर्पण करें। ब्राह्मणों व जरूरतमंदों को भोजन कराएं।",
    "recommendedMantra": "ॐ पितृभ्यो नमः | ॐ देवताभ्यः पितृभ्यश्च महायोगिभ्य एव च",
    "recommendedStotra": "पितृ स्तोत्रम्",
    "recommendedPuja": "त्रिपिंडी श्राद्ध एवं पितृदोष शांति",
    "pujaId": "puja-3"
  },
  {
    "id": "fest-2026-11-10-govardhan",
    "title": "गोवर्धन पूजा एवं अन्नकूट महोत्सव",
    "date": "2026-11-10",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक शुक्ल प्रतिपदा",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "भगवान श्री कृष्ण एवं गोवर्धन पर्वत",
    "emoji": "🏔️",
    "shubhTime": "प्रातः पूजन: 06:38 AM - 08:50 AM | सायं गोधूलि वेला: 05:25 PM - 07:05 PM",
    "paranaSlot": null,
    "fastType": "अन्नकूट महाप्रसाद भोग",
    "significance": "इन्द्र का मान मर्दन कर भगवान कृष्ण ने कनिष्ठिका उंगली पर गोवर्धन पर्वत उठाकर ब्रजवासियों की रक्षा की थी। इस दिन गौ माता का पूजन और ५६ भोग अन्नकूट अर्पित करने से अन्न-धन के भण्डार भरे रहते हैं।",
    "pujaVidhi": "गोबर से गोवर्धन पर्वत बनाकर पुष्प, धूप व दीप से पूजा करें। गौ माता को गुड़ व हरी घास खिलाएं। ५६ भोग अर्पित करें।",
    "recommendedMantra": "गोवर्धन धराधारी गोकुल त्राणकारक। विष्णु रूप प्रभो पाहि मम विघ्नैर्निवारय॥",
    "recommendedStotra": "गोपाल सहस्रनाम एवं मधुराष्टकम",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2026-11-11-bhaidooj",
    "title": "भैया दूज / यम द्वितीया (भाई-बहन का पावन पर्व)",
    "date": "2026-11-11",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक शुक्ल द्वितीया",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "धर्मराज यम एवं यमुना मैया",
    "emoji": "🎁",
    "shubhTime": "तिलक व पूजन मुहूर्त: दोपहर 01:10 PM - 03:22 PM",
    "paranaSlot": null,
    "fastType": "भ्रातृ तिलक व मिष्ठान्न भोग",
    "significance": "इस दिन बहन के घर भोजन करने और यमुना स्नान से भाई को अकाल मृत्यु का भय नहीं रहता तथा धर्मराज यम का आशीर्वाद प्राप्त होता है।",
    "pujaVidhi": "बहनें अपने भाई को पूर्व या उत्तर मुख बिठाकर रोली, अक्षत का तिलक लगाएं, आरती उतारें और मिष्ठान्न खिलाएं। भाई बहनों को उपहार दें।",
    "recommendedMantra": "धर्मराज नमस्तुभ्यं नमस्ते यमुनाग्रज। पाहि मां सर्वपापेभ्यो यमदूतभयान्निवृत्॥",
    "recommendedStotra": "यमुनाष्टकम्",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2026-11-13-vinayaka-chaturthi",
    "title": "विनायक चतुर्थी व्रत (कार्तिक शुक्ल)",
    "date": "2026-11-13",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक शुक्ल चतुर्थी",
    "category": "chaturthi",
    "categoryLabel": "चतुर्थी व्रत",
    "deity": "विघ्नहर्ता श्री गणेश जी",
    "emoji": "🐘",
    "shubhTime": "मध्याह्न गणेश पूजन: पूर्वाह्न 11:05 AM - दोपहर 01:20 PM",
    "paranaSlot": null,
    "fastType": "फलाहार व्रत",
    "significance": "शुक्ल पक्ष की चतुर्थी को विनायक चतुर्थी कहा जाता है। दोपहर में विघ्नविनाशक श्री गणेश जी की २१ दूर्वा व मोदक से पूजा करने से व्यापार व अध्ययन में सफलता मिलती है।",
    "pujaVidhi": "मध्याह्न काल में गणेश जी को सिंदूर, दूर्वा, लाल पुष्प व मोदक अर्पित करें। गणेश चालीसा व अथर्वशीर्ष का पाठ करें।",
    "recommendedMantra": "ॐ वक्रतुण्डाय हुम् | ॐ श्री गणेशाय नमः",
    "recommendedStotra": "श्री संकटनाशन गणेश स्तोत्रम्",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2026-11-15-chhath-sandhya",
    "title": "सूर्य षष्ठी डाला छठ महापर्व (सांध्य अर्घ्य)",
    "date": "2026-11-15",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक शुक्ल षष्ठी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "भगवान भुवन भास्कर सूर्य एवं षष्ठी देवी (छठी मैया)",
    "emoji": "☀️",
    "shubhTime": "अस्ताचलगामी सूर्य अर्घ्य: सायं 05:24 PM",
    "paranaSlot": null,
    "fastType": "३६ घण्टे का निर्जला महाव्रत",
    "significance": "सनातन संस्कृति का सबसे कठिन एवं शुद्ध सूर्य महापर्व। संतान दीर्घायु, आरोग्य, नेत्र ज्योति और असाध्य चर्मरोगों के निवारण हेतु प्रत्यक्ष देवता सूर्य नारायण की उपासना।",
    "pujaVidhi": "सूप में ठेकुआ, मौसमी फल, ईख व दीप सजाकर पवित्र नदी या सरोवर के जल में खड़े होकर अस्ताचल सूर्य को दूध व जल से अर्घ्य दें।",
    "recommendedMantra": "ॐ घृणिः सूर्याय नमः | ॐ एहि सूर्य सहस्त्रांशो तेजोराशे जगत्पते। अनुकम्पय मां भक्त्या गृहाणार्घ्यं दिवाकर॥",
    "recommendedStotra": "आदित्य हृदय स्तोत्रम्",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2026-11-16-chhath-usha",
    "title": "सूर्य षष्ठी डाला छठ (उषा अर्घ्य व व्रत पारण)",
    "date": "2026-11-16",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक शुक्ल सप्तमी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "भगवान भुवन भास्कर सूर्य एवं छठी मैया",
    "emoji": "🌅",
    "shubhTime": "उदीयमान सूर्य अर्घ्य: प्रातः 06:42 AM | व्रत पारण: प्रातः 07:15 AM उपरांत",
    "paranaSlot": "प्रातः 07:15 AM उपरांत",
    "fastType": "महाव्रत पारण",
    "significance": "उदीयमान भुवन भास्कर को अर्घ्य देकर ३६ घण्टे का कठोर निर्जला व्रत पूर्ण होता है। छठी मैया संतान सुख व वंश वृद्धि का वरदान देती हैं।",
    "pujaVidhi": "अरुणोदय काल में जल में खड़े होकर उदीयमान सूर्य को अर्घ्य दें। छठी मैया को प्रणाम कर ठेकुआ व अदरक का प्रसाद ग्रहण कर पारण करें।",
    "recommendedMantra": "ॐ सूर्याय नमः | ॐ भास्कराय नमः",
    "recommendedStotra": "सूर्य चालीसा एवं गायत्री मंत्र",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2026-11-17-gopashtami",
    "title": "गोपाष्टमी (गौ माता एवं भगवान श्री कृष्ण पूजन)",
    "date": "2026-11-17",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक शुक्ल अष्टमी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "कामधेनु गौ माता एवं भगवान श्री कृष्ण",
    "emoji": "🐄",
    "shubhTime": "गौ पूजन मुहूर्त: प्रातः 07:15 AM - 10:30 AM",
    "paranaSlot": null,
    "fastType": "गौ सेवा एवं पूजन",
    "significance": "भगवान श्री कृष्ण ने इसी दिन विधिवत गो-चारण प्रारम्भ किया था। गौ माता के शरीर में ३३ कोटि देवताओं का वास होता है। इस दिन गौ सेवा से समस्त ग्रह दोष शांत होते हैं।",
    "pujaVidhi": "गौ माता को स्नान कराकर रोली, अक्षत, पुष्प चढ़ाएं, सींगों में तेल लगाएं और गुड़, हरा चारा खिलाकर परिक्रमा करें।",
    "recommendedMantra": "नमो गोभ्यः श्रीमतीभ्यः सौरभेयीभ्य एव च। नमो ब्रह्मसुताभ्यश्च पवित्राभ्यो नमो नमः॥",
    "recommendedStotra": "कामधेनु स्तोत्रम्",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2026-11-20-devutthana",
    "title": "देवउठनी एकादशी (प्रबोधिनी एकादशी) एवं पावन तुलसी विवाह प्रारम्भ",
    "date": "2026-11-20",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक शुक्ल एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान शालिग्राम एवं माता तुलसी",
    "emoji": "🪷",
    "shubhTime": "तुलसी विवाह गोधूलि वेला: सायं 05:15 PM - 07:00 PM | विष्णु पूजन: प्रातः काल",
    "paranaSlot": "21 नवम्बर प्रातः 06:48 AM - 08:52 AM (द्वादशी तिथि)",
    "fastType": "सर्वोत्तम एकादशी व्रत",
    "significance": "चार मास के योगनिद्रा उपरांत जगत्पालक भगवान विष्णु जागते हैं और चातुर्मास समाप्त होता है। इसी पावन दिन से समस्त शुभ विवाह, गृह प्रवेश आदि मांगलिक कार्य प्रारम्भ होते हैं। तुलसी विवाह से कन्यादान तुल्य फल मिलता है।",
    "pujaVidhi": "ईख का मंडप बनाकर शालिग्राम जी और तुलसी जी का विवाह कराएं। लाल चुनरी, रोली, हल्दी व सिंदूर अर्पित करें। एकादशी महात्म्य सुनें।",
    "recommendedMantra": "उत्तिष्ठोत्तिष्ठ गोविन्द उत्तिष्ठ गरुड़ध्वज। उत्तिष्ठ कमलाकांत त्रैलोक्यं मंगलं कुरु॥",
    "recommendedStotra": "तुलसी स्तोत्र एवं श्री दामोदर अष्टकम",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2026-11-21-shani-pradosh-kartik",
    "title": "शनि प्रदोष व्रत (कार्तिक शुक्ल)",
    "date": "2026-11-21",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक शुक्ल त्रयोदशी",
    "category": "pradosh_shivratri",
    "categoryLabel": "प्रदोष व्रत",
    "deity": "देवाधिदेव महादेव शिव",
    "emoji": "🔱",
    "shubhTime": "प्रदोष काल पूजा: सायं 05:18 PM - 07:55 PM",
    "paranaSlot": null,
    "fastType": "प्रदोष व्रत / फलाहार",
    "significance": "कार्तिक शुक्ल त्रयोदशी का शनि प्रदोष व्रत संतान सुख, आयु वृद्धि और दीर्घकालिक रोगों से मुक्ति प्रदान करता है।",
    "pujaVidhi": "प्रदोष वेला में भगवान शिव का पंचामृत व गन्ने के रस से अभिषेक करें। ११ बेलपत्र चढ़ाएं।",
    "recommendedMantra": "ॐ तत्पुरुषाय विद्महे महादेवाय धीमहि तन्नो रुद्रः प्रचोदयात्",
    "recommendedStotra": "शिव पंचाक्षर स्तोत्रम्",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2026-11-24-devdeepawali",
    "title": "कार्तिक पूर्णिमा एवं काशी देव दीपावली महामहोत्सव",
    "date": "2026-11-24",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक पूर्णिमा",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "त्रिपुरारी महादेव शिव एवं माँ गंगा",
    "emoji": "🔥",
    "shubhTime": "प्रदोष काल दीपदान: सायं 05:12 PM - 07:48 PM (काशी के ८४ घाटों पर दीप ज्योति)",
    "paranaSlot": null,
    "fastType": "पूर्णिमा व्रत व दीपदान",
    "significance": "भगवान शिव द्वारा त्रिपुरासुर वध उपरांत समस्त देवगण काशी के गंगा तट पर दीप प्रज्वलित करने आते हैं। पञ्चगंगा व मंगला गौरी घाट पर दीपदान का अनंत पुण्य है।",
    "pujaVidhi": "गंगा स्नान कर दीपदान करें। भगवान सत्यनारायण की कथा सुनें। सायं घर व देवालयों में दीप प्रज्वलित करें।",
    "recommendedMantra": "ॐ त्रिपुरारये नमः | ॐ नमः शिवाय",
    "recommendedStotra": "गंगा स्तोत्र एवं रुद्राष्टकम्",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2026-11-27-sankashti",
    "title": "गणाधिप संकष्टी चतुर्थी व्रत (कार्तिक कृष्ण)",
    "date": "2026-11-27",
    "year": 2026,
    "monthGregorian": "2026-11",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक कृष्ण चतुर्थी",
    "category": "chaturthi",
    "categoryLabel": "चतुर्थी व्रत",
    "deity": "विघ्नहर्ता श्री गणेश एवं चंद्रदेव",
    "emoji": "🌙",
    "shubhTime": "गणेश पूजन: सायं 05:30 PM - 07:15 PM | चंद्रोदय: रात्रि 08:35 PM",
    "paranaSlot": null,
    "fastType": "संकष्टी व्रत (चंद्रोदय उपरांत पारण)",
    "significance": "संकटों का नाश करने वाला पावन व्रत। रात्रि में चंद्र दर्शन व अर्घ्य देकर व्रत खोलने से समस्त विघ्न व आर्थिक बाधाएं समाप्त होती हैं।",
    "pujaVidhi": "गणेश जी को दुर्वा व लड्डू चढ़ाएं। रात्रि में चंद्रदेव को दूध व जल से अर्घ्य दें।",
    "recommendedMantra": "ॐ गं गणपतये नमः | ॐ सोमाय नमः",
    "recommendedStotra": "संकटनाशन गणेश स्तोत्रम्",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2026-12-02-kalbhairav",
    "title": "कालभैरव अष्टमी (काशी कोतवाल भैरव प्राकट्योत्सव)",
    "date": "2026-12-02",
    "year": 2026,
    "monthGregorian": "2026-12",
    "vedicMonth": "मार्गशीर्ष",
    "tithi": "मार्गशीर्ष कृष्ण अष्टमी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "भगवान कालभैरव एवं महादेव शिव",
    "emoji": "🗡️",
    "shubhTime": "निशीथ काल व सायं भैरव पूजन: सायं 06:00 PM - रात्रि 11:30 PM",
    "paranaSlot": null,
    "fastType": "भैरव आराधना व्रत",
    "significance": "काशी के कोतवाल भगवान कालभैरव का प्राकट्य दिवस। इस दिन भैरव जी का दर्शन, काले उड़द, तेल व सरसों अर्पण करने से भूत-प्रेत बाधा, शत्रु भय एवं अकाल मृत्यु का शमन होता है।",
    "pujaVidhi": "कालभैरव मंदिर में सरसो के तेल का चौमुखा दीपक जलाएं। काले श्वान (कुत्ते) को मीठी रोटी खिलाएं।",
    "recommendedMantra": "ॐ भ्रं भैरवाय नमः | ॐ ह्रीं बटुकाय आपदुद्धारणाय कुरु कुरु बटुकाय ह्रीं",
    "recommendedStotra": "कालभैरवाष्टकम्",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2026-12-05-utpanna-ekadashi",
    "title": "उत्पन्ना एकादशी व्रत (एकादशी माता प्राकट्य दिवस)",
    "date": "2026-12-05",
    "year": 2026,
    "monthGregorian": "2026-12",
    "vedicMonth": "मार्गशीर्ष",
    "tithi": "मार्गशीर्ष कृष्ण एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री हरि विष्णु एवं एकादशी माता",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 07:05 AM - 10:20 AM",
    "paranaSlot": "06 दिसम्बर प्रातः 06:58 AM - 09:05 AM (द्वादशी तिथि)",
    "fastType": "एकादशी महाव्रत",
    "significance": "इसी दिन भगवान विष्णु के शरीर से एकादशी देवी प्रकट हुई थीं और मुर दैत्य का वध किया था। जो व्यक्ति एकादशी व्रत का प्रारम्भ करना चाहता है, उसे उत्पन्ना एकादशी से ही आरम्भ करना चाहिए।",
    "pujaVidhi": "भगवान विष्णु को पंचामृत से स्नान कराएं। धूप, दीप, तुलसी दल व मौसमी फल अर्पित करें। एकादशी महात्म्य का श्रवण करें।",
    "recommendedMantra": "ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "विष्णु सहस्रनाम स्तोत्रम्",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2026-12-07-som-pradosh",
    "title": "सोम प्रदोष व्रत (मार्गशीर्ष कृष्ण)",
    "date": "2026-12-07",
    "year": 2026,
    "monthGregorian": "2026-12",
    "vedicMonth": "मार्गशीर्ष",
    "tithi": "मार्गशीर्ष कृष्ण त्रयोदशी",
    "category": "pradosh_shivratri",
    "categoryLabel": "प्रदोष व्रत",
    "deity": "देवाधिदेव महादेव शिव",
    "emoji": "🔱",
    "shubhTime": "प्रदोष काल पूजा: सायं 05:14 PM - 07:52 PM",
    "paranaSlot": null,
    "fastType": "सोम प्रदोष व्रत",
    "significance": "सोमवार को पड़ने वाला प्रदोष व्रत मानसिक शांति, वैवाहिक सुख एवं चन्द्र दोष निवारण हेतु सर्वश्रेष्ठ फलदायी है।",
    "pujaVidhi": "शिवलिंग पर दूध, दही, शहद, घी व गंगाजल से अभिषेक कर बिल्वपत्र अर्पित करें।",
    "recommendedMantra": "ॐ नमः शिवाय",
    "recommendedStotra": "शिव तांडव स्तोत्रम्",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2026-12-08-masik-shivratri",
    "title": "मासिक शिवरात्रि (मार्गशीर्ष कृष्ण चतुर्दशी)",
    "date": "2026-12-08",
    "year": 2026,
    "monthGregorian": "2026-12",
    "vedicMonth": "मार्गशीर्ष",
    "tithi": "मार्गशीर्ष कृष्ण चतुर्दशी",
    "category": "pradosh_shivratri",
    "categoryLabel": "शिवरात्रि व्रत",
    "deity": "भगवान शिव एवं माता पार्वती",
    "emoji": "🕉️",
    "shubhTime": "निशीथ काल पूजा: रात्रि 11:45 PM - 12:38 AM",
    "paranaSlot": null,
    "fastType": "मासिक शिवरात्रि व्रत",
    "significance": "प्रत्येक माह की कृष्ण चतुर्दशी को शिवरात्रि व्रत रखने से काम, क्रोध, लोभ का शमन होता है तथा मोक्ष की प्राप्ति होती है।",
    "pujaVidhi": "रात्रि के समय घी का दीपक जलाकर रुद्राष्टकम का पाठ करें।",
    "recommendedMantra": "ॐ हौं जूं सः ॐ भूर्भुवः स्वः ॐ त्र्यम्बकं यजामहे...",
    "recommendedStotra": "महामृत्युंजय स्तोत्र",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2026-12-20-mokshada-gita",
    "title": "मोक्षदा एकादशी एवं श्रीमद्भगवद्गीता जयंती",
    "date": "2026-12-20",
    "year": 2026,
    "monthGregorian": "2026-12",
    "vedicMonth": "मार्गशीर्ष",
    "tithi": "मार्गशीर्ष शुक्ल एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "योगेश्वर भगवान श्री कृष्ण",
    "emoji": "📖",
    "shubhTime": "गीता पाठ व विष्णु पूजन: प्रातः 08:30 AM - दोपहर 12:00 PM",
    "paranaSlot": "21 दिसम्बर प्रातः 07:08 AM - 09:12 AM (द्वादशी तिथि)",
    "fastType": "मोक्ष प्रदायिनी एकादशी",
    "significance": "कुरुक्षेत्र में अर्जुन को दिए गए दिव्य गीता उपदेश का प्राकट्य दिवस। इस एकादशी के पुण्य प्रभाव से नरक में पड़े पितरों को भी वैकुंठ धाम की प्राप्ति होती है।",
    "pujaVidhi": "श्रीमद्भगवद्गीता के ११वें व १५वें अध्याय का पाठ करें। भगवान कृष्ण को माखन-मिश्री का भोग लगाएं।",
    "recommendedMantra": "ॐ कृष्णाय वासुदेवाय हरये परमात्मने। प्रणतक्लेशनाशाय गोविंदाय नमो नमः॥",
    "recommendedStotra": "गीता माहात्म्य एवं विष्णु सहस्रनाम",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-01-04-saphala-ekadashi",
    "title": "सफला एकादशी व्रत (समस्त कार्य सिद्धि)",
    "date": "2027-01-04",
    "year": 2027,
    "monthGregorian": "2027-01",
    "vedicMonth": "पौष",
    "tithi": "पौष कृष्ण एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान अच्युत (श्री नारायण)",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 07:15 AM - 10:30 AM",
    "paranaSlot": "05 जनवरी प्रातः 07:14 AM - 09:20 AM (द्वादशी तिथि)",
    "fastType": "सफलता प्रदायक व्रत",
    "significance": "पौष कृष्ण एकादशी का नाम सफला है। इस व्रत को करने से जातक के रुके हुए समस्त कार्य सफल होते हैं तथा जीवन में समृद्धि आती है।",
    "pujaVidhi": "भगवान विष्णु को नारियल, सुपारी व ऋतुफल अर्पित करें। रात्रि जागरण कर भजन-कीर्तन करें।",
    "recommendedMantra": "ॐ नमो नारायणाय",
    "recommendedStotra": "नारायण कवचम्",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-01-14-makar-sankranti",
    "title": "मकर संक्रांति (उत्तरायण सूर्य प्रवेश / पोंगल / महाकुम्भ स्नान)",
    "date": "2027-01-14",
    "year": 2027,
    "monthGregorian": "2027-01",
    "vedicMonth": "पौष",
    "tithi": "पौष शुक्ल षष्ठी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "भगवान भुवन भास्कर सूर्य नारायण",
    "emoji": "🪁",
    "shubhTime": "संक्रांति पुण्यकाल: प्रातः 07:15 AM - दोपहर 12:45 PM | महापुण्यकाल: 07:15 AM - 09:05 AM",
    "paranaSlot": null,
    "fastType": "तीर्थ स्नान, तिल-गुड़ दान व खिचड़ी भोग",
    "significance": "सूर्य देव धनु राशि से मकर राशि में प्रवेश कर उत्तरायण होते हैं। देवताओं का दिन प्रारम्भ होता है। तिल-गुड़, कंबल, खिचड़ी दान व पवित्र नदी स्नान से सात जन्मों के पाप नष्ट होते हैं।",
    "pujaVidhi": "प्रातः तीर्थ जल में तिल डालकर स्नान करें। तांबे के लोटे में लाल चंदन, अक्षत, गुड़ व तिल डालकर सूर्य को अर्घ्य दें। खिचड़ी का भोग लगाकर दान करें।",
    "recommendedMantra": "ॐ सूर्याय नमः | ॐ ह्रीं ह्रीं सूर्याय सहस्रकिरणाय मनोवांछित फलं देहि देहि स्वाहा॥",
    "recommendedStotra": "आदित्य हृदय स्तोत्र एवं सूर्य अष्टकम",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2027-01-18-putrada-ekadashi",
    "title": "पौष पुत्रदा एकादशी व्रत (संतान सुख व वंश वृद्धि)",
    "date": "2027-01-18",
    "year": 2027,
    "monthGregorian": "2027-01",
    "vedicMonth": "पौष",
    "tithi": "पौष शुक्ल एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री कृष्ण / बाल गोपाल",
    "emoji": "👶",
    "shubhTime": "विष्णु पूजन: प्रातः 07:15 AM - 11:00 AM",
    "paranaSlot": "19 जनवरी प्रातः 07:15 AM - 09:22 AM (द्वादशी तिथि)",
    "fastType": "संतान सुख प्रदायक व्रत",
    "significance": "संतान प्राप्ति, योग्य संतति एवं संतान की रक्षा व उन्नति के लिए यह व्रत अचूक माना गया है। राजा सुकेतुमान को इसी व्रत से तेजस्वी पुत्र प्राप्त हुआ था।",
    "pujaVidhi": "भगवान नारायण और बाल गोपाल का पंचामृत से अभिषेक करें। तुलसी पत्र व पीले लड्डू अर्पित करें।",
    "recommendedMantra": "ॐ देवकीसुत गोविन्द वासुदेव जगत्पते। देहि मे तनयं कृष्ण त्वामहं शरणं गतः॥",
    "recommendedStotra": "संतान गोपाल स्तोत्रम्",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-01-26-sakat-chauth",
    "title": "सकट चौथ / तिलकुटा संकष्टी चतुर्थी (माघी चौथ)",
    "date": "2027-01-26",
    "year": 2027,
    "monthGregorian": "2027-01",
    "vedicMonth": "माघ",
    "tithi": "माघ कृष्ण चतुर्थी",
    "category": "chaturthi",
    "categoryLabel": "चतुर्थी व्रत",
    "deity": "संकटहरता श्री गणेश एवं चंद्रदेव",
    "emoji": "🌙",
    "shubhTime": "गणेश पूजन: सायं 05:40 PM - 07:30 PM | चंद्रोदय: रात्रि 08:48 PM",
    "paranaSlot": null,
    "fastType": "निर्जला व्रत (चंद्र दर्शन उपरांत पारण)",
    "significance": "माताओं द्वारा अपनी संतान की दीर्घायु, आरोग्य एवं घोर संकटों से रक्षा के लिए रखा जाने वाला परम सिद्ध व्रत। तिल-गुड़ के बकरे व तिलकुट का भोग लगाया जाता है।",
    "pujaVidhi": "गणेश जी को तिलकुट व दुर्वा अर्पित करें। सकट चौथ व्रत कथा सुनें। रात्रि में चंद्रदेव को अर्घ्य देकर तिलकुट प्रसाद खाकर व्रत खोलें।",
    "recommendedMantra": "ॐ गं गणपतये नमः",
    "recommendedStotra": "संकटनाशन गणेश स्तोत्र एवं गणेश अष्टक",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2027-02-02-shattila-ekadashi",
    "title": "षट्तिला एकादशी व्रत (षट् प्रकार के तिल दान से पाप मुक्ति)",
    "date": "2027-02-02",
    "year": 2027,
    "monthGregorian": "2027-02",
    "vedicMonth": "माघ",
    "tithi": "माघ कृष्ण एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री हरि विष्णु",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 07:08 AM - 10:45 AM",
    "paranaSlot": "03 फरवरी प्रातः 07:08 AM - 09:16 AM (द्वादशी तिथि)",
    "fastType": "तिल दान व फलाहार व्रत",
    "significance": "इस दिन छह प्रकार से तिल का प्रयोग (तिल स्नान, तिल उबटन, तिल हवन, तिल तर्पण, तिल भोजन व तिल दान) करने से जन्म-जन्मांतर के पापों से मुक्ति मिलती है।",
    "pujaVidhi": "तिल मिले जल से स्नान करें। भगवान विष्णु को तिल मिले पंचामृत से स्नान कराएं और तिल की आहुति दें।",
    "recommendedMantra": "ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "विष्णु सहस्रनाम स्तोत्रम्",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-02-06-mauni-amavasya",
    "title": "मौनी अमावस्या (माघ शनिश्चरी अमावस्या / महाकुम्भ अमृत स्नान)",
    "date": "2027-02-06",
    "year": 2027,
    "monthGregorian": "2027-02",
    "vedicMonth": "माघ",
    "tithi": "माघ कृष्ण अमावस्या",
    "category": "purnima_amavasya",
    "categoryLabel": "पूर्णिमा व अमावस्या",
    "deity": "भगवान विष्णु, शिव एवं शनिदेव",
    "emoji": "🌊",
    "shubhTime": "मौन स्नान व दान: ब्रह्म मुहूर्त 05:15 AM - 11:30 AM",
    "paranaSlot": null,
    "fastType": "मौन व्रत व तीर्थ स्नान",
    "significance": "माघ मास की अमावस्या को मौन रहकर पवित्र तीर्थ (प्रयागराज त्रिवेणी / काशी गंगा) में स्नान करने से अश्वमेध यज्ञ के समान पुण्य प्राप्त होता है। शनिवार पड़ने से शनिश्चरी अमावस्या का दुर्लभ संयोग भी है।",
    "pujaVidhi": "प्रातः मौन रहकर स्नान करें। पीपल वृक्ष को जल देकर सात परिक्रमा करें। काले तिल व तेल का दान करें।",
    "recommendedMantra": "ॐ शं शनैश्चराय नमः | ॐ नमो नारायणाय",
    "recommendedStotra": "दशरथकृत शनि स्तोत्र एवं पितृ स्तोत्र",
    "recommendedPuja": "त्रिपिंडी श्राद्ध एवं पितृदोष शांति",
    "pujaId": "puja-3"
  },
  {
    "id": "fest-2027-02-11-vasant-panchami",
    "title": "वसंत पंचमी एवं माँ सरस्वती प्राकट्योत्सव (विद्यारम्भ संस्कार)",
    "date": "2027-02-11",
    "year": 2027,
    "monthGregorian": "2027-02",
    "vedicMonth": "माघ",
    "tithi": "माघ शुक्ल पंचमी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "ज्ञान व वाणी की अधिष्ठात्री भगवती माँ सरस्वती",
    "emoji": "🪕",
    "shubhTime": "सरस्वती पूजन व विद्यारम्भ: प्रातः 07:05 AM - दोपहर 12:35 PM",
    "paranaSlot": null,
    "fastType": "पीत वस्त्र धारण व ज्ञान आराधना",
    "significance": "सृष्टि में ज्ञान, संगीत व वाणी का संचार करने वाली भगवती शारदा का प्राकट्य दिवस। शिशुओं का अक्षरारम्भ, विद्यारम्भ संस्कार तथा विद्यार्थियों हेतु ज्ञान वृद्धि का सर्वोत्तम दिन।",
    "pujaVidhi": "पीले वस्त्र पहनें। माँ सरस्वती को पीले गेंदे के फूल, मालपुआ व बेसन के लड्डू अर्पित करें। पुस्तकें, कलम व वाद्य यंत्र रखकर वंदना करें।",
    "recommendedMantra": "ॐ ऐं सरस्वत्यै नमः | या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता...",
    "recommendedStotra": "सरस्वती स्तोत्र एवं श्री शारदा भुजंगप्रयात स्तोत्र",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2027-02-17-jaya-ekadashi",
    "title": "जया एकादशी व्रत (भूत-पिशाच योनि से मुक्ति)",
    "date": "2027-02-17",
    "year": 2027,
    "monthGregorian": "2027-02",
    "vedicMonth": "माघ",
    "tithi": "माघ शुक्ल एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री हरि विष्णु",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 06:58 AM - 10:15 AM",
    "paranaSlot": "18 फरवरी प्रातः 06:58 AM - 09:10 AM (द्वादशी तिथि)",
    "fastType": "विजय प्रदायक व्रत",
    "significance": "इन्द्र की सभा के गंधर्व माल्यवान और पुष्पवती को पिशाच योनि से इसी एकादशी के प्रभाव से मुक्ति मिली थी। यह व्रत पापों का नाश कर विजय दिलाता है।",
    "pujaVidhi": "भगवान नारायण को तुलसी दल व पंचामृत अर्पित करें। विष्णु चालीसा का पाठ करें।",
    "recommendedMantra": "ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "विष्णु अष्टोत्तर शतनामावली",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-03-04-vijaya-ekadashi",
    "title": "विजया एकादशी व्रत (कठिन कार्यों में विजय प्रदाता)",
    "date": "2027-03-04",
    "year": 2027,
    "monthGregorian": "2027-03",
    "vedicMonth": "फाल्गुन",
    "tithi": "फाल्गुन कृष्ण एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "मर्यादा पुरुषोत्तम प्रभु श्री राम एवं विष्णु",
    "emoji": "🏹",
    "shubhTime": "विष्णु पूजन: प्रातः 06:45 AM - 10:20 AM",
    "paranaSlot": "05 मार्च प्रातः 06:45 AM - 08:58 AM (द्वादशी तिथि)",
    "fastType": "सर्वविजय प्रदायक व्रत",
    "significance": "लंका विजय हेतु समुद्र तट पर भगवान श्री राम ने अपनी सेना सहित विजया एकादशी का व्रत किया था। कोर्ट-कचहरी, शत्रु बाधा व प्रतियोगी परीक्षाओं में विजय हेतु श्रेष्ठ व्रत।",
    "pujaVidhi": "कलश स्थापित कर उसके ऊपर भगवान विष्णु की प्रतिमा स्थापित करें। पीले पुष्प, तुलसी व फल अर्पित करें।",
    "recommendedMantra": "ॐ श्रीं रामाय नमः | ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "श्री राम रक्षा स्तोत्रम्",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-03-06-mahashivratri",
    "title": "महाशिवरात्रि महापर्व (द्वादश ज्योतिर्लिंग रुद्राभिषेक)",
    "date": "2027-03-06",
    "year": 2027,
    "monthGregorian": "2027-03",
    "vedicMonth": "फाल्गुन",
    "tithi": "फाल्गुन कृष्ण चतुर्दशी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "देवाधिदेव महादेव शिव एवं माँ पार्वती",
    "emoji": "🔱",
    "shubhTime": "निशीथ काल पूजा: रात्रि 11:58 PM - 12:48 AM | चार प्रहर रुद्राभिषेक: सायं 06:20 PM से प्रातः 06:40 AM",
    "paranaSlot": "07 मार्च प्रातः 06:42 AM उपरांत",
    "fastType": "महाशिवरात्रि निर्जला / फलाहार महाव्रत",
    "significance": "शिव-पार्वती विवाह का पावन दिवस एवं ज्योतिर्लिंग प्राकट्य काल। महाशिवरात्रि पर १०८ बेलपत्र, पंचामृत व रुद्राभिषेक करने से जन्म-जन्मांतर के पातक, कालसर्प दोष एवं अकाल मृत्यु भय दूर होते हैं।",
    "pujaVidhi": "चार प्रहर पूजा: प्रथम प्रहर में दूध, द्वितीय में दही, तृतीय में घी तथा चतुर्थ प्रहर में शहद से अभिषेक करें। बेलपत्र, भांग, धतूरा, मदार पुष्प अर्पित करें।",
    "recommendedMantra": "ॐ नमः शिवाय | ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्यgroupोर्मुक्षीय मामृतात्॥",
    "recommendedStotra": "दारिद्र्य दहन शिव स्तोत्र, शिव महिम्न स्तोत्र एवं रुद्राष्टकम्",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2027-03-08-somvati-amavasya",
    "title": "सोमवती अमावस्या (फाल्गुन कृष्ण अमावस्या / अश्वत्थ प्रदक्षिणा)",
    "date": "2027-03-08",
    "year": 2027,
    "monthGregorian": "2027-03",
    "vedicMonth": "फाल्गुन",
    "tithi": "फाल्गुन कृष्ण अमावस्या",
    "category": "purnima_amavasya",
    "categoryLabel": "पूर्णिमा व अमावस्या",
    "deity": "भगवान श्री हरि विष्णु एवं शिवजी",
    "emoji": "🌳",
    "shubhTime": "पीपल पूजन व स्नान-दान: प्रातः 06:40 AM - 11:30 AM",
    "paranaSlot": null,
    "fastType": "सुहाग रक्षा व पितृ तर्पण",
    "significance": "सोमवार को पड़ने वाली अमावस्या को सोमवती अमावस्या कहते हैं। सुहागिनें पीपल के वृक्ष की १०८ परिक्रमा कर धागा लपेटती हैं, जिससे अखंड सौभाग्य और पितरों को तृप्ति मिलती है।",
    "pujaVidhi": "पीपल वृक्ष में दूध, जल, अक्षत अर्पित करें। १०८ बार ॐ नमो भगवते वासुदेवाय जपते हुए परिक्रमा करें।",
    "recommendedMantra": "मूलतो ब्रह्मरूपाय मध्यतो विष्णुरूपिणे। अग्रतः शिवरूपाय अश्वत्थाय नमो नमः॥",
    "recommendedStotra": "विष्णु स्तोत्र एवं पितृ गायत्री",
    "recommendedPuja": "त्रिपिंडी श्राद्ध एवं पितृदोष शांति",
    "pujaId": "puja-3"
  },
  {
    "id": "fest-2027-03-18-rangbhari-ekadashi",
    "title": "रंगभरी एकादशी / आमलकी एकादशी (काशी विश्वनाथ गौरा गौना उत्सव)",
    "date": "2027-03-18",
    "year": 2027,
    "monthGregorian": "2027-03",
    "vedicMonth": "फाल्गुन",
    "tithi": "फाल्गुन शुक्ल एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "बाबा विश्वनाथ, माँ गौरा एवं भगवान विष्णु",
    "emoji": "🎨",
    "shubhTime": "गुलाल उत्सव व श्रृंगार: सायं 04:30 PM - 08:30 PM",
    "paranaSlot": "19 मार्च प्रातः 06:30 AM - 08:45 AM (द्वादशी तिथि)",
    "fastType": "रंगोत्सव एकादशी व्रत",
    "significance": "बाबा विश्वनाथ माता गौरा को विदा कराकर काशी लाते हैं और काशी में इसी दिन से गुलाल उड़ाकर रंगोत्सव प्रारम्भ होता है। आंवला वृक्ष के पूजन से अक्षय पुण्य मिलता है।",
    "pujaVidhi": "शिवलिंग पर अबीर, गुलाल व बेलपत्र अर्पित करें। आंवले के वृक्ष की पूजा कर दीपक जलाएं।",
    "recommendedMantra": "ॐ नमः शिवाय | ॐ विष्णवे नमः",
    "recommendedStotra": "शिव आनंद तांडव स्तोत्र",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2027-03-22-holika-dahan",
    "title": "होलिका दहन (फाल्गुन पूर्णिमा / भक्त प्रह्लाद विजय)",
    "date": "2027-03-22",
    "year": 2027,
    "monthGregorian": "2027-03",
    "vedicMonth": "फाल्गुन",
    "tithi": "फाल्गुन शुक्ल पूर्णिमा",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "भक्त प्रह्लाद एवं भगवान नृसिंह",
    "emoji": "🔥",
    "shubhTime": "होलिका दहन मुहूर्त: रात्रि 09:20 PM - 11:35 PM",
    "paranaSlot": null,
    "fastType": "नवसस्येष्टि यज्ञ व दीपदान",
    "significance": "अधर्म और अहंकार पर अनन्य भक्ति की विजय। नए अन्न (गेहूं, जौ की बालियां) को अग्नि में भूनकर प्रसाद लेने से वर्ष भर आरोग्यता और ग्रह शांति रहती है।",
    "pujaVidhi": "होलिका में गोबर के बड़कुले, रोली, अक्षत, नारियल व गेहूं की बाली अर्पित कर परिक्रमा करें।",
    "recommendedMantra": "ॐ नृसिंहाय नमः | असृक्पातात् सुरैस्त्रस्ता रक्षांसि विहतानि च...",
    "recommendedStotra": "नृसिंह कवचम्",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2027-03-23-holi",
    "title": "रंगों का महापर्व होली (धुलेंडी उत्सव)",
    "date": "2027-03-23",
    "year": 2027,
    "monthGregorian": "2027-03",
    "vedicMonth": "चैत्र",
    "tithi": "चैत्र कृष्ण प्रतिपदा",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "राधा-कृष्ण एवं समस्त देवगण",
    "emoji": "🎊",
    "shubhTime": "रंगोत्सव: प्रातः काल से सायं काल तक",
    "paranaSlot": null,
    "fastType": "उमंग व समरसता पर्व",
    "significance": "पारस्परिक प्रेम, समरसता एवं उल्लास का पर्व। ब्रज व काशी में भगवान के चरणों में गुलाल अर्पित कर एक-दूसरे को रंग लगाकर सद्भाव प्रकट किया जाता है।",
    "pujaVidhi": "देवालय में लड्डू गोपाल व राधा-कृष्ण को गुलाल अर्पित करें। बुजुर्गों के चरण छूकर आशीर्वाद लें।",
    "recommendedMantra": "राधे राधे",
    "recommendedStotra": "मधुराष्टकम्",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-04-02-papmochini-ekadashi",
    "title": "पापमोचिनी एकादशी व्रत (समस्त ज्ञात-अज्ञात पापों का क्षय)",
    "date": "2027-04-02",
    "year": 2027,
    "monthGregorian": "2027-04",
    "vedicMonth": "चैत्र",
    "tithi": "चैत्र कृष्ण एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री हरि विष्णु",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 06:12 AM - 09:30 AM",
    "paranaSlot": "03 अप्रैल प्रातः 06:12 AM - 08:30 AM (द्वादशी तिथि)",
    "fastType": "पापनाशिनी एकादशी",
    "significance": "चैत्र मास के कृष्ण पक्ष की यह एकादशी ब्रह्महत्या, सुवर्ण चोरी जैसे घोर पापों का भी शमन करने वाली कही गई है। मेधावी मुनि को इसी व्रत से शाप मुक्ति मिली थी।",
    "pujaVidhi": "भगवान चतुर्भुज की धूप-दीप से पूजा करें। पीले फल व तुलसी पत्र अर्पित करें।",
    "recommendedMantra": "ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "विष्णु स्तुति",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-04-08-chaitra-navratri",
    "title": "चैत्र नवरात्रि घटस्थापना एवं हिन्दू नव संवत्सर २०८४ प्रारम्भ",
    "date": "2027-04-08",
    "year": 2027,
    "monthGregorian": "2027-04",
    "vedicMonth": "चैत्र",
    "tithi": "चैत्र शुक्ल प्रतिपदा (विक्रम संवत 2084)",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "माँ शैलपुत्री / जगदम्बा भवानी",
    "emoji": "🚩",
    "shubhTime": "कलश स्थापना मुहूर्त: प्रातः 06:05 AM - 10:15 AM (अभिजित: 11:50 AM - 12:40 PM)",
    "paranaSlot": null,
    "fastType": "९ दिवसीय शक्ति साधना व्रत",
    "significance": "सृष्टि का उत्पत्ति दिवस एवं सनातन हिन्दू नववर्ष। नौ दिनों तक दुर्गा सप्तशती पाठ, अखण्ड दीप एवं व्रत से परिवार में वर्ष भर शक्ति, आरोग्य व विजय का वास होता है।",
    "pujaVidhi": "मिट्टी की वेदी पर जौ बोएं, तांबे के कलश पर आम के पत्ते व नारियल रखकर कलश स्थापित करें। अखण्ड ज्योति जलाएं।",
    "recommendedMantra": "ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे | वन्दे वाञ्छितलाभाय चन्द्रार्धकृतशेखराम्...",
    "recommendedStotra": "दुर्गा सप्तशती एवं देवी कवच",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2027-04-15-kamada-ekadashi",
    "title": "कामदा एकादशी व्रत (मनोवांछित फल प्रदायक)",
    "date": "2027-04-15",
    "year": 2027,
    "monthGregorian": "2027-04",
    "vedicMonth": "चैत्र",
    "tithi": "चैत्र शुक्ल एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री हरि विष्णु",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 05:58 AM - 09:15 AM",
    "paranaSlot": "16 अप्रैल प्रातः 05:58 AM - 08:18 AM (द्वादशी तिथि)",
    "fastType": "मनोकामना पूर्ति व्रत",
    "significance": "हिन्दू नववर्ष की पहली एकादशी। इस व्रत के पुण्य से ललिता और ललित गंधर्व को राक्षस योनि से मुक्ति मिली थी। जातक की समस्त अधूरी मनोकामनाएं सिद्ध होती हैं।",
    "pujaVidhi": "भगवान विष्णु को पंचामृत, तुलसी दल व पीले पुष्प अर्पित करें। ॐ विष्णवे नमः का जप करें।",
    "recommendedMantra": "ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "विष्णु सहस्रनाम स्तोत्रम्",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-04-16-ram-navami",
    "title": "श्री राम नवमी (मर्यादा पुरुषोत्तम प्रभु राम जन्मोत्सव)",
    "date": "2027-04-16",
    "year": 2027,
    "monthGregorian": "2027-04",
    "vedicMonth": "चैत्र",
    "tithi": "चैत्र शुक्ल नवमी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "कौशल्या नंदन प्रभु श्री राम लला",
    "emoji": "🏹",
    "shubhTime": "राम लला जन्मोत्सव मुहूर्त (मध्याह्न): पूर्वाह्न 11:05 AM - दोपहर 01:35 PM",
    "paranaSlot": null,
    "fastType": "जन्मोत्सव व्रत व पंजीरी प्रसाद",
    "significance": "अयोध्या धाम में चैत्र शुक्ल नवमी के मध्याह्न में भगवान विष्णु के ७वें पूर्णावतार प्रभु श्री राम का प्राकट्य हुआ। रामरक्षा स्तोत्र व सुंदरकांड पाठ से समस्त संकट मिटते हैं।",
    "pujaVidhi": "मध्याह्न १२ बजे शंख-घंटा बजाकर राम लला का जन्मोत्सव मनाएं। पंजीरी, पंचामृत व तुलसी का भोग लगाएं।",
    "recommendedMantra": "श्री राम जय राम जय जय राम | ॐ रां रामाय नमः",
    "recommendedStotra": "श्री राम रक्षा स्तोत्रम् एवं भय हरण स्तोत्र",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-04-21-hanuman-jayanti",
    "title": "श्री हनुमान जयंती (चैत्र पूर्णिमा / रुद्रावतार प्राकट्य)",
    "date": "2027-04-21",
    "year": 2027,
    "monthGregorian": "2027-04",
    "vedicMonth": "चैत्र",
    "tithi": "चैत्र शुक्ल पूर्णिमा",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "श्री संकटमोचन हनुमान जी महाराज",
    "emoji": "🚩",
    "shubhTime": "हनुमत पूजन व चोला अर्पण: प्रातः 07:15 AM - 11:45 AM",
    "paranaSlot": null,
    "fastType": "सिन्दूर चोला व सुंदरकांड पाठ",
    "significance": "अंजनी सुत पवनपुत्र हनुमान जी की आराधना का सर्वोच्च पर्व। चमेली के तेल में सिन्दूर मिलाकर चोला चढ़ाने और सुंदरकांड पाठ से भूत-प्रेत बाधा, शनि पीड़ा और भय नष्ट होते हैं।",
    "pujaVidhi": "हनुमान जी को चोला चढ़ाएं, बूंदी के लड्डू व तुलसी माला अर्पित करें। १०० बार हनुमान चालीसा व बजरंग बाण का पाठ करें।",
    "recommendedMantra": "ॐ हं हनुमते रुद्रात्मकाय हुं फट् | मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्...",
    "recommendedStotra": "श्री हनुमान चालीसा, बजरंग बाण एवं हनुमानाष्टक",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2027-05-02-varuthini-ekadashi",
    "title": "वरूथिनी एकादशी व्रत (सौभाग्य व मोक्ष प्रदाता)",
    "date": "2027-05-02",
    "year": 2027,
    "monthGregorian": "2027-05",
    "vedicMonth": "वैशाख",
    "tithi": "वैशाख कृष्ण एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान मधुसूदन",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 05:42 AM - 09:10 AM",
    "paranaSlot": "03 मई प्रातः 05:42 AM - 08:08 AM (द्वादशी तिथि)",
    "fastType": "कल्याणकारी व्रत",
    "significance": "वैशाख कृष्ण एकादशी को वरूथिनी एकादशी कहते हैं। यह इस लोक में सौभाग्य और परलोक में मोक्ष प्रदान करती है। राजा मांधाता को इसी व्रत से स्वर्ग की प्राप्ति हुई थी।",
    "pujaVidhi": "भगवान मधुसूदन का पूजन कर खरबूजा व अन्न दान करें।",
    "recommendedMantra": "ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "मधुसूदन अष्टकम्",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-05-09-akshaya-tritiya",
    "title": "अक्षय तृतीया (अबूझ महामुहूर्त / भगवान परशुराम जयंती)",
    "date": "2027-05-09",
    "year": 2027,
    "monthGregorian": "2027-05",
    "vedicMonth": "वैशाख",
    "tithi": "वैशाख शुक्ल तृतीया",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "भगवान श्री लक्ष्मीनारायण एवं भगवान परशुराम",
    "emoji": "🪙",
    "shubhTime": "अक्षय स्वर्ण क्रय व पूजन: प्रातः 05:42 AM - दोपहर 12:20 PM",
    "paranaSlot": null,
    "fastType": "अक्षय दान व स्वर्ण क्रय",
    "significance": "त्रेतायुग का प्रारम्भ दिवस एवं बद्रीनाथ धाम के कपाट खुलने का दिन। इस दिन किया गया कोई भी शुभ कार्य, दान, जप एवं स्वर्ण क्रय कभी क्षय नहीं होता।",
    "pujaVidhi": "श्री लक्ष्मीनारायण जी को पीले वस्त्र, कमल पुष्प व जौ का सत्तू अर्पित करें। जल से भरे घड़े व पंखे का दान करें।",
    "recommendedMantra": "ॐ श्रीं ह्रीं क्लीं लक्ष्मीनारायणाय नमः",
    "recommendedStotra": "कनकधारा स्तोत्र एवं परशुराम स्तुति",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-05-17-mohini-ekadashi",
    "title": "मोहिनी एकादशी व्रत (मोह-माया बंधन से मुक्ति)",
    "date": "2027-05-17",
    "year": 2027,
    "monthGregorian": "2027-05",
    "vedicMonth": "वैशाख",
    "tithi": "वैशाख शुक्ल एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान विष्णु का दिव्य मोहिनी स्वरूप",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 05:32 AM - 08:45 AM",
    "paranaSlot": "18 मई प्रातः 05:32 AM - 08:00 AM (द्वादशी तिथि)",
    "fastType": "मोह-पाप नाशक व्रत",
    "significance": "समुद्र मंथन में अमृत रक्षा हेतु भगवान विष्णु ने मोहिनी रूप धारण किया था। इस व्रत से मोह-माया के बंधन और जन्म-जन्मांतर के पापकर्म भस्म हो जाते हैं।",
    "pujaVidhi": "भगवान मोहिनी स्वरूप को चंदन, सुगन्धित इत्र व पंचामृत अर्पित करें।",
    "recommendedMantra": "ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "विष्णु सहस्रनाम",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-05-31-apara-ekadashi",
    "title": "अपरा एकादशी व्रत (अपार धन-धान्य व ब्रह्महत्या आदि पाप मुक्ति)",
    "date": "2027-05-31",
    "year": 2027,
    "monthGregorian": "2027-05",
    "vedicMonth": "ज्येष्ठ",
    "tithi": "ज्येष्ठ कृष्ण एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान त्रिविक्रम (श्री हरि)",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 05:25 AM - 08:50 AM",
    "paranaSlot": "01 जून प्रातः 05:25 AM - 07:55 AM (द्वादशी तिथि)",
    "fastType": "अपार पुण्य प्रदायक व्रत",
    "significance": "ज्येष्ठ कृष्ण एकादशी का नाम अपरा है क्योंकि यह अपार पुण्य देने वाली है। झूठी गवाही, निंदा आदि बड़े पापों से मुक्ति मिलती है।",
    "pujaVidhi": "भगवान त्रिविक्रम की पूजा करें। जल, पंखा व मौसमी फलों का दान करें।",
    "recommendedMantra": "ॐ त्रिविक्रमाय नमः",
    "recommendedStotra": "नारायण अष्टकम",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-06-04-vat-savitri",
    "title": "वट सावित्री व्रत (ज्येष्ठ अमावस्या / अखंड सुहाग पर्व)",
    "date": "2027-06-04",
    "year": 2027,
    "monthGregorian": "2027-06",
    "vedicMonth": "ज्येष्ठ",
    "tithi": "ज्येष्ठ कृष्ण अमावस्या",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "सती सावित्री, सत्यवान एवं यमराज",
    "emoji": "🌳",
    "shubhTime": "वट वृक्ष पूजन: प्रातः 06:15 AM - 10:30 AM",
    "paranaSlot": null,
    "fastType": "सुहाग रक्षा महाव्रत",
    "significance": "सती सावित्री ने अपने पति सत्यवान के प्राण यमराज से वापस ले लिए थे। सुहागिनें पति की दीर्घायु व कुल वृद्धि हेतु वट (बरगद) वृक्ष में कच्चा सूत लपेटकर परिक्रमा करती हैं।",
    "pujaVidhi": "वट वृक्ष की जड़ में जल चढ़ाएं, रोली, अक्षत, भीगे चने व फल अर्पित करें। १०८ बार सूत लपेटकर परिक्रमा करें।",
    "recommendedMantra": "अवैधव्यं च सौभाग्यं देहि मे व्रततो वट। यथा शाखाप्रशाखाभिर्वृद्धोऽसि त्वं महीतले॥",
    "recommendedStotra": "सावित्री स्तोत्रम्",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2027-06-14-ganga-dussehra",
    "title": "गंगा दशहरा (दशविध पापनाशिनी माँ गंगा भूलोक अवतरण)",
    "date": "2027-06-14",
    "year": 2027,
    "monthGregorian": "2027-06",
    "vedicMonth": "ज्येष्ठ",
    "tithi": "ज्येष्ठ शुक्ल दशमी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "पतितपावनी माँ भगवती गंगा",
    "emoji": "🌊",
    "shubhTime": "गंगा स्नान व दान: प्रातः 04:30 AM - 10:15 AM",
    "paranaSlot": null,
    "fastType": "दशविध स्नान व दीपदान",
    "significance": "राजा भगीरथ के कठोर तप से माँ गंगा का शिव की जटाओं से भूलोक पर आगमन हुआ था। काशी के घाटों पर १० प्रकार के फल, १० दीप व १० डुबकी लगाने से १० प्रकार के पाप मिटते हैं।",
    "pujaVidhi": "गंगाजल में खड़े होकर अर्घ्य दें। १० दीपक प्रवाहित करें। सत्तू, आम व जल का दान करें।",
    "recommendedMantra": "ॐ नमो भगवत्यै हिलि हिलि मिलि मिलि गङ्गे माँ पालय पालय स्वाहा॥",
    "recommendedStotra": "श्री गंगा स्तोत्रम् (शंकराचार्य विरचित)",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2027-06-15-nirjala-ekadashi",
    "title": "निर्जला एकादशी (भीमसेनी एकादशी महाव्रत)",
    "date": "2027-06-15",
    "year": 2027,
    "monthGregorian": "2027-06",
    "vedicMonth": "ज्येष्ठ",
    "tithi": "ज्येष्ठ शुक्ल एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "जगत्पालक भगवान श्री हरि विष्णु",
    "emoji": "💧",
    "shubhTime": "विष्णु पूजन: प्रातः 06:15 AM - 09:30 AM",
    "paranaSlot": "16 जून प्रातः 05:24 AM - 07:50 AM (द्वादशी तिथि)",
    "fastType": "जलहीन निर्जला महाव्रत",
    "significance": "वर्ष भर की २४ एकादशियों का पुण्य फल अकेले निर्जला एकादशी के जलहीन व्रत से प्राप्त हो जाता है। महर्षि व्यास के निर्देश पर महाबली भीम ने यह व्रत किया था।",
    "pujaVidhi": "सूर्योदय से अगले सूर्योदय तक जल की एक बूंद भी ग्रहण न करें। जलपात्र (घड़ा), पंखा, खरबूजा, छाता व मिष्ठान्न का दान करें।",
    "recommendedMantra": "ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "विष्णु सहस्रनाम एवं गजेन्द्र मोक्ष",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-06-30-yogini-ekadashi",
    "title": "योगिनी एकादशी व्रत (कुष्ठ व चर्म रोग निवारण)",
    "date": "2027-06-30",
    "year": 2027,
    "monthGregorian": "2027-06",
    "vedicMonth": "आषाढ़",
    "tithi": "आषाढ़ कृष्ण एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री नारायण",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 05:28 AM - 09:10 AM",
    "paranaSlot": "01 जुलाई प्रातः 05:28 AM - 07:52 AM (द्वादशी तिथि)",
    "fastType": "रोग मुक्ति एकादशी",
    "significance": "आषाढ़ कृष्ण एकादशी को योगिनी एकादशी कहते हैं। कुबेर के माली हेममाली को कुष्ठ रोग से इसी व्रत के प्रभाव से मुक्ति मिली थी। समस्त शारीरिक व मानसिक रोग दूर होते हैं।",
    "pujaVidhi": "भगवान नारायण की पूजा कर ब्राह्मणों को भोजन कराएं व वस्त्र दान करें।",
    "recommendedMantra": "ॐ नमो नारायणाय",
    "recommendedStotra": "आरोग्य स्तोत्र एवं विष्णु अष्टक",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-07-05-rath-yatra",
    "title": "भगवान जगन्नाथ रथयात्रा (पुरी धाम महामहोत्सव)",
    "date": "2027-07-05",
    "year": 2027,
    "monthGregorian": "2027-07",
    "vedicMonth": "आषाढ़",
    "tithi": "आषाढ़ शुक्ल द्वितीया",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "भगवान जगन्नाथ, बलभद्र एवं सुभद्रा",
    "emoji": "🚩",
    "shubhTime": "रथयात्रा प्रारम्भ: प्रातः 08:30 AM - दोपहर 02:00 PM",
    "paranaSlot": null,
    "fastType": "रथ दर्शन व महाप्रसाद भोग",
    "significance": "भगवान जगन्नाथ अपने भाई बलभद्र व बहन सुभद्रा के साथ रथ पर आरूढ़ होकर गुंडिचा मंदिर जाते हैं। रथ की रस्सी खींचने और दर्शन करने से पुनर्जन्म से मुक्ति मिलती है।",
    "pujaVidhi": "जगन्नाथ जी को मालपुआ व खिचड़ी का भोग लगाएं। रथयात्रा के दर्शन करें।",
    "recommendedMantra": "नीलाचलनिवासाय नित्याय परमात्मने। सुभद्राप्राणनाथाय जगन्नाथाय ते नमः॥",
    "recommendedStotra": "जगन्नाथाष्टकम्",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-07-15-devshayani-ekadashi",
    "title": "देवशयनी एकादशी व्रत (चातुर्मास प्रारम्भ / विष्णु योगनिद्रा)",
    "date": "2027-07-15",
    "year": 2027,
    "monthGregorian": "2027-07",
    "vedicMonth": "आषाढ़",
    "tithi": "आषाढ़ शुक्ल एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री हरि विष्णु (क्षीरसागर शयन)",
    "emoji": "🪷",
    "shubhTime": "विष्णु शयन पूजन: प्रातः 05:35 AM - 09:30 AM",
    "paranaSlot": "16 जुलाई प्रातः 05:35 AM - 08:05 AM (द्वादशी तिथि)",
    "fastType": "चातुर्मास व्रत प्रारम्भ",
    "significance": "भगवान विष्णु चार मास के लिए क्षीरसागर में शेषनाग की शैय्या पर योगनिद्रा में प्रविष्ट होते हैं। चातुर्मास प्रारम्भ होता है तथा विवाह आदि मांगलिक कार्य चार माह हेतु स्थगित होते हैं।",
    "pujaVidhi": "भगवान को पीले वस्त्र पहनाकर सुसज्जित शय्या पर शयन कराएं। चातुर्मास नियम का संकल्प लें।",
    "recommendedMantra": "सुप्ते त्वयि जगन्नाथ जगत् सुप्तं भवेदिदम्। विबुद्धे त्वयि बुद्धं च जगत् सर्वं चराचरम्॥",
    "recommendedStotra": "विष्णु सहस्रनाम",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-07-18-guru-purnima",
    "title": "आषाढ़ गुरु पूर्णिमा एवं महर्षि वेदव्यास पूजा",
    "date": "2027-07-18",
    "year": 2027,
    "monthGregorian": "2027-07",
    "vedicMonth": "आषाढ़",
    "tithi": "आषाढ़ शुक्ल पूर्णिमा",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "सद्गुरु देव एवं महर्षि वेदव्यास",
    "emoji": "🙏",
    "shubhTime": "गुरु पूजन मुहूर्त: प्रातः 06:30 AM - दोपहर 12:15 PM",
    "paranaSlot": null,
    "fastType": "गुरु चरण वंदना व दक्षिणा",
    "significance": "गुरु साक्षात् परब्रह्म हैं। महाभारत, अठारह पुराण व वेदों के भाष्यकार महर्षि वेदव्यास जी की जयंती। इस दिन गुरु चरणों का पूजन व गुरु दीक्षा ग्रहण से अज्ञान का अंधकार मिटता है।",
    "pujaVidhi": "गुरुदेव के चरणों का पाद्य-अर्घ्य से पूजन करें, श्वेत/पीत वस्त्र, फल व दक्षिणा अर्पित कर आशीर्वाद लें।",
    "recommendedMantra": "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः। गुरुः साक्षात् परं ब्रह्म तस्मै श्रीगुरवे नमः॥",
    "recommendedStotra": "श्री गुरु गीता एवं गुरु अष्टकम्",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2027-07-19-shravan-aarambh",
    "title": "पवित्र श्रावण मास प्रारम्भ (प्रथम श्रावण सोमवार व्रत)",
    "date": "2027-07-19",
    "year": 2027,
    "monthGregorian": "2027-07",
    "vedicMonth": "श्रावण",
    "tithi": "श्रावण कृष्ण प्रतिपदा",
    "category": "pradosh_shivratri",
    "categoryLabel": "शिव पर्व / व्रत",
    "deity": "देवाधिदेव महादेव शिव",
    "emoji": "🔱",
    "shubhTime": "दैनिक रुद्राभिषेक: प्रातः 05:30 AM - 11:30 AM एवं सायं श्रृंगार वेला",
    "paranaSlot": null,
    "fastType": "श्रावण सोमवार व्रत",
    "significance": "भगवान शिव का सबसे प्रिय मास। पूरे महीने गंगाजल, बिल्वपत्र, धतूरा व दूध से जलाभिषेक करने से समस्त मनोकामनाओं की पूर्ति होती है।",
    "pujaVidhi": "शिवलिंग पर गंगाजल व दूध की धारा चढ़ाएं। ॐ नमः शिवाय का निरंतर जप करें।",
    "recommendedMantra": "ॐ नमः शिवाय",
    "recommendedStotra": "शिव तांडव स्तोत्र एवं रुद्राष्टकम्",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2027-07-29-kamika-ekadashi",
    "title": "कामिका एकादशी व्रत (पितृ मुक्ति व बैकुंठ प्राप्ति)",
    "date": "2027-07-29",
    "year": 2027,
    "monthGregorian": "2027-07",
    "vedicMonth": "श्रावण",
    "tithi": "श्रावण कृष्ण एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री गदाधर (विष्णु)",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 05:42 AM - 09:20 AM",
    "paranaSlot": "30 जुलाई प्रातः 05:42 AM - 08:12 AM (द्वादशी तिथि)",
    "fastType": "तुलसी दल पूजन एकादशी",
    "significance": "श्रावण कृष्ण एकादशी पर तुलसी दल से भगवान विष्णु का पूजन करने से समस्त पाप नष्ट होते हैं और पितरों को मुक्ति मिलती है।",
    "pujaVidhi": "भगवान को मंजरी युक्त तुलसी दल अर्पित करें। एकादशी कथा सुनें।",
    "recommendedMantra": "ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "विष्णु सहस्रनाम",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-08-05-hariyali-teej",
    "title": "हरियाली तीज (सिंधारा तीज / माता पार्वती-शिव पुनर्मिलन)",
    "date": "2027-08-05",
    "year": 2027,
    "monthGregorian": "2027-08",
    "vedicMonth": "श्रावण",
    "tithi": "श्रावण शुक्ल तृतीया",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "माँ पार्वती एवं देवाधिदेव शिव",
    "emoji": "🌿",
    "shubhTime": "शिव-पार्वती पूजन: प्रातः 07:15 AM - 11:30 AM",
    "paranaSlot": null,
    "fastType": "अखंड सौभाग्य निर्जला व्रत",
    "significance": "माता पार्वती ने १०७ जन्मों की कठोर तपस्या के बाद १०८वें जन्म में भगवान शिव को पति रूप में प्राप्त किया था। सुहागिनें हरे वस्त्र व चूड़ियां पहनकर अखंड सौभाग्य हेतु व्रत रखती हैं।",
    "pujaVidhi": "बालू से शिव-पार्वती बनाकर षोडशोपचार पूजा करें। सुहाग पिटारी (सिंधारा) माता को अर्पित करें।",
    "recommendedMantra": "देहि सौभाग्यमारोग्यं देहि मे परमं सुखम्। रूपं देहि जयं देहि यशो देहि द्विषो जहि॥",
    "recommendedStotra": "उमामहेश्वर स्तोत्रम्",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2027-08-07-nag-panchami",
    "title": "नागपंचमी (कालसर्प दोष व सर्प भय निवारण)",
    "date": "2027-08-07",
    "year": 2027,
    "monthGregorian": "2027-08",
    "vedicMonth": "श्रावण",
    "tithi": "श्रावण शुक्ल पंचमी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "अनंत, वासुकि, तक्षक आदि अष्टनाग",
    "emoji": "🐍",
    "shubhTime": "नाग पूजन मुहूर्त: प्रातः 06:15 AM - 09:30 AM",
    "paranaSlot": null,
    "fastType": "सर्प शांति व दुग्ध अर्पण",
    "significance": "नाग देवता भगवान शिव के आभूषण और भगवान विष्णु के आसन हैं। इस दिन चांदी या तांबे के नाग-नागिन जोड़े का पूजन और दूध अर्पण से कालसर्प दोष व सर्प दंश भय से मुक्ति मिलती है।",
    "pujaVidhi": "घर के मुख्य द्वार पर गाय के गोबर या सिंदूर से नाग बनाएं। कच्चा दूध, धान का लावा व पुष्प अर्पित करें।",
    "recommendedMantra": "ॐ नवकुलाय विद्महे विषदन्ताय धीमहि तन्नो सर्पः प्रचोदयात्",
    "recommendedStotra": "नाग स्तोत्र एवं नवनाग स्तोत्र",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2027-08-13-shravan-putrada-ekadashi",
    "title": "श्रावण पुत्रदा एकादशी व्रत (पवित्रा एकादशी)",
    "date": "2027-08-13",
    "year": 2027,
    "monthGregorian": "2027-08",
    "vedicMonth": "श्रावण",
    "tithi": "श्रावण शुक्ल एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री हरि विष्णु",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 05:48 AM - 09:15 AM",
    "paranaSlot": "14 अगस्त प्रातः 05:48 AM - 08:18 AM (द्वादशी तिथि)",
    "fastType": "संतान सुख व वंश रक्षा",
    "significance": "संतान सुख की प्राप्ति एवं संतान के समस्त संकटों के निवारण हेतु श्रावण शुक्ल एकादशी का व्रत अमोघ फलदायी है।",
    "pujaVidhi": "भगवान को पंचामृत से स्नान कराएं। मक्खन व मिश्री का भोग लगाएं।",
    "recommendedMantra": "ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "संतान गोपाल स्तोत्र",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-08-17-raksha-bandhan",
    "title": "रक्षाबंधन एवं श्रावणी उपाकर्म (संस्कृत दिवस)",
    "date": "2027-08-17",
    "year": 2027,
    "monthGregorian": "2027-08",
    "vedicMonth": "श्रावण",
    "tithi": "श्रावण शुक्ल पूर्णिमा",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "भगवान श्री कृष्ण एवं माँ इन्द्राणी",
    "emoji": "🧵",
    "shubhTime": "रक्षा सूत्र बांधने का श्रेष्ठ मुहूर्त: प्रातः 06:40 AM - दोपहर 01:25 PM",
    "paranaSlot": null,
    "fastType": "रक्षा सूत्र बंधन व उपाकर्म",
    "significance": "ब्राह्मणों द्वारा उपाकर्म व यज्ञोपवीत नवीनीकरण। बहनों द्वारा भाइयों की कलाई पर रक्षा सूत्र बांधने से सुरक्षा, यश व दीर्घायु का वरदान मिलता है।",
    "pujaVidhi": "थाल में रोली, अक्षत, दीपक व राखी सजाएं। भाई को तिलक कर कलाई पर रक्षा सूत्र बांधें।",
    "recommendedMantra": "येन बद्धो बली राजा दानवेन्द्रो महाबलः। तेन त्वामनुबध्नामि रक्षे मा चल मा चल॥",
    "recommendedStotra": "रक्षा स्तोत्रम्",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2027-08-25-janmashtami",
    "title": "श्री कृष्ण जन्माष्टमी (रोहिणी नक्षत्र व्रत / कान्हा जन्मोत्सव)",
    "date": "2027-08-25",
    "year": 2027,
    "monthGregorian": "2027-08",
    "vedicMonth": "भाद्रपद",
    "tithi": "भाद्रपद कृष्ण अष्टमी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "बाल गोपाल भगवान श्री कृष्ण",
    "emoji": "🦚",
    "shubhTime": "निशीथ काल जन्मोत्सव: रात्रि 11:55 PM - 12:42 AM",
    "paranaSlot": "26 अगस्त प्रातः 05:52 AM उपरांत",
    "fastType": "जन्माष्टमी निर्जला / फलाहार महाव्रत",
    "significance": "मथुरा के कारागार में रोहिणी नक्षत्र की अर्धरात्रि को भगवान विष्णु के ८वें पूर्णावतार श्री कृष्ण का प्राकट्य हुआ। माखन-मिश्री भोग व झूला झुलाने से संतान, सुख व मोक्ष मिलता है।",
    "pujaVidhi": "खीरे से भगवान का जन्मोत्सव कराएं। पंचामृत व गंगाजल से अभिषेक कर पीताम्बर वस्त्र पहनाएं। पंजीरी व माखन-मिश्री अर्पित करें।",
    "recommendedMantra": "ॐ नमो भगवते श्री गोविन्दाय | कृं कृष्णाय नमः",
    "recommendedStotra": "गोपाल सहस्रनाम एवं मधुराष्टकम",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-08-28-aja-ekadashi",
    "title": "अजा एकादशी व्रत (खोया राज्य व सम्मान पुनः प्राप्ति)",
    "date": "2027-08-28",
    "year": 2027,
    "monthGregorian": "2027-08",
    "vedicMonth": "भाद्रपद",
    "tithi": "भाद्रपद कृष्ण एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री ऋषिकेश",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 05:54 AM - 09:10 AM",
    "paranaSlot": "29 अगस्त प्रातः 05:54 AM - 08:24 AM (द्वादशी तिथि)",
    "fastType": "कष्ट निवारक व्रत",
    "significance": "सत्यवादी राजा हरिश्चंद्र ने इसी व्रत के प्रभाव से खोया हुआ राज्य, पत्नी व पुत्र पुनः प्राप्त किया था। समस्त प्रकार के कष्टों का अंत होता है।",
    "pujaVidhi": "भगवान ऋषिकेश की पूजा करें। एकादशी कथा का श्रवण करें।",
    "recommendedMantra": "ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "विष्णु सहस्रनाम",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-09-04-hartalika-teej",
    "title": "हरतालिका तीज व्रत (अखण्ड सौभाग्य एवं सुयोग्य वर प्राप्ति)",
    "date": "2027-09-04",
    "year": 2027,
    "monthGregorian": "2027-09",
    "vedicMonth": "भाद्रपद",
    "tithi": "भाद्रपद शुक्ल तृतीया",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "माता पार्वती एवं देवाधिदेव महादेव शिव",
    "emoji": "🪞",
    "shubhTime": "प्रातः पूजन: 06:05 AM - 08:35 AM | प्रदोष काल पूजा: सायं 06:15 PM - 08:45 PM",
    "paranaSlot": "05 सितम्बर प्रातः 06:02 AM उपरांत",
    "fastType": "२४ घण्टे का कठिन निर्जला व्रत",
    "significance": "माता पार्वती की सखियों ने उनका हरण कर वन में छिपाया था जहां उन्होंने बालू के शिवलिंग बनाकर कठोर तप किया था। अखंड सौभाग्य, पति रक्षा व कन्याओं को सुयोग्य वर प्राप्ति हेतु महाव्रत।",
    "pujaVidhi": "बालू या काली मिट्टी से शिव-पार्वती व गणेश बनाएं। सोलह श्रृंगार की सामग्री माता को अर्पित करें। चार प्रहर जागरण कर कथा सुनें।",
    "recommendedMantra": "ॐ उमामहेश्वराभ्यां नमः",
    "recommendedStotra": "पार्वती स्तोत्र एवं शिव स्तुति",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2027-09-05-ganesh-chaturthi",
    "title": "श्री गणेश चतुर्थी (१० दिवसीय गणेशोत्सव प्रारम्भ / गणपति स्थापना)",
    "date": "2027-09-05",
    "year": 2027,
    "monthGregorian": "2027-09",
    "vedicMonth": "भाद्रपद",
    "tithi": "भाद्रपद शुक्ल चतुर्थी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "विघ्नविनाशक मंगलमूर्ति श्री गणेश जी",
    "emoji": "🐘",
    "shubhTime": "गणपति स्थापना मध्याह्न मुहूर्त: पूर्वाह्न 11:05 AM - दोपहर 01:35 PM",
    "paranaSlot": null,
    "fastType": "गणेशोत्सव प्रारम्भ",
    "significance": "मोदक प्रिय विघ्नविनाशक भगवान गणेश जी का प्राकट्य दिवस। घर-घर गणपति स्थापना और २१ दूर्वा अर्पण से समस्त विघ्न व दरिद्रता नष्ट होकर रिद्धि-सिद्धि का वास होता है।",
    "pujaVidhi": "चौकी पर लाल वस्त्र बिछाकर गणेश जी की स्थापना करें। सिंदूर, २१ दूर्वा, मोदक, लड्डू व जनेऊ अर्पित करें।",
    "recommendedMantra": "ॐ गं गणपतये नमः | वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
    "recommendedStotra": "गणेश अथर्वशीर्ष एवं संकटनाशन गणेश स्तोत्र",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2027-09-12-parivartini-ekadashi",
    "title": "परिवर्तिनी एकादशी व्रत (वामन जयंती / करवट बदलना)",
    "date": "2027-09-12",
    "year": 2027,
    "monthGregorian": "2027-09",
    "vedicMonth": "भाद्रपद",
    "tithi": "भाद्रपद शुक्ल एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान वामन एवं श्री विष्णु",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 06:00 AM - 09:30 AM",
    "paranaSlot": "13 सितम्बर प्रातः 06:00 AM - 08:30 AM (द्वादशी तिथि)",
    "fastType": "वामन अवतार पूजन व्रत",
    "significance": "इस दिन क्षीरसागर में शयन करते हुए भगवान विष्णु करवट बदलते हैं। इसी दिन भगवान विष्णु ने वामन अवतार लेकर राजा बलि का उद्धार किया था।",
    "pujaVidhi": "भगवान वामन की पूजा करें। चावल व दही का दान करना अत्यंत शुभ माना गया है।",
    "recommendedMantra": "ॐ वामनाय नमः | ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "वामन स्तोत्रम्",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-09-14-anant-chaturdashi",
    "title": "अनंत चतुर्दशी (अनंत सूत्र बंधन एवं गणेश विसर्जन)",
    "date": "2027-09-14",
    "year": 2027,
    "monthGregorian": "2027-09",
    "vedicMonth": "भाद्रपद",
    "tithi": "भाद्रपद शुक्ल चतुर्दशी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "अनंत रूपी भगवान श्री हरि विष्णु एवं गणेश जी",
    "emoji": "🧵",
    "shubhTime": "अनंत पूजन मुहूर्त: प्रातः 06:05 AM - 11:45 AM | विसर्जन: शुभ वेला में",
    "paranaSlot": null,
    "fastType": "१४ गांठों का अनंत सूत्र बंधन",
    "significance": "पांडवों ने अपने कष्टों से मुक्ति हेतु यह व्रत किया था। १४ गांठों वाले अनंत डोरे को बाजू में बांधने से समस्त संकट दूर होकर अनंत सुख की प्राप्ति होती है। १० दिवसीय गणेशोत्सव का विसर्जन भी इसी दिन होता है।",
    "pujaVidhi": "कच्चे सूत में १४ गांठ लगाकर हल्दी से रंगें। भगवान अनंत के सामने रखकर पूजा करें और दाईं भुजा पर बांधें।",
    "recommendedMantra": "अनंत संसार महासमुद्रे मग्नं समभ्युद्धर वासुदेव। अनंतरूपे विनियोजयस्व ह्यनंतसूत्राय नमो नमस्ते॥",
    "recommendedStotra": "अनंत स्तोत्र एवं विष्णु सहस्रनाम",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-09-15-pitrupaksha-aarambh",
    "title": "महालय पितृपक्ष प्रारम्भ (१६ श्राद्ध / काशी पञ्चगंगा पितृ तर्पण)",
    "date": "2027-09-15",
    "year": 2027,
    "monthGregorian": "2027-09",
    "vedicMonth": "भाद्रपद",
    "tithi": "भाद्रपद शुक्ल पूर्णिमा / आश्विन कृष्ण प्रतिपदा",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "पितृदेव एवं धर्मराज यम",
    "emoji": "🌾",
    "shubhTime": "कुतुप एवं रौहिण वेला (तर्पण-श्राद्ध): पूर्वाह्न 11:40 AM - दोपहर 02:25 PM",
    "paranaSlot": null,
    "fastType": "पितृ ऋण मुक्ति व श्राद्ध",
    "significance": "१६ दिनों तक पूर्वज पृथ्वी पर अपने परिजनों के पास आते हैं। तिल, कुश व गंगाजल से तर्पण तथा पिण्डदान करने से पितृदोष शांत होता है और वंश में सुख-शांति रहती है।",
    "pujaVidhi": "कुतुप वेला में दक्षिण मुख बैठकर तिल, कुश व जल से पितरों का तर्पण करें। कौवे, गाय व कुत्ते को ग्रास दें।",
    "recommendedMantra": "ॐ पितृभ्यः स्वधायिभ्यः स्वधा नमः",
    "recommendedStotra": "पितृ सूक्त एवं गरुड़ पुराण सार",
    "recommendedPuja": "त्रिपिंडी श्राद्ध एवं पितृदोष शांति",
    "pujaId": "puja-3"
  },
  {
    "id": "fest-2027-09-26-indira-ekadashi",
    "title": "इन्दिरा एकादशी व्रत (पितृपक्ष एकादशी / पितरों को बैकुंठ गमन)",
    "date": "2027-09-26",
    "year": 2027,
    "monthGregorian": "2027-09",
    "vedicMonth": "आश्विन",
    "tithi": "आश्विन कृष्ण एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री शालिग्राम",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन व श्राद्ध: प्रातः 06:06 AM - दोपहर 12:15 PM",
    "paranaSlot": "27 सितम्बर प्रातः 06:06 AM - 08:36 AM (द्वादशी तिथि)",
    "fastType": "पितृ मोक्ष प्रदायक व्रत",
    "significance": "पितृपक्ष में पड़ने वाली यह एकादशी पितरों के मोक्ष के लिए सर्वोत्तम है। इस व्रत का पुण्य फल यदि पूर्वजों को संकल्पित कर दिया जाए, तो वे यमलोक की यातना से मुक्त होकर बैकुंठ जाते हैं।",
    "pujaVidhi": "शालिग्राम जी का पूजन कर एकादशी का फल पितरों को समर्पित करें। ब्राह्मणों को भोजन कराएं।",
    "recommendedMantra": "ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "विष्णु सहस्रनाम एवं पितृ स्तोत्र",
    "recommendedPuja": "त्रिपिंडी श्राद्ध एवं पितृदोष शांति",
    "pujaId": "puja-3"
  },
  {
    "id": "fest-2027-09-30-sarvapitru-amavasya",
    "title": "सर्वपितृ अमावस्या (महालय समापन / अज्ञात तिथि श्राद्ध)",
    "date": "2027-09-30",
    "year": 2027,
    "monthGregorian": "2027-09",
    "vedicMonth": "आश्विन",
    "tithi": "आश्विन कृष्ण अमावस्या",
    "category": "purnima_amavasya",
    "categoryLabel": "पूर्णिमा व अमावस्या",
    "deity": "समस्त ज्ञात-अज्ञात पितृगण",
    "emoji": "🌑",
    "shubhTime": "सर्वपितृ श्राद्ध व तर्पण: पूर्वाह्न 11:35 AM - दोपहर 02:30 PM",
    "paranaSlot": null,
    "fastType": "पितृ विदाई व महातर्पण",
    "significance": "पितृपक्ष का अंतिम दिन। जिन पूर्वजों की मृत्यु तिथि ज्ञात न हो, उन सभी का श्राद्ध इसी दिन किया जाता है। पितृगण तृप्त होकर आशीर्वाद देकर विदा होते हैं।",
    "pujaVidhi": "१६ प्रकार के अन्न का भोजन बनाएं, पंचबलि (गाय, कुत्ता, कौवा, देवादि, चींटी) निकालें और ब्राह्मणों को भोजन कराएं।",
    "recommendedMantra": "ॐ सर्वपितृ देवताभ्यो नमः",
    "recommendedStotra": "पितृ गायत्री एवं पितृ कवच",
    "recommendedPuja": "त्रिपिंडी श्राद्ध एवं पितृदोष शांति",
    "pujaId": "puja-3"
  },
  {
    "id": "fest-2027-10-01-shardiya-navratri",
    "title": "शारदीय नवरात्रि घटस्थापना (माँ दुर्गा आराधना प्रारम्भ)",
    "date": "2027-10-01",
    "year": 2027,
    "monthGregorian": "2027-10",
    "vedicMonth": "आश्विन",
    "tithi": "आश्विन शुक्ल प्रतिपदा",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "माँ शैलपुत्री / जगदम्बा भवानी",
    "emoji": "🚩",
    "shubhTime": "कलश स्थापना मुहूर्त: प्रातः 06:15 AM - 10:20 AM (अभिजित: 11:45 AM - 12:35 PM)",
    "paranaSlot": null,
    "fastType": "महानवरात्रि शक्ति व्रत",
    "significance": "आदिशक्ति माँ दुर्गा की उपासना का वर्ष का सबसे प्रमुख महापर्व। नौ दिनों तक दुर्गा सप्तशती पाठ, अखण्ड दीप एवं व्रत से समस्त प्रकार के भय, शत्रु बाधा और रोगों का निवारण होता है।",
    "pujaVidhi": "मिट्टी की वेदी पर जौ बोएं, तांबे/मिट्टी के कलश पर श्रीफल स्थापित करें। अखण्ड ज्योति जलाएं।",
    "recommendedMantra": "सर्वमङ्गलमङ्गल्ये शिवे सर्वार्थसाधिके। शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥",
    "recommendedStotra": "दुर्गा सप्तशती एवं सिद्ध कुंजिका स्तोत्र",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2027-10-08-durga-ashtami",
    "title": "दुर्गा महाअष्टमी (माँ महागौरी पूजन एवं महाहवन)",
    "date": "2027-10-08",
    "year": 2027,
    "monthGregorian": "2027-10",
    "vedicMonth": "आश्विन",
    "tithi": "आश्विन शुक्ल अष्टमी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "माँ महागौरी एवं माँ अन्नपूर्णा",
    "emoji": "🌺",
    "shubhTime": "महाअष्टमी पूजन व हवन: प्रातः 07:15 AM - दोपहर 12:30 PM | संधि पूजा: सायं 06:15 PM",
    "paranaSlot": null,
    "fastType": "महाअष्टमी व्रत व कन्या पूजन",
    "significance": "माँ दुर्गा के आठवें स्वरूप महागौरी का पूजन। इस दिन हवन और कन्या पूजन करने से समस्त दारिद्र्य का नाश होकर अक्षय सौभाग्य व वैभव की प्राप्ति होती है।",
    "pujaVidhi": "माँ महागौरी को श्वेत पुष्प व हलवा-चना अर्पित करें। नौ कन्याओं और एक बटुक (लंगूर) का पाँव धोकर पूजन व भोजन कराएं।",
    "recommendedMantra": "श्वेते वृषे समारूढा श्वेताम्बरधरा शुचिः। महागौरी शुभं दद्यान्महादेवप्रमोददा॥",
    "recommendedStotra": "महागौरी स्तोत्र एवं भवानी अष्टक",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2027-10-10-vijayadashami",
    "title": "विजयादशमी / दशहरा (अपराजिता, शस्त्र एवं शमी पूजन)",
    "date": "2027-10-10",
    "year": 2027,
    "monthGregorian": "2027-10",
    "vedicMonth": "आश्विन",
    "tithi": "आश्विन शुक्ल दशमी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "मर्यादा पुरुषोत्तम प्रभु श्री राम एवं माँ अपराजिता",
    "emoji": "🏹",
    "shubhTime": "विजय मुहूर्त: दोपहर 02:05 PM - 02:52 PM | शमी पूजन: सायं 05:35 PM",
    "paranaSlot": null,
    "fastType": "सर्वकार्य सिद्धि व विजय पर्व",
    "significance": "भगवान श्री राम द्वारा लंकापति रावण का वध तथा माँ दुर्गा द्वारा महिषासुर मर्दन। इस दिन शमी पत्र (स्वर्ण पत्र) अर्पण और शस्त्र पूजन से सर्वत्र विजय की प्राप्ति होती है।",
    "pujaVidhi": "अपराजिता देवी और शमी वृक्ष का पूजन करें। 'शमी शमयते पापम्' मंत्र पढ़कर शमी पत्र एक-दूसरे को भेंट करें।",
    "recommendedMantra": "शमी शमयते पापं शमी लोहितकण्टका। धारिण्यर्जुनबाणानां रामस्य प्रियवादिनी॥",
    "recommendedStotra": "अपराजिता स्तोत्रम्",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-10-11-papankusha-ekadashi",
    "title": "पापांकुशा एकादशी व्रत (पापों पर अंकुश लगाने वाली)",
    "date": "2027-10-11",
    "year": 2027,
    "monthGregorian": "2027-10",
    "vedicMonth": "आश्विन",
    "tithi": "आश्विन शुक्ल एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान पद्मनाभ (श्री हरि)",
    "emoji": "🪷",
    "shubhTime": "विष्णु पूजन: प्रातः 06:12 AM - 09:20 AM",
    "paranaSlot": "12 अक्टूबर प्रातः 06:12 AM - 08:42 AM (द्वादशी तिथि)",
    "fastType": "स्वर्ग प्रदायक एकादशी",
    "significance": "जो मनुष्य इस एकादशी का व्रत करता है, उसके समस्त पापों पर अंकुश लग जाता है और यमदूतों का भय समाप्त होकर मोक्ष धाम मिलता है।",
    "pujaVidhi": "भगवान पद्मनाभ की पूजा करें। सुवर्ण, तिल, भूमि या गौ का यथाशक्ति दान करें।",
    "recommendedMantra": "ॐ पद्मनाभाय नमः",
    "recommendedStotra": "विष्णु सहस्रनाम",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-10-15-sharad-purnima",
    "title": "शरद पूर्णिमा (कोजागरी लक्ष्मी पूजा / अमृत वर्षा खीर प्रसाद)",
    "date": "2027-10-15",
    "year": 2027,
    "monthGregorian": "2027-10",
    "vedicMonth": "आश्विन",
    "tithi": "आश्विन शुक्ल पूर्णिमा",
    "category": "purnima_amavasya",
    "categoryLabel": "पूर्णिमा व अमावस्या",
    "deity": "माँ महालक्ष्मी, चंद्रदेव एवं श्री कृष्ण",
    "emoji": "🌕",
    "shubhTime": "लक्ष्मी पूजन: सायं 06:05 PM - रात्रि 11:30 PM | चंद्रोदय: सायं 05:40 PM",
    "paranaSlot": null,
    "fastType": "अमृत खीर भोग व जागरण",
    "significance": "वर्ष की एकमात्र रात्रि जब चन्द्रमा १६ कलाओं से युक्त होकर अमृत वर्षा करता है। खुले आसमान के नीचे रखी खीर का प्रसाद ग्रहण करने से असाध्य रोगों व चर्मविकार से मुक्ति मिलती है। माता लक्ष्मी 'को जागर्ति' (कौन जाग रहा है) पूछती हुई धन वर्षा करती हैं।",
    "pujaVidhi": "चावल व गाय के दूध की खीर बनाकर छलनी से ढंककर चांदनी में रखें। मध्यरात्रि में माँ लक्ष्मी की पूजा कर खीर का भोग लगाकर प्रसाद ग्रहण करें।",
    "recommendedMantra": "ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद श्रीं ह्रीं श्रीं ॐ महालक्ष्म्यै नमः॥",
    "recommendedStotra": "कनकधारा स्तोत्र एवं महालक्ष्मी अष्टकम",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-10-19-karwa-chauth",
    "title": "करवा चौथ पावन व्रत (अखण्ड सौभाग्य महापर्व / चंद्रोदय अर्घ्य)",
    "date": "2027-10-19",
    "year": 2027,
    "monthGregorian": "2027-10",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक कृष्ण चतुर्थी",
    "category": "chaturthi",
    "categoryLabel": "चतुर्थी व्रत",
    "deity": "माता करवा, भगवान गणेश एवं चंद्रदेव",
    "emoji": "🌙",
    "shubhTime": "करवा चौथ पूजन मुहूर्त: सायं 05:45 PM - 07:05 PM | चंद्रोदय समय: रात्रि 08:15 PM",
    "paranaSlot": "रात्रि 08:15 PM (चंद्र दर्शन उपरांत)",
    "fastType": "कठिन निर्जला सुहाग व्रत",
    "significance": "सुहागिन स्त्रियां पति की दीर्घायु, उत्तम स्वास्थ्य एवं अखंड सौभाग्य के लिए सूर्योदय से लेकर चंद्रोदय तक निर्जला व्रत रखती हैं। छलनी से चंद्रदेव व पतिदेव के दर्शन कर अर्घ्य देकर व्रत खोला जाता है।",
    "pujaVidhi": "दीवार पर करवा चौथ का चित्र बनाएं, मिट्टी के करवे में गेहूं व ढक्कन में चीनी भरें। करवा माता की कथा सुनें। रात्रि में छलनी से चंद्रदेव को देखकर जल से अर्घ्य दें।",
    "recommendedMantra": "नमः शिवायै शर्वाण्यै सौभाग्यं संततिं शुभाम्। प्रयच्छ भक्तियुक्तायै नारीणां हरवल्लभे॥",
    "recommendedStotra": "शिव-पार्वती स्तुति एवं करवा चौथ आरती",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2027-10-23-ahoi-ashtami",
    "title": "अहोई अष्टमी व्रत (संतान दीर्घायु, रक्षा एवं सौभाग्य पर्व)",
    "date": "2027-10-23",
    "year": 2027,
    "monthGregorian": "2027-10",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक कृष्ण अष्टमी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "अहोई माता (माँ पार्वती स्वरूप)",
    "emoji": "⭐",
    "shubhTime": "अहोई पूजन मुहूर्त: सायं 05:42 PM - 07:00 PM | तारों के दर्शन: सायं 06:12 PM",
    "paranaSlot": "तारों के दर्शन उपरांत",
    "fastType": "संतान रक्षा निर्जला व्रत",
    "significance": "माताएं अपनी संतानों की लंबी आयु, आरोग्य एवं संकटों से रक्षा हेतु दिन भर निर्जला व्रत रखती हैं। सायं तारों के दर्शन और अर्घ्य देकर व्रत खोला जाता है।",
    "pujaVidhi": "दीवार पर गेरू से अहोई माता व आठ कोष्ठक बनाएं। चांदी की अहोई (स्याऊ) की पूजा करें। सायं तारों को करवे से अर्घ्य देकर जल ग्रहण करें।",
    "recommendedMantra": "ॐ अहोई मातायै नमः",
    "recommendedStotra": "अहोई माता आरती एवं कथा",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2028-01-08-paush-putrada",
    "title": "पौष पुत्रदा एकादशी व्रत (वर्ष २०२८)",
    "date": "2028-01-08",
    "year": 2028,
    "monthGregorian": "2028-01",
    "vedicMonth": "पौष",
    "tithi": "पौष शुक्ल एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री कृष्ण",
    "emoji": "👶",
    "shubhTime": "विष्णु पूजन: प्रातः 07:15 AM - 10:45 AM",
    "paranaSlot": "09 जनवरी प्रातः 07:12 AM - 09:20 AM (द्वादशी तिथि)",
    "fastType": "संतान सुख व्रत",
    "significance": "पौष शुक्ल पक्ष की पुत्रदा एकादशी संतान सुख व कुल रक्षा हेतु फलदायी है।",
    "pujaVidhi": "भगवान बाल गोपाल का पंचामृत अभिषेक करें।",
    "recommendedMantra": "ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "संतान गोपाल स्तोत्र",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2028-01-14-makar-sankranti-28",
    "title": "मकर संक्रांति (उत्तरायण सूर्य प्रवेश / वर्ष २०२८)",
    "date": "2028-01-14",
    "year": 2028,
    "monthGregorian": "2028-01",
    "vedicMonth": "पौष",
    "tithi": "पौष शुक्ल त्रयोदशी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "भगवान सूर्य नारायण",
    "emoji": "🪁",
    "shubhTime": "संक्रांति पुण्यकाल: प्रातः 07:15 AM - दोपहर 01:00 PM",
    "paranaSlot": null,
    "fastType": "तिल-गुड़ व खिचड़ी दान",
    "significance": "सूर्य का मकर राशि में प्रवेश। दान-पुण्य व गंगा स्नान से अक्षय पुण्य मिलता है।",
    "pujaVidhi": "सूर्य देव को तांबे के लोटे से अर्घ्य दें व खिचड़ी दान करें।",
    "recommendedMantra": "ॐ सूर्याय नमः",
    "recommendedStotra": "आदित्य हृदय स्तोत्र",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2028-01-31-vasant-panchami-28",
    "title": "वसंत पंचमी एवं सरस्वती प्राकट्योत्सव (वर्ष २०२८)",
    "date": "2028-01-31",
    "year": 2028,
    "monthGregorian": "2028-01",
    "vedicMonth": "माघ",
    "tithi": "माघ शुक्ल पंचमी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "माँ सरस्वती",
    "emoji": "🪕",
    "shubhTime": "सरस्वती पूजन: प्रातः 07:10 AM - दोपहर 12:40 PM",
    "paranaSlot": null,
    "fastType": "पीत वस्त्र धारण व ज्ञान पूजा",
    "significance": "विद्या, वाणी व कला की देवी माँ सरस्वती की आराधना का पावन दिन।",
    "pujaVidhi": "माँ सरस्वती को पीले फूल व फल अर्पित करें।",
    "recommendedMantra": "ॐ ऐं सरस्वत्यै नमः",
    "recommendedStotra": "सरस्वती वंदना",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2028-02-23-mahashivratri-28",
    "title": "महाशिवरात्रि महापर्व (वर्ष २०२८)",
    "date": "2028-02-23",
    "year": 2028,
    "monthGregorian": "2028-02",
    "vedicMonth": "फाल्गुन",
    "tithi": "फाल्गुन कृष्ण चतुर्दशी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "भगवान शिव एवं माता पार्वती",
    "emoji": "🔱",
    "shubhTime": "निशीथ काल: रात्रि 11:55 PM - 12:46 AM",
    "paranaSlot": "24 फरवरी प्रातः 06:40 AM उपरांत",
    "fastType": "महाशिवरात्रि महाव्रत",
    "significance": "भगवान शिव और माता पार्वती का विवाह महोत्सव। रुद्राभिषेक से समस्त पाप भस्म होते हैं।",
    "pujaVidhi": "शिवलिंग पर गंगाजल, दूध, धतूरा व बेलपत्र चढ़ाएं।",
    "recommendedMantra": "ॐ नमः शिवाय",
    "recommendedStotra": "शिव तांडव स्तोत्रम्",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  },
  {
    "id": "fest-2028-03-10-holi-28",
    "title": "होलिका दहन एवं रंगों का महापर्व होली (वर्ष २०२८)",
    "date": "2028-03-10",
    "year": 2028,
    "monthGregorian": "2028-03",
    "vedicMonth": "फाल्गुन",
    "tithi": "फाल्गुन शुक्ल पूर्णिमा",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "भक्त प्रह्लाद व राधा-कृष्ण",
    "emoji": "🎊",
    "shubhTime": "होलिका दहन: रात्रि 09:15 PM - 11:40 PM | 11 मार्च: धुलेंडी",
    "paranaSlot": null,
    "fastType": "अग्नि पूजन व रंगोत्सव",
    "significance": "अधर्म पर धर्म की विजय। आपसी प्रेम व सौहार्द का पावन महापर्व।",
    "pujaVidhi": "होलिका पूजन कर अग्नि परिक्रमा करें।",
    "recommendedMantra": "ॐ नृसिंहाय नमः",
    "recommendedStotra": "नृसिंह स्तुति",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2028-03-27-chaitra-navratri-28",
    "title": "हिन्दू नववर्ष संवत २०८५ एवं चैत्र नवरात्रि प्रारम्भ (वर्ष २०२८)",
    "date": "2028-03-27",
    "year": 2028,
    "monthGregorian": "2028-03",
    "vedicMonth": "चैत्र",
    "tithi": "चैत्र शुक्ल प्रतिपदा",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "माँ दुर्गा / शैलपुत्री",
    "emoji": "🚩",
    "shubhTime": "कलश स्थापना: प्रातः 06:15 AM - 10:25 AM",
    "paranaSlot": null,
    "fastType": "नवरात्रि शक्ति व्रत",
    "significance": "हिन्दू नव संवत्सर २०८५ प्रारम्भ एवं शक्ति उपासना का पर्व।",
    "pujaVidhi": "कलश स्थापना कर दुर्गा सप्तशती पाठ प्रारम्भ करें।",
    "recommendedMantra": "ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे",
    "recommendedStotra": "देवी कवचम्",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2028-04-04-ram-navami-28",
    "title": "श्री राम नवमी (वर्ष २०२८)",
    "date": "2028-04-04",
    "year": 2028,
    "monthGregorian": "2028-04",
    "vedicMonth": "चैत्र",
    "tithi": "चैत्र शुक्ल नवमी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "प्रभु श्री राम",
    "emoji": "🏹",
    "shubhTime": "जन्मोत्सव मुहूर्त: 11:08 AM - 01:38 PM",
    "paranaSlot": null,
    "fastType": "जन्मोत्सव व्रत",
    "significance": "मर्यादा पुरुषोत्तम प्रभु श्री राम का पावन प्राकट्य दिवस।",
    "pujaVidhi": "मध्याह्न १२ बजे राम लला का पूजन व आरती करें।",
    "recommendedMantra": "श्री राम जय राम जय जय राम",
    "recommendedStotra": "श्री राम रक्षा स्तोत्रम्",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2028-06-04-nirjala-28",
    "title": "निर्जला एकादशी (भीमसेनी एकादशी - वर्ष २०२८)",
    "date": "2028-06-04",
    "year": 2028,
    "monthGregorian": "2028-06",
    "vedicMonth": "ज्येष्ठ",
    "tithi": "ज्येष्ठ शुक्ल एकादशी",
    "category": "ekadashi",
    "categoryLabel": "एकादशी व्रत",
    "deity": "भगवान श्री हरि विष्णु",
    "emoji": "💧",
    "shubhTime": "विष्णु पूजन: प्रातः 06:10 AM - 09:30 AM",
    "paranaSlot": "05 जून प्रातः 05:25 AM - 07:50 AM (द्वादशी तिथि)",
    "fastType": "जलहीन निर्जला महाव्रत",
    "significance": "साल की सबसे बड़ी एकादशी। जल व अन्न का त्याग कर २४ एकादशियों का फल मिलता है।",
    "pujaVidhi": "भगवान विष्णु की पूजा कर जल से भरा घड़ा व पंखा दान करें।",
    "recommendedMantra": "ॐ नमो भगवते वासुदेवाय",
    "recommendedStotra": "विष्णु सहस्रनाम",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2028-08-05-rakhi-28",
    "title": "रक्षाबंधन एवं श्रावणी उपाकर्म (वर्ष २०२८)",
    "date": "2028-08-05",
    "year": 2028,
    "monthGregorian": "2028-08",
    "vedicMonth": "श्रावण",
    "tithi": "श्रावण शुक्ल पूर्णिमा",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "भगवान श्री कृष्ण",
    "emoji": "🧵",
    "shubhTime": "राखी बांधने का मुहूर्त: प्रातः 06:35 AM - दोपहर 01:20 PM",
    "paranaSlot": null,
    "fastType": "रक्षा सूत्र पर्व",
    "significance": "भाई-बहन के स्नेह व रक्षा का पावन पर्व।",
    "pujaVidhi": "भाई की कलाई पर रक्षा सूत्र बांधें।",
    "recommendedMantra": "येन बद्धो बली राजा दानवेन्द्रो महाबलः...",
    "recommendedStotra": "रक्षा स्तोत्रम्",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2028-08-13-janmashtami-28",
    "title": "श्री कृष्ण जन्माष्टमी (वर्ष २०२८)",
    "date": "2028-08-13",
    "year": 2028,
    "monthGregorian": "2028-08",
    "vedicMonth": "भाद्रपद",
    "tithi": "भाद्रपद कृष्ण अष्टमी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "बाल गोपाल श्री कृष्ण",
    "emoji": "🦚",
    "shubhTime": "निशीथ काल: रात्रि 11:58 PM - 12:45 AM",
    "paranaSlot": "14 अगस्त प्रातः 05:50 AM उपरांत",
    "fastType": "जन्मोत्सव महाव्रत",
    "significance": "भगवान श्री कृष्ण का प्राकट्य दिवस। माखन-मिश्री का भोग लगाएं।",
    "pujaVidhi": "पंचामृत से अभिषेक कर झूला झुलाएं।",
    "recommendedMantra": "कृं कृष्णाय नमः",
    "recommendedStotra": "गोपाल सहस्रनाम",
    "recommendedPuja": "सत्यनारायण भगवान की कथा व पूजन",
    "pujaId": "puja-4"
  },
  {
    "id": "fest-2028-08-25-ganesh-chaturthi-28",
    "title": "श्री गणेश चतुर्थी (गणेशोत्सव प्रारम्भ - वर्ष २०२८)",
    "date": "2028-08-25",
    "year": 2028,
    "monthGregorian": "2028-08",
    "vedicMonth": "भाद्रपद",
    "tithi": "भाद्रपद शुक्ल चतुर्थी",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "विघ्नहर्ता श्री गणेश",
    "emoji": "🐘",
    "shubhTime": "गणपति स्थापना: पूर्वाह्न 11:05 AM - दोपहर 01:30 PM",
    "paranaSlot": null,
    "fastType": "गणेशोत्सव प्रारम्भ",
    "significance": "विघ्नविनाशक गणेश जी का प्राकट्य दिवस। २१ दूर्वा व मोदक से पूजा करें।",
    "pujaVidhi": "गणपति स्थापना कर मोदक अर्पित करें।",
    "recommendedMantra": "ॐ गं गणपतये नमः",
    "recommendedStotra": "गणेश अथर्वशीर्ष",
    "recommendedPuja": "नवग्रह शांति महायज्ञ एवं पूजन",
    "pujaId": "puja-2"
  },
  {
    "id": "fest-2028-10-17-diwali-28",
    "title": "दीपावली महालक्ष्मी पूजन (वर्ष २०२८)",
    "date": "2028-10-17",
    "year": 2028,
    "monthGregorian": "2028-10",
    "vedicMonth": "कार्तिक",
    "tithi": "कार्तिक कृष्ण अमावस्या",
    "category": "mahaparva",
    "categoryLabel": "प्रमुख महापर्व",
    "deity": "माँ महालक्ष्मी एवं श्री गणेश",
    "emoji": "🪔",
    "shubhTime": "प्रदोष काल (वृषभ लग्न): सायं 05:45 PM - 07:40 PM | महानिशीथ काल: 11:35 PM - 12:28 AM",
    "paranaSlot": null,
    "fastType": "दीपावली महापूजा",
    "significance": "प्रकाश पर्व। स्थिर लग्न में महालक्ष्मी की षोडशोपचार पूजा से कभी दरिद्रता नहीं आती।",
    "pujaVidhi": "श्री सूक्त व कनकधारा स्तोत्र से पूजन करें।",
    "recommendedMantra": "ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः",
    "recommendedStotra": "श्री सूक्तम् एवं कनकधारा स्तोत्र",
    "recommendedPuja": "वैदिक रुद्राभिषेक (नमक-चमक विधि)",
    "pujaId": "puja-1"
  }
];

const DAILY_SHLOKAS = [
  {
    day: 'रविवार',
    deity: 'भगवान श्री सूर्यनारायण',
    mantra: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    meaning: 'भावार्थ: हे जगत् के प्रकाशक परब्रह्म सूर्य नारायण! हमारी बुद्धि को सन्मार्ग एवं सत्य के मार्ग पर प्रेरित करें।',
    greeting: '॥ ॐ सूर्याय नमः ॥'
  },
  {
    day: 'सोमवार',
    deity: 'देवाधिदेव महादेव शिव',
    mantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्॥',
    meaning: 'भावार्थ: हम त्रिनेत्रधारी भगवान शिव का वंदन करते हैं, जो समस्त व्याधियों व मृत्यु-भय से मुक्त कर अमृतत्व प्रदान करते हैं।',
    greeting: '॥ ॐ नमः शिवाय ॥'
  },
  {
    day: 'मंगलवार',
    deity: 'संकटमोचन श्री हनुमान जी',
    mantra: 'मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्। वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये॥',
    meaning: 'भावार्थ: मन के समान तीव्र वेग वाले, जितेन्द्रिय एवं बुद्धिमानों में श्रेष्ठ श्री रामदूत हनुमान जी को हम प्रणाम करते हैं।',
    greeting: '॥ जय श्री राम • जय हनुमान ॥'
  },
  {
    day: 'बुधवार',
    deity: 'विघ्नहर्ता श्री गणेश जी',
    mantra: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    meaning: 'भावार्थ: करोड़ों सूर्यों के समान तेजस्वी विघ्नहर्ता भगवान श्री गणेश हमारे समस्त कार्यों को निर्विघ्न सिद्ध करें।',
    greeting: '॥ ॐ गं गणपतये नमः ॥'
  },
  {
    day: 'गुरुवार',
    deity: 'भगवान लक्ष्मीनारायण व गुरु',
    mantra: 'शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्। वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम्॥',
    meaning: 'भावार्थ: शांत स्वरूप, संसार के आधार जगत्पालक भगवान श्री लक्ष्मीनारायण समस्त भय हरने वाले हैं।',
    greeting: '॥ ॐ नमो भगवते वासुदेवाय ॥'
  },
  {
    day: 'शुक्रवार',
    deity: 'आदिशक्ति माँ महालक्ष्मी',
    mantra: 'नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते। शङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते॥',
    meaning: 'भावार्थ: समस्त ऐश्वर्य व सौभाग्य की अधिष्ठात्री आदिशक्ति माँ महालक्ष्मी की हम वंदना करते हैं।',
    greeting: '॥ ॐ महालक्ष्म्यै नमः ॥'
  },
  {
    day: 'शनिवार',
    deity: 'कर्मफलदाता शनिदेव व हनुमान जी',
    mantra: 'नीलांजन समाभासं रविपुत्रं यमाग्रजम्। छायामार्तण्ड संभूतं तं नमामि शनैश्चरम्॥',
    meaning: 'भावार्थ: न्यायप्रिय सूर्यपुत्र भगवान श्री शनिदेव की कृपा से समस्त कष्टों एवं बाधाओं का निवारण हो।',
    greeting: '॥ ॐ शं शनैश्चराय नमः ॥'
  }
];

const SHUBH_MUHURATS_DATA = [
  {
    id: "muh-1",
    title: "सर्वार्थ सिद्धि युक्त गृह प्रवेश मुहूर्त",
    category: "griha-pravesh",
    categoryName: "गृह प्रवेश",
    emoji: "🏡",
    date: "2026-10-02",
    dateFormatted: "02 अक्टूबर 2026, शुक्रवार",
    tithi: "आश्विन कृष्ण षष्ठी",
    nakshatra: "रोहिणी नक्षत्र",
    yoga: "सर्वार्थ सिद्धि योग एवं अमृत सिद्धि योग",
    timeSlot: "प्रातः 06:20 AM से 09:45 AM (वृषभ स्थिर लग्न)",
    quality: "अति उत्तम (5★)",
    stars: 5,
    significance: "रोहिणी नक्षत्र एवं वृषभ स्थिर लग्न में गृह प्रवेश करने से परिवार में चिरस्थायी सुख-शांति, समृद्धि एवं वास्तु दोषों का पूर्ण शमन होता है।"
  },
  {
    id: "muh-2",
    title: "शिव वास युक्त महारुद्राभिषेक मुहूर्त (सोम प्रदोष)",
    category: "rudrabhishek",
    categoryName: "रुद्राभिषेक",
    emoji: "🔱",
    date: "2026-09-29",
    dateFormatted: "29 सितम्बर 2026, मंगलवार",
    tithi: "आश्विन कृष्ण तृतीया",
    nakshatra: "अश्विनी नक्षत्र",
    yoga: "हर्षण योग",
    timeSlot: "प्रातः 08:00 AM से 10:30 AM (शुभ वेला)",
    quality: "अति उत्तम (5★)",
    stars: 5,
    significance: "शिव वास 'कैलाश पर' होने के कारण रुद्राभिषेक करने से समस्त असाध्य रोगों, गृह क्लेश तथा ग्रह पीड़ा का तत्काल निवारण होता है।"
  },
  {
    id: "muh-3",
    title: "अमृत योग युक्त नवीन व्यापार एवं वाहन क्रय",
    category: "business-vehicle",
    categoryName: "व्यापार व वाहन",
    emoji: "🚗",
    date: "2026-10-08",
    dateFormatted: "08 अक्टूबर 2026, गुरुवार",
    tithi: "आश्विन कृष्ण त्रयोदशी",
    nakshatra: "पुष्य नक्षत्र (गुरु पुष्य योग)",
    yoga: "गुरु पुष्य अमृत योग",
    timeSlot: "प्रातः 06:30 AM से 10:15 AM (शुभ व लाभ चौघड़िया)",
    quality: "सर्वश्रेष्ठ (5★)",
    stars: 5,
    significance: "गुरु पुष्य योग में नवीन प्रतिष्ठान का उद्घाटन, स्वर्ण क्रय अथवा नया वाहन क्रय करने पर अक्षत लाभ एवं दीर्घायु सुरक्षा प्राप्त होती है।"
  },
  {
    id: "muh-4",
    title: "शिशु मुंडन एवं नामकरण संस्कार पावन मुहूर्त",
    category: "mundan-namkaran",
    categoryName: "मुंडन व नामकरण",
    emoji: "👶",
    date: "2026-10-05",
    dateFormatted: "05 अक्टूबर 2026, सोमवार",
    tithi: "आश्विन कृष्ण नवमी",
    nakshatra: "पुनर्वसु नक्षत्र",
    yoga: "सिद्धि योग",
    timeSlot: "प्रातः 08:30 AM से 11:45 AM (अभिजित युक्त)",
    quality: "उत्तम (4★)",
    stars: 4,
    significance: "पुनर्वसु नक्षत्र में मुंडन कराने से बालक की बुद्धि तीक्ष्ण, आरोग्य सुदृढ़ और नजर-दोष से रक्षा होती है।"
  },
  {
    id: "muh-5",
    title: "पाणिग्रहण संस्कार (विवाह) शुभ लग्न मुहूर्त",
    category: "vivah",
    categoryName: "विवाह संस्कार",
    emoji: "💑",
    date: "2026-11-24",
    dateFormatted: "24 नवम्बर 2026, मंगलवार",
    tithi: "मार्गशीर्ष शुक्ल पूर्णिमा",
    nakshatra: "रोहिणी नक्षत्र",
    yoga: "साध्य योग",
    timeSlot: "सायं 07:15 PM से रात्रि 11:30 PM (गोपाष्टमी लग्न)",
    quality: "सर्वश्रेष्ठ (5★)",
    stars: 5,
    significance: "अष्टकूट 36 गुण मिलान अनुसार शुद्ध लग्न व गोधूलि वेला में परिणय सूत्र में बंधने से वर-वधू का दांपत्य जीवन अखंड सौभाग्यशाली रहता है।"
  },
  {
    id: "muh-6",
    title: "भूमि पूजन एवं नींव खनन मुहूर्त",
    category: "bhoomi",
    categoryName: "भूमि पूजन",
    emoji: "🏗️",
    date: "2026-10-18",
    dateFormatted: "18 अक्टूबर 2026, रविवार",
    tithi: "कार्तिक शुक्ल नवमी",
    nakshatra: "उत्तराषाढ़ा नक्षत्र",
    yoga: "वृद्धि योग",
    timeSlot: "प्रातः 07:30 AM से 10:10 AM",
    quality: "अति उत्तम (5★)",
    stars: 5,
    significance: "वास्तु शास्त्र अनुसार भूमि पूजन करने से निर्माण कार्य निर्विघ्न संपन्न होता है एवं भवन में वास्तु पुरुष की निरंतर कृपा बनी रहती है।"
  }
];

const SAMAGRI_DATA = [
  {
    id: "rudrabhishek",
    name: "वैदिक रुद्राभिषेक एवं महारुद्र पूजन सामग्री",
    items: [
      { name: "गंगाजल", qty: "1 लीटर", req: true },
      { name: "गाय का कच्चा दूध", qty: "2 लीटर", req: true },
      { name: "दही", qty: "250 ग्राम", req: true },
      { name: "शुद्ध देशी घी", qty: "250 ग्राम", req: true },
      { name: "शहद", qty: "100 ग्राम", req: true },
      { name: "शर्करा (बूरा)", qty: "250 ग्राम", req: true },
      { name: "गन्ने का रस / फलों का रस", qty: "1 लीटर", req: false },
      { name: "बिल्वपत्र (अखंडित)", qty: "108 पत्ते", req: true },
      { name: "धतूरा एवं आक के पुष्प", qty: "5-5 नग", req: true },
      { name: "भांग", qty: "50 ग्राम", req: false },
      { name: "सफेद चंदन", qty: "1 डिब्बी", req: true },
      { name: "अबीर, गुलाल, सिन्दूर", qty: "1-1 पैकेट", req: true },
      { name: "जनेऊ (यज्ञोपवीत)", qty: "5 जोड़े", req: true },
      { name: "धूप बत्ती व दीपक", qty: "1 पैकेट + 2 पीतल दीप", req: true },
      { name: "कपूर", qty: "50 ग्राम", req: true },
      { name: "सुपारी, लौंग, इलायची", qty: "11-11 नग", req: true },
      { name: "ऋतुफल (केला, सेब, अनार)", qty: "5 प्रकार के", req: true },
      { name: "मिठाई (पेड़ा / बर्फी)", qty: "500 ग्राम", req: true }
    ]
  },
  {
    id: "satyanarayan",
    name: "श्री सत्यनारायण महापूजा एवं कथा सामग्री",
    items: [
      { name: "सत्यनारायण भगवान की तस्वीर", qty: "1", req: true },
      { name: "केले के खंभे / पत्ते", qty: "4 नग", req: true },
      { name: "गेहूं / चावल (वेदी हेतु)", qty: "1.25 किग्रा", req: true },
      { name: "कलश (तांबे या पीतल का)", qty: "1 नग", req: true },
      { name: "नारियल (पानी वाला, जटा युक्त)", qty: "2 नग", req: true },
      { name: "पंचामृत (दूध, दही, घी, शहद, शर्करा)", qty: "यथाशक्ति", req: true },
      { name: "पंजीरी प्रसाद (आटा भूनकर शर्करा युक्त)", qty: "1 किग्रा", req: true },
      { name: "तुलसी दल (अत्यंत अनिवार्य)", qty: "21 पत्ते", req: true },
      { name: "मौली (कलावा) व रक्षासूत्र", qty: "2 गड्डी", req: true },
      { name: "रोली, अक्षत, हल्दी", qty: "1-1 पैकेट", req: true },
      { name: "सुपारी, पान के पत्ते", qty: "11-11 नग", req: true },
      { name: "हवन सामग्री व समिधा (आम की लकड़ी)", qty: "500 ग्राम + 1 किग्रा", req: true }
    ]
  },
  {
    id: "griha_pravesh",
    name: "नूतन गृह प्रवेश एवं वास्तु शांति सामग्री",
    items: [
      { name: "नूतन तांबे का कलश", qty: "1 नग", req: true },
      { name: "नारियल व आम के पल्लव", qty: "5-7 पत्ते + 1 नारियल", req: true },
      { name: "हल्दी की गांठें", qty: "5 नग", req: true },
      { name: "चावल (अक्षत)", qty: "2 किग्रा", req: true },
      { name: "सप्तधान्य (7 प्रकार के अनाज)", qty: "250 ग्राम", req: true },
      { name: "नवरत्न / पंचधातु टुकड़ा", qty: "1 सेट", req: false },
      { name: "गाय का दूध व दुग्ध उफान पात्र", qty: "1 लीटर + 1 नया बर्तन", req: true },
      { name: "वास्तु यंत्र / मूर्ति", qty: "1", req: true },
      { name: "हवन कुंड, समिधा व हवन सामग्री", qty: "1 सेट + 2 किग्रा", req: true }
    ]
  }
,
  {
    id: "navagraha",
    name: "नवग्रह शांति, महाहवन एवं ग्रह पीड़ा निवारण सामग्री",
    items: [
      { name: "नवग्रह समिधा (आक, ढाक, खैर, अपामार्ग, पीपल, गूलर, शमी, दूर्वा, कुशा)", qty: "1 सेट (9 समिधा)", req: true },
      { name: "नवग्रह वस्त्र (9 रंगों के सूती वस्त्र)", qty: "1 सेट", req: true },
      { name: "नवग्रह धान्य (गेहूं, चावल, अरहर, मूंग, चना, सफेद तिल, उड़द, मसूर)", qty: "250-250 ग्राम", req: true },
      { name: "हवन सामग्री व गौ घृत", qty: "1 किग्रा + 500 ग्राम", req: true },
      { name: "काले तिल एवं जौ", qty: "500-500 ग्राम", req: true },
      { name: "गुग्गुल, लोबान, कपूर", qty: "50-50 ग्राम", req: true },
      { name: "रोली, अक्षत, मौली, सुपारी", qty: "1-1 पैकेट", req: true }
    ]
  },
  {
    id: "vivah",
    name: "विवाह संस्कार पाणिग्रहण एवं सप्तपदी सामग्री",
    items: [
      { name: "वर-वधू जयमाला (ताजे पुष्पों की)", qty: "2 नग", req: true },
      { name: "सप्तपदी वस्त्र व गठजोड़", qty: "1 सेट", req: true },
      { name: "धान का लावा (खील)", qty: "1 किग्रा", req: true },
      { name: "शुद्ध सिन्दूर (पीला व लाल)", qty: "2 डिब्बी", req: true },
      { name: "हल्दी पाउडर व साबुत गांठ", qty: "250 ग्राम + 11 नग", req: true },
      { name: "तांबे का कलश व नारियल", qty: "2 कलश + 2 नारियल", req: true },
      { name: "पंचामृत व गंगाजल", qty: "यथाशक्ति", req: true },
      { name: "हवन कुंड, समिधा व घी", qty: "1 सेट + 1 किग्रा", req: true }
    ]
  },
  {
    id: "mundan",
    name: "मुंडन (चूड़ाकरण) एवं शिशु नामकरण संस्कार सामग्री",
    items: [
      { name: "शिशु हेतु नूतन पीताम्बर वस्त्र", qty: "1 जोड़ा", req: true },
      { name: "दही एवं गंगाजल (केश गीला करने हेतु)", qty: "250 ग्राम + 1 शीशी", req: true },
      { name: "चांदी का सिक्का / पात्र", qty: "1 नग", req: false },
      { name: "हल्दी, रोली, अक्षत, कलावा", qty: "1-1 पैकेट", req: true },
      { name: "कांस्य थाली व गुड़", qty: "1 थाली + 500 ग्राम", req: true },
      { name: "हवन सामग्री व समिधा", qty: "500 ग्राम", req: true }
    ]
  },
  {
    id: "bhagwat",
    name: "श्रीमद्भागवत सप्ताह ज्ञान यज्ञ एवं व्यासपीठ पूजन सामग्री",
    items: [
      { name: "श्रीमद्भागवत महापुराण ग्रन्थ", qty: "1 प्रति", req: true },
      { name: "व्यासपीठ पीताम्बर वस्त्र", qty: "2.5 मीटर", req: true },
      { name: "तुलसी काष्ठ माला व 108 तुलसी दल", qty: "1 माला + 108 पत्ते", req: true },
      { name: "शंख व घंटी", qty: "1-1 नग", req: true },
      { name: "अखण्ड ज्योति हेतु गौ घृत", qty: "5 किग्रा", req: true },
      { name: "पंचामृत सामग्री", qty: "नित्य 7 दिन हेतु", req: true },
      { name: "दैनिक आरती कर्पूर व धूप", qty: "7 दिन हेतु", req: true }
    ]
  }
];

// ----------------------------------------------------------------------------
// 7. KUNDALI & 36 GUNA MILAN ENGINE
// ----------------------------------------------------------------------------
const VedicKundli = {
  calculateGunaMilan(boyDetails, girlDetails) {
    const boyNak = parseInt(boyDetails.nakshatra || 0);
    const girlNak = parseInt(girlDetails.nakshatra || 0);

    const varnaScore = (boyNak % 4 >= girlNak % 4) ? 1 : 0;
    const vashyaScore = ((boyNak + girlNak) % 2 === 0) ? 2 : 1;
    const taraScore = ((boyNak - girlNak + 27) % 9 % 2 === 0) ? 3 : 1.5;
    const yoniScore = (Math.abs(boyNak - girlNak) <= 4) ? 4 : 2;
    const maitriScore = ((boyNak + girlNak) % 3 === 0) ? 5 : 3;
    const ganaScore = ((boyNak % 3) === (girlNak % 3)) ? 6 : ((boyNak % 3 === 0 && girlNak % 3 === 1) ? 5 : 1);
    const bhakootScore = ((boyNak + girlNak) % 7 !== 0) ? 7 : 0;
    const nadiScore = ((boyNak % 3) !== (girlNak % 3)) ? 8 : 0;

    const total = varnaScore + vashyaScore + taraScore + yoniScore + maitriScore + ganaScore + bhakootScore + nadiScore;

    let verdict = 'मध्यम मिलान (साधारण)';
    let verdictClass = 'bg-amber-100 text-amber-900 border-amber-400';
    if (total >= 28) {
      verdict = 'सर्वोत्तम एवं अत्यंत शुभ मिलान (36 में से ' + total + ' गुण)';
      verdictClass = 'bg-emerald-100 text-emerald-950 border-emerald-400';
    } else if (total >= 18) {
      verdict = 'शुभ एवं उत्तम मिलान (विवाह योग्य)';
      verdictClass = 'bg-teal-100 text-teal-950 border-teal-400';
    } else {
      verdict = 'दोषपूर्ण मिलान (18 से कम गुण - परिहार अनिवार्य)';
      verdictClass = 'bg-rose-100 text-rose-950 border-rose-400';
    }

    return {
      total,
      breakdown: {
        varna: { max: 1, score: varnaScore, name: 'वर्ण (कार्य प्रकृति)' },
        vashya: { max: 2, score: vashyaScore, name: 'वश्य (परस्पर आकर्षण)' },
        tara: { max: 3, score: taraScore, name: 'तारा (भाग्य व आरोग्य)' },
        yoni: { max: 4, score: yoniScore, name: 'योनि (शारीरिक सामंजस्य)' },
        maitri: { max: 5, score: maitriScore, name: 'ग्रह मैत्री (मानसिक मेल)' },
        gana: { max: 6, score: ganaScore, name: 'गण (स्वभाव व विचार)' },
        bhakoot: { max: 7, score: bhakootScore, name: 'भकूट (संतान व आर्थिक समृद्धि)' },
        nadi: { max: 8, score: nadiScore, name: 'नाड़ी (स्वास्थ्य व वंश वृद्धि)' }
      },
      nadiDosha: nadiScore === 0,
      bhakootDosha: bhakootScore === 0,
      verdict,
      verdictClass
    };
  },

  renderDiamondChartSVG(lagnaSign = 1, planets = {}) {
    const signs = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
    const pStr = (house) => (planets[house] || []).join(' ');

    return `
      <svg viewBox="0 0 400 400" class="w-full max-w-[340px] sm:max-w-[380px] mx-auto drop-shadow-md select-none">
        <!-- Outer Frame -->
        <rect x="10" y="10" width="380" height="380" fill="#fffbeb" stroke="#b45309" stroke-width="3"/>
        <!-- Diamond Inner Lines -->
        <line x1="10" y1="200" x2="200" y2="10" class="kundli-line"/>
        <line x1="200" y1="10" x2="390" y2="200" class="kundli-line"/>
        <line x1="390" y1="200" x2="200" y2="390" class="kundli-line"/>
        <line x1="200" y1="390" x2="10" y2="200" class="kundli-line"/>
        <!-- Diagonal Crosses -->
        <line x1="10" y1="10" x2="390" y2="390" class="kundli-line"/>
        <line x1="10" y1="390" x2="390" y2="10" class="kundli-line"/>

        <!-- House Numbers / Signs (1 to 12) -->
        <text x="200" y="115" text-anchor="middle" class="kundli-sign">${(lagnaSign - 1) % 12 + 1}</text>
        <text x="200" y="145" text-anchor="middle" class="kundli-planet" fill="#b91c1c">${pStr(1) || 'लग्न सू'}</text>

        <text x="110" y="55" text-anchor="middle" class="kundli-sign">${(lagnaSign) % 12 + 1}</text>
        <text x="110" y="75" text-anchor="middle" class="kundli-planet" fill="#78350f">${pStr(2) || 'गु'}</text>

        <text x="55" y="110" text-anchor="middle" class="kundli-sign">${(lagnaSign + 1) % 12 + 1}</text>
        <text x="55" y="130" text-anchor="middle" class="kundli-planet" fill="#78350f">${pStr(3) || 'चं'}</text>

        <text x="115" y="200" text-anchor="middle" class="kundli-sign">${(lagnaSign + 2) % 12 + 1}</text>
        <text x="115" y="225" text-anchor="middle" class="kundli-planet" fill="#78350f">${pStr(4) || 'शु'}</text>

        <text x="55" y="290" text-anchor="middle" class="kundli-sign">${(lagnaSign + 3) % 12 + 1}</text>
        <text x="55" y="310" text-anchor="middle" class="kundli-planet" fill="#78350f">${pStr(5) || 'के'}</text>

        <text x="110" y="345" text-anchor="middle" class="kundli-sign">${(lagnaSign + 4) % 12 + 1}</text>
        <text x="110" y="365" text-anchor="middle" class="kundli-planet" fill="#78350f">${pStr(6) || 'बु'}</text>

        <text x="200" y="290" text-anchor="middle" class="kundli-sign">${(lagnaSign + 5) % 12 + 1}</text>
        <text x="200" y="315" text-anchor="middle" class="kundli-planet" fill="#b91c1c">${pStr(7) || 'मं'}</text>

        <text x="290" y="345" text-anchor="middle" class="kundli-sign">${(lagnaSign + 6) % 12 + 1}</text>
        <text x="290" y="365" text-anchor="middle" class="kundli-planet" fill="#78350f">${pStr(8) || 'रा'}</text>

        <text x="345" y="290" text-anchor="middle" class="kundli-sign">${(lagnaSign + 7) % 12 + 1}</text>
        <text x="345" y="310" text-anchor="middle" class="kundli-planet" fill="#78350f">${pStr(9) || ''}</text>

        <text x="285" y="200" text-anchor="middle" class="kundli-sign">${(lagnaSign + 8) % 12 + 1}</text>
        <text x="285" y="225" text-anchor="middle" class="kundli-planet" fill="#78350f">${pStr(10) || 'श'}</text>

        <text x="345" y="110" text-anchor="middle" class="kundli-sign">${(lagnaSign + 9) % 12 + 1}</text>
        <text x="345" y="130" text-anchor="middle" class="kundli-planet" fill="#78350f">${pStr(11) || ''}</text>

        <text x="290" y="55" text-anchor="middle" class="kundli-sign">${(lagnaSign + 10) % 12 + 1}</text>
        <text x="290" y="75" text-anchor="middle" class="kundli-planet" fill="#78350f">${pStr(12) || ''}</text>
      </svg>
    `;
  }
};



// ----------------------------------------------------------------------------
// 8. GLOBAL MODAL CONTROLLERS & INTERACTIVE WIDGETS
// ----------------------------------------------------------------------------

// --- MODAL 1: श्रीरामशलाका प्रश्नावली ---
function openRamashalakaModal() {
  VedicAudio.playTempleBell();
  const m = document.getElementById('modal-ramashalaka');
  if (m) {
    m.style.display = 'flex';
    renderRamashalakaGrid();
  }
}

function closeRamashalakaModal() {
  const m = document.getElementById('modal-ramashalaka');
  if (m) m.style.display = 'none';
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function renderRamashalakaGrid() {
  const grid = document.getElementById('ramashalaka-grid');
  const resultDiv = document.getElementById('ramashalaka-result');
  if (!grid) return;
  if (resultDiv) resultDiv.style.display = 'none';

  grid.innerHTML = RAMA_LETTERS.map((letter, idx) => `
    <button type="button" onclick="handleRamaCell(${idx})" class="w-full aspect-square bg-amber-50 hover:bg-orange-200 text-red-950 font-black text-xs sm:text-sm rounded-lg border border-amber-300 transition active:scale-90 flex items-center justify-center cursor-pointer shadow-xs">
      ${letter}
    </button>
  `).join('');
}

function handleRamaCell(idx) {
  VedicAudio.playTempleBell();
  const chaupaiIdx = idx % 9;
  const c = RAMA_CHAUPAIS[chaupaiIdx];
  const res = document.getElementById('ramashalaka-result');
  if (!res || !c) return;

  const bgGrad = c.color || 'from-emerald-500 to-amber-600';
  res.className = `mt-4 p-4 rounded-2xl bg-gradient-to-r ${bgGrad} text-white shadow-xl space-y-2 animate-fadeIn`;
  res.innerHTML = `
    <div class="flex items-center justify-between border-b border-white/30 pb-2 flex-wrap gap-2">
      <span class="bg-black/30 text-amber-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
        ${c.kand}
      </span>
      <span class="bg-white/20 text-white font-extrabold text-xs px-2.5 py-1 rounded-full border border-white/40">
        ✨ ${c.verdict}
      </span>
    </div>
    <div class="my-2 p-3 bg-black/20 rounded-xl border border-white/20">
      <p class="font-heading font-black text-sm sm:text-base leading-relaxed text-amber-100 text-center">
        "${c.chaupai}"
      </p>
    </div>
    <p class="text-xs sm:text-sm leading-relaxed text-white/95 font-medium">
      <strong>दैवीय मार्गदर्शन:</strong> ${c.meaning}
    </p>
    <div class="flex items-center justify-end gap-2 pt-2 border-t border-white/20">
      <button onclick="readChaupaiAudio(${chaupaiIdx})" class="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 border border-white/40">
        <i class="fa-solid fa-volume-high"></i>
        <span>सस्वर वाचन</span>
      </button>
      <button onclick="shareRamaVerdict(${chaupaiIdx})" class="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 border border-emerald-400">
        <i class="fa-brands fa-whatsapp text-sm"></i>
        <span>WhatsApp शेयर</span>
      </button>
    </div>
  `;
  res.style.display = 'block';
  res.scrollIntoView({ behavior: 'smooth' });
}

function readChaupaiAudio(idx) {
  const c = RAMA_CHAUPAIS[idx];
  if (!c || !('speechSynthesis' in window)) {
    showToast('वाचन समर्थित नहीं है।', 'warning');
    return;
  }
  window.speechSynthesis.cancel();
  const text = `${c.chaupai}। फलकथन: ${c.verdict}। ${c.meaning}`;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'hi-IN';
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}

function shareRamaVerdict(idx) {
  const c = RAMA_CHAUPAIS[idx];
  if (!c) return;
  const msg = `🏹 *श्रीरामशलाका प्रश्नावली — पावन दैवीय मार्गदर्शन* 🏹\n━━━━━━━━━━━━━━━━━━━━━━\n📖 *चौपाई:*\n"${c.chaupai}"\n\n🚩 *संदर्भ:* ${c.kand}\n✨ *फलकथन:* ${c.verdict}\n\n💡 *भावार्थ एवं मार्गदर्शन:*\n${c.meaning}\n━━━━━━━━━━━━━━━━━━━━━━\n- आचार्य पं० अश्वनी कुमार शुक्ल (गोरखपुर)\nसम्पर्क: 7309441019`;
  window.open(`https://wa.me/917309441019?text=${encodeURIComponent(msg)}`, '_blank');
}

// --- MODAL 2: 1-क्लिक "सुप्रभात" WhatsApp फोटो कार्ड ---
function openSuprabhatModal() {
  VedicAudio.playTempleBell();
  const m = document.getElementById('modal-suprabhat');
  if (m) {
    m.style.display = 'flex';
    drawSuprabhatCard();
  }
}

function closeSuprabhatModal() {
  const m = document.getElementById('modal-suprabhat');
  if (m) m.style.display = 'none';
}

function drawSuprabhatCard() {
  const canvas = document.getElementById('suprabhat-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = 1080;
  const h = 1080;
  canvas.width = w;
  canvas.height = h;

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#5c0d1c');
  grad.addColorStop(0.35, '#8c1d34');
  grad.addColorStop(0.7, '#b45309');
  grad.addColorStop(1, '#3e040f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Outer Golden Borders
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 14;
  ctx.strokeRect(30, 30, w - 60, h - 60);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, w - 96, h - 96);

  // Corner Dots
  [[48, 48], [w - 48, 48], [48, h - 48], [w - 48, h - 48]].forEach(([cx, cy]) => {
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
  });

  const panchang = APP_STATE.panchang || VedicPanchang.calculate();
  const dayIdx = new Date().getDay();
  const shloka = DAILY_SHLOKAS[dayIdx];

  // Heading & Top Symbols
  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 36px "Rozha One", serif';
  ctx.textAlign = 'center';
  ctx.fillText('॥ ॐ श्री गणेशाय नमः ॥  •  ॥ जय श्री राम ॥', w / 2, 115);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 52px "Noto Sans Devanagari", sans-serif';
  ctx.fillText(shloka.greeting, w / 2, 185);

  // Panchang Banner Panel
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(80, 220, w - 160, 105, 20);
  else ctx.rect(80, 220, w - 160, 105);
  ctx.fill();
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 30px "Noto Sans Devanagari", sans-serif';
  ctx.fillText(`📅 ${panchang.date}`, w / 2, 265);

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 24px "Noto Sans Devanagari", sans-serif';
  ctx.fillText(`${panchang.tithi} • ${panchang.nakshatra} • ${panchang.samvat}`, w / 2, 305);

  // Central Sacred Shloka Panel
  ctx.fillStyle = 'rgba(254, 243, 199, 0.95)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(80, 355, w - 160, 400, 24);
  else ctx.rect(80, 355, w - 160, 400);
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#8c1d34';
  ctx.font = 'bold 28px "Noto Sans Devanagari", sans-serif';
  ctx.fillText(`🪔 आज के पावन आराध्य: ${shloka.deity} 🪔`, w / 2, 410);

  ctx.fillStyle = '#5c0d1c';
  ctx.font = 'bold 32px "Rozha One", serif';

  // Wrap mantra text
  const words = shloka.mantra.split(' ');
  let line = '';
  let y = 475;
  words.forEach(word => {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > w - 240 && line !== '') {
      ctx.fillText(line, w / 2, y);
      line = word + ' ';
      y += 46;
    } else {
      line = testLine;
    }
  });
  ctx.fillText(line, w / 2, y);

  // Separator
  y += 20;
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(130, y);
  ctx.lineTo(w - 130, y);
  ctx.stroke();

  // Meaning
  y += 40;
  ctx.fillStyle = '#3e040f';
  ctx.font = '600 24px "Noto Sans Devanagari", sans-serif';
  const meanWords = shloka.meaning.split(' ');
  line = '';
  meanWords.forEach(word => {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > w - 240 && line !== '') {
      ctx.fillText(line, w / 2, y);
      line = word + ' ';
      y += 34;
    } else {
      line = testLine;
    }
  });
  ctx.fillText(line, w / 2, y);

  // Muhurat Panel
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(80, 780, w - 160, 80, 18);
  else ctx.rect(80, 780, w - 160, 80);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 26px "Noto Sans Devanagari", sans-serif';
  ctx.fillText(`🌟 अभिजित मुहूर्त: ${panchang.shubhMuhurat.abhijit}   •   🪔 शुभ चौघड़िया: अमृत वेला`, w / 2, 830);

  // Footer Acharya details
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Noto Sans Devanagari", sans-serif';
  ctx.fillText('आचार्य पं० अश्वनी कुमार शुक्ल — वैदिक एवं सनातन सेवा केंद्र (गोरखपुर)', w / 2, 920);

  ctx.fillStyle = '#fed7aa';
  ctx.font = '600 24px "Noto Sans Devanagari", sans-serif';
  ctx.fillText('📞 संपर्क: 7309441019   •   शास्त्रोक्त कर्मकाण्ड, रुद्राभिषेक व ज्योतिष', w / 2, 960);
}

function downloadSuprabhatCard() {
  const canvas = document.getElementById('suprabhat-canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `suprabhat-panchang-${new Date().toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('✓ सुप्रभात फोटो कार्ड डाउनलोड हो गया!', 'success');
}

function shareSuprabhatCard() {
  const p = APP_STATE.panchang || VedicPanchang.calculate();
  const dayIdx = new Date().getDay();
  const s = DAILY_SHLOKAS[dayIdx];
  const msg = `🪔 *${s.greeting}* 🪔\n📅 *आज का पंचांग:* ${p.date}\n🌟 *तिथि:* ${p.tithi} • *नक्षत्र:* ${p.nakshatra}\n✨ *अभिजित मुहूर्त:* ${p.shubhMuhurat.abhijit}\n\n📖 *आज का पावन श्लोक:*\n${s.mantra}\n\n💡 *${s.meaning}*\n\n🚩 *आचार्य पं० अश्वनी कुमार शुक्ल*\n(वैदिक एवं सनातन सेवा केंद्र, गोरखपुर)\n📞 7309441019`;
  window.open(`https://wa.me/917309441019?text=${encodeURIComponent(msg)}`, '_blank');
}

// --- MODAL 3: संपूर्ण हनुमान चालीसा व संकटमोचन ---
function openChalisaModal() {
  VedicAudio.playTempleBell();
  const m = document.getElementById('modal-chalisa');
  if (m) {
    m.style.display = 'flex';
    renderChalisa();
  }
}

function closeChalisaModal() {
  const m = document.getElementById('modal-chalisa');
  if (m) m.style.display = 'none';
}

function adjustChalisaFont(delta) {
  APP_STATE.chalisaFontSize = Math.max(12, Math.min(24, APP_STATE.chalisaFontSize + delta));
  const el = document.getElementById('chalisa-content-area');
  if (el) el.style.fontSize = `${APP_STATE.chalisaFontSize}px`;
}

function renderChalisa() {
  const el = document.getElementById('chalisa-content-area');
  if (!el) return;
  el.style.fontSize = `${APP_STATE.chalisaFontSize}px`;

  el.innerHTML = `
    <div class="p-3 bg-amber-100/80 rounded-2xl border border-amber-300 text-center font-heading font-black text-red-950">
      ॥ श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि।<br>बरनउँ रघुबर बिमल जसु जो दायकु फल चारि॥<br>
      बुद्धिहीन तनु जानिके सुमिरौं पवन-कुमार।<br>बल बुधि बिद्या देहु मोहिं हरहु कलेस बिकार॥
      <p class="text-[11px] font-sans font-medium text-amber-900 mt-1">
        भावार्थ: श्री गुरु महाराज के चरण कमलों की धूलि से अपने मन रूपी दर्पण को पवित्र करके, मैं श्री रघुवीर के निर्मल यश का वर्णन करता हूँ, जो चारों फल (धर्म, अर्थ, काम, मोक्ष) देने वाले हैं।
      </p>
    </div>

    <div class="space-y-3 font-devanagari">
      <div class="p-3 bg-white rounded-xl border border-amber-200">
        <p class="font-bold text-red-950">जय हनुमान ज्ञान गुन सागर। जय कपीस तिहुँ लोक उजागर॥<br>रामदूत अतुलित बल धामा। अंजनि-पुत्र पवनसुत नामा॥</p>
        <p class="text-xs text-gray-700 mt-1">भावार्थ: हे ज्ञान और गुणों के सागर श्री हनुमान जी! आपकी जय हो। तीनों लोकों में आपका यश प्रकाशित है। आप अतुलित बल के धाम और अंजनी माता के पुत्र हैं।</p>
      </div>
      <div class="p-3 bg-white rounded-xl border border-amber-200">
        <p class="font-bold text-red-950">महाबीर बिक्रम बजरंगी। कुमति निवार सुमति के संगी॥<br>कंचन बरन बिराज सुबेसा। कानन कुंडल कुंचित केसा॥</p>
        <p class="text-xs text-gray-700 mt-1">भावार्थ: आप महावीर हैं, आपका शरीर वज्र के समान सुदृढ़ है। आप कुबुद्धि को दूर करने वाले और सद्बुद्धि देने वाले हैं।</p>
      </div>
      <div class="p-3 bg-white rounded-xl border border-amber-200">
        <p class="font-bold text-red-950">हाथ बज्र औ ध्वजा बिराजै। काँधे मूँज जनेऊ साजै॥<br>संकर सुवन केसरीनंदन। तेज प्रताप महा जग बंदन॥</p>
        <p class="text-xs text-gray-700 mt-1">भावार्थ: आपके हाथ में वज्र और ध्वजा शोभायमान है। कंधे पर मूंज का जनेऊ सुशोभित है। आपका तेज तीनों लोकों में वंदनीय है।</p>
      </div>
      <div class="p-3 bg-white rounded-xl border border-amber-200">
        <p class="font-bold text-red-950">बिद्यावान गुनी अति चातुर। राम काज करिबे को आतुर॥<br>प्रभु चरित्र सुनिबे को रसिया। राम लखन सीता मन बसिया॥</p>
        <p class="text-xs text-gray-700 mt-1">भावार्थ: आप समस्त विद्याओं के ज्ञाता और प्रभु श्री राम का कार्य करने के लिए सदैव आतुर रहते हैं।</p>
      </div>
      <div class="p-3 bg-white rounded-xl border border-amber-200">
        <p class="font-bold text-red-950">नासे रोग हरै सब पीरा। जपत निरंतर हनुमत बीरा॥<br>संकट तें हनुमान छुड़ावै। मन क्रम बचन ध्यान जो लावै॥</p>
        <p class="text-xs text-gray-700 mt-1">भावार्थ: वीर हनुमान जी का निरंतर स्मरण करने से समस्त रोग और पीड़ा का नाश हो जाता है।</p>
      </div>
      <div class="p-3 bg-amber-100/80 rounded-2xl border border-amber-300 text-center font-heading font-black text-red-950">
        ॥ दोहा ॥<br>
        पवनतनय संकट हरन मंगल मूरति रूप।<br>राम लखन सीता सहित हृदय बसहु सुर भूप॥
      </div>
    </div>
  `;
}

// --- MODAL 4: नामकरण कैलकुलेटर ---
function openNamkaranModal() {
  VedicAudio.playTempleBell();
  const m = document.getElementById('modal-namkaran');
  if (m) m.style.display = 'flex';
}

function closeNamkaranModal() {
  const m = document.getElementById('modal-namkaran');
  if (m) m.style.display = 'none';
}

function calculateNamkaran() {
  const dateVal = document.getElementById('namkaran-date').value || new Date().toISOString().slice(0, 10);
  const d = new Date(dateVal);
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const nakIdx = (dayOfYear + 2) % 27;

  const nakList = [
    { name: 'अश्विनी', letters: 'चू, चे, चो, ला', rashi: 'मेष', lord: 'केतु', names: ['चेतन', 'चेतस', 'लावण्य', 'ललितेश', 'चार्वी', 'चारुलता'] },
    { name: 'भरणी', letters: 'ली, लू, ले, लो', rashi: 'मेष', lord: 'शुक्र', names: ['लोकेश', 'लोहित', 'लीना', 'लोपा', 'ललित', 'लीलाधर'] },
    { name: 'कृत्तिका', letters: 'अ, ई, उ, ए', rashi: 'मेष / वृषभ', lord: 'सूर्य', names: ['अभिनव', 'उत्कर्ष', 'अनन्या', 'उमेश', 'आरव', 'इशिता'] },
    { name: 'रोहिणी', letters: 'ओ, वा, वी, वू', rashi: 'वृषभ', lord: 'चन्द्रमा', names: ['वरुण', 'विवेक', 'वेदिका', 'विदुषी', 'वासुदेव', 'वृंदा'] },
    { name: 'मृगशिरा', letters: 'वे, वो, का, की', rashi: 'वृषभ / मिथुन', lord: 'मंगल', names: ['कार्तिक', 'केशव', 'कीर्ति', 'काव्या', 'वेदांत', 'वैभव'] },
    { name: 'पुनर्वसु', letters: 'के, को, हा, ही', rashi: 'मिथुन / कर्क', lord: 'बृहस्पति', names: ['केशव', 'कोविद', 'हर्ष', 'हिमांगी', 'हेमंत', 'हृदया'] },
    { name: 'पुष्य', letters: 'हू, हे, हो, डा', rashi: 'कर्क', lord: 'शनिदेव', names: ['हेमंत', 'हृदय', 'हेमांग', 'हंसिका', 'हेतल', 'हर्षित'] }
  ];

  const resData = nakList[nakIdx % nakList.length];
  const resDiv = document.getElementById('namkaran-result');
  if (!resDiv) return;

  resDiv.innerHTML = `
    <div class="flex items-center justify-between border-b border-amber-300 pb-1.5 font-bold text-red-950">
      <span>🌟 जन्म नक्षत्र: ${resData.name}</span>
      <span class="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px]">राशि: ${resData.rashi}</span>
    </div>
    <div class="p-2 bg-amber-50 rounded-xl border border-amber-200">
      <p class="font-bold text-amber-950">शास्त्रसम्मत शुभ नामाक्षर:</p>
      <p class="text-base font-black text-red-900 mt-0.5">${resData.letters}</p>
    </div>
    <div>
      <p class="font-bold text-gray-800 mb-1">सुझाए गए वैदिक नाम:</p>
      <div class="flex flex-wrap gap-1.5">
        ${resData.names.map(n => `<span class="px-2 py-1 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-gray-900">${n}</span>`).join('')}
      </div>
    </div>
  `;
  resDiv.style.display = 'block';
}

// --- MODAL 5: व्रत एवं पर्व कैलेंडर ---
function openVratCalendarModal() {
  VedicAudio.playTempleBell();
  const m = document.getElementById('modal-vrat');
  if (m) {
    m.style.display = 'flex';
    filterFestivals('all');
  }
}

function closeVratCalendarModal() {
  const m = document.getElementById('modal-vrat');
  if (m) m.style.display = 'none';
}

function filterFestivals(cat) {
  const container = document.getElementById('vrat-list-container');
  if (!container) return;

  const filtered = cat === 'all' ? FESTIVALS_DATA : FESTIVALS_DATA.filter(f => f.category === cat);
  container.innerHTML = filtered.map(f => `
    <div class="p-3 bg-white rounded-2xl border border-amber-300/80 shadow-xs space-y-1 text-xs">
      <div class="flex items-center justify-between border-b border-amber-100 pb-1 flex-wrap gap-1">
        <span class="font-heading font-black text-sm text-red-950 flex items-center gap-1.5">
          <span>${f.emoji || '🪔'}</span>
          <span>${f.title}</span>
        </span>
        <span class="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
          ${f.date} • ${f.vedicMonth}
        </span>
      </div>
      <p class="text-gray-700 leading-relaxed font-medium">${f.significance}</p>
      <div class="flex items-center justify-between pt-1 border-t border-amber-100 text-[11px] text-amber-950 font-bold flex-wrap gap-1">
        <span>${f.shubhTime || ''}</span>
        ${f.paranaSlot ? `<span class="text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">पारण: ${f.paranaSlot}</span>` : ''}
      </div>
    </div>
  `).join('');
}

// --- NOTIFICATIONS, FEEDBACK & ADMIN LOGIN MODALS ---
function openNotificationsModal() {
  const m = document.getElementById('modal-notifs');
  if (m) m.style.display = 'flex';
}
function closeNotificationsModal() {
  const m = document.getElementById('modal-notifs');
  if (m) m.style.display = 'none';
}

function openFeedbackModal() {
  const m = document.getElementById('modal-feedback');
  if (m) m.style.display = 'flex';
}
function closeFeedbackModal() {
  const m = document.getElementById('modal-feedback');
  if (m) m.style.display = 'none';
}

function handleFeedbackSubmit(e) {
  e.preventDefault();
  VedicAudio.playPeaceChime();
  showToast('✓ आपका सुझाव सफलतापूर्वक प्राप्त हुआ। धन्यवाद!', 'success');
  closeFeedbackModal();
}

function openInstallAppModal() {
  const m = document.getElementById('modal-install');
  if (m) m.style.display = 'flex';
}
function closeInstallAppModal() {
  const m = document.getElementById('modal-install');
  if (m) m.style.display = 'none';
}

function openPrivacyTermsModal() {
  const m = document.getElementById('modal-privacy');
  if (m) m.style.display = 'flex';
}
function closePrivacyTermsModal() {
  const m = document.getElementById('modal-privacy');
  if (m) m.style.display = 'none';
}
function acceptPrivacyTerms() {
  sessionStorage.setItem('shivesh_terms_accepted', 'true');
  APP_STATE.termsAccepted = true;
  closePrivacyTermsModal();
  showToast('✓ नियम व नीतियां स्वीकृत हुईं।', 'success');
}

function openAdminLoginModal() {
  const m = document.getElementById('modal-admin-login');
  if (m) m.style.display = 'flex';
}
function closeAdminLoginModal() {
  const m = document.getElementById('modal-admin-login');
  if (m) m.style.display = 'none';
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const u = document.getElementById('admin-user').value.trim();
  const p = document.getElementById('admin-pass').value.trim();

  const res = await API.login(u, p);
  if (res.ok && res.data.token) {
    localStorage.setItem('acharya_admin_token', res.data.token);
    APP_STATE.token = res.data.token;
    APP_STATE.isAdmin = true;
    closeAdminLoginModal();
    showToast('✓ व्यवस्थापक सत्र प्रारंभ हुआ!', 'success');
    window.location.hash = '#admin';
  } else {
    showToast(res.data.error || 'अमान्य क्रेडेंशियल्स।', 'error');
  }
}

// --- TEMPLE LIVE PLAYER MODAL ---
function openTempleLiveModal(templeId) {
  VedicAudio.playTempleBell();
  const temple = TEMPLES_DATA.find(t => t.id === templeId) || TEMPLES_DATA[0];
  const m = document.getElementById('modal-temple-player');
  if (!m) return;

  document.getElementById('temple-modal-title').textContent = temple.name;
  document.getElementById('temple-modal-location').textContent = temple.location + ' • ' + temple.trustName;
  document.getElementById('temple-modal-aarti').textContent = '🪔 आरती समय: ' + temple.aartiTime;
  document.getElementById('temple-modal-desc').textContent = temple.description;

  const trustLink = document.getElementById('temple-modal-trust');
  if (trustLink) trustLink.href = temple.officialTrustUrl || '#';

  const iframe = document.getElementById('temple-iframe');
  if (iframe) {
    let vid = 'XcAxRyJ0DBQ';
    if (temple.videoUrl && temple.videoUrl.includes('v=')) {
      vid = temple.videoUrl.split('v=')[1].split('&')[0];
    }
    iframe.src = `https://www.youtube.com/embed/${vid}?autoplay=1&mute=0`;
  }

  m.style.display = 'flex';
}

function closeTempleLiveModal() {
  const m = document.getElementById('modal-temple-player');
  const iframe = document.getElementById('temple-iframe');
  if (iframe) iframe.src = '';
  if (m) m.style.display = 'none';
}



// ----------------------------------------------------------------------------
// 9. DYNAMIC VIEW GENERATORS & SCREEN RENDERERS
// ----------------------------------------------------------------------------
const Views = {

  // --- VIEW: HOME (मुख्य पृष्ठ) ---
  home() {
    const p = APP_STATE.panchang || VedicPanchang.calculate();
    const dayIdx = new Date().getDay();
    const shloka = DAILY_SHLOKAS[dayIdx];

    return `
      <div class="space-y-4">
        
        <!-- 1. TODAY'S PANCHANG LIVE GLASS RIBBON -->
        <div class="glass-ribbon rounded-3xl p-3.5 sm:p-4 shadow-md space-y-2.5 border-2 border-amber-300/80">
          <div class="flex items-center justify-between border-b border-amber-200/90 pb-2 gap-2 flex-wrap">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">☀️</span>
              <div class="min-w-0">
                <span class="font-heading font-black text-amber-950 block text-xs sm:text-sm md:text-base leading-tight">
                  आज का दैनिक शुभ मुहूर्त एवं पंचांग
                </span>
                <span class="text-[11px] sm:text-xs text-amber-900 font-semibold block leading-tight mt-0.5">
                  ${p.date} • ${p.tithi}
                </span>
              </div>
            </div>
            <a href="#muhurat" class="glass-btn-3d glass-btn-3d-gold px-3 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1.5 shadow-xs shrink-0">
              <span>सम्पूर्ण मुहूर्त देखें</span>
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </a>
          </div>

          <!-- Quick Muhurat Highlights Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div class="glass-panel p-2.5 rounded-2xl border border-emerald-300/90 shadow-xs">
              <div class="flex items-center justify-between text-emerald-800 font-bold mb-1">
                <span>🌟 अभिजित मुहूर्त:</span>
                <span class="text-[8px] bg-emerald-200/90 text-emerald-950 px-1.5 py-0.2 rounded font-extrabold">सर्वोत्तम</span>
              </div>
              <p class="text-slate-900 font-extrabold text-xs sm:text-sm leading-tight break-words">
                ${p.shubhMuhurat.abhijit}
              </p>
            </div>

            <div class="glass-panel p-2.5 rounded-2xl border border-amber-300/90 shadow-xs">
              <div class="flex items-center justify-between text-amber-900 font-bold mb-1">
                <span>✨ अमृत काल:</span>
                <span class="text-[8px] bg-amber-200/90 text-amber-950 px-1.5 py-0.2 rounded font-extrabold">शुभ</span>
              </div>
              <p class="text-slate-900 font-extrabold text-xs sm:text-sm leading-tight break-words">
                ${p.shubhMuhurat.amritKaal}
              </p>
            </div>

            <div class="glass-panel p-2.5 rounded-2xl border border-rose-300/90 shadow-xs">
              <div class="flex items-center justify-between text-rose-800 font-bold mb-1">
                <span>⚠️ राहुकाल (वर्जित):</span>
                <span class="text-[8px] bg-rose-200/90 text-rose-950 px-1.5 py-0.2 rounded font-extrabold">त्याज्य</span>
              </div>
              <p class="text-slate-900 font-extrabold text-xs sm:text-sm leading-tight break-words">
                ${p.ashubhKaal.rahuKaal}
              </p>
            </div>

            <div class="glass-panel p-2.5 rounded-2xl border border-amber-300/90 shadow-xs">
              <div class="flex items-center justify-between text-amber-950 font-bold mb-1">
                <span>🪔 शुभ चौघड़िया:</span>
                <span class="text-[8px] bg-amber-200/90 text-amber-950 px-1.5 py-0.2 rounded font-extrabold">सक्रिय</span>
              </div>
              <p class="text-slate-900 font-extrabold text-xs sm:text-sm leading-tight break-words">
                ${p.choghadiyaActive.name} (${p.choghadiyaActive.period}) • ${p.choghadiyaActive.start} - ${p.choghadiyaActive.end}
              </p>
            </div>
          </div>

          <!-- Extended Astronomical Details -->
          <div class="mt-2 pt-2 border-t border-amber-200/80 text-[11px] sm:text-xs text-amber-950 grid grid-cols-2 sm:grid-cols-3 gap-1.5 glass-panel p-2.5 rounded-2xl border border-white/80">
            <div><strong>संवत:</strong> ${p.samvat}</div>
            <div><strong>मास व पक्ष:</strong> ${p.month}</div>
            <div><strong>नक्षत्र व योग:</strong> ${p.nakshatra} / ${p.yoga}</div>
            <div><strong>सूर्योदय व सूर्यास्त:</strong> ${p.sunrise} / ${p.sunset}</div>
            <div><strong>ब्रह्म मुहूर्त:</strong> ${p.shubhMuhurat.brahmaMuhurat}</div>
            <div><strong>विजय मुहूर्त:</strong> ${p.shubhMuhurat.vijayMuhurat}</div>
            <div class="col-span-2 sm:col-span-3 text-amber-900 bg-amber-200/70 p-2 rounded-xl font-medium leading-relaxed border border-amber-300/60">
              ⭐ <strong>आज का विशेष निर्देश:</strong> ${p.specialNote}
            </div>
          </div>
        </div>

        <!-- 2. QUICK 12-ACTION TOOLS STRIP -->
        <div class="glass-ribbon rounded-2xl p-2.5 shadow-sm overflow-x-auto">
          <div class="flex items-center gap-1.5 text-xs font-bold whitespace-nowrap">
            <button onclick="openRamashalakaModal()" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-800 to-amber-900 text-white shadow-xs flex items-center gap-1.5">
              <span>🏹</span><span>प्रश्नावली</span>
            </button>
            <button onclick="openVratCalendarModal()" class="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-amber-100 text-amber-950 border border-amber-200 flex items-center gap-1.5">
              <span>📅</span><span>व्रत कैलेंडर</span>
            </button>
            <button onclick="openNamkaranModal()" class="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-amber-100 text-amber-950 border border-amber-200 flex items-center gap-1.5">
              <span>👶</span><span>नामकरण</span>
            </button>
            <button onclick="openChalisaModal()" class="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-amber-100 text-amber-950 border border-amber-200 flex items-center gap-1.5">
              <span>🚩</span><span>चालीसा पाठ</span>
            </button>
            <button onclick="openSuprabhatModal()" class="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-amber-100 text-amber-950 border border-amber-200 flex items-center gap-1.5">
              <span>🖼️</span><span>सुप्रभात कार्ड</span>
            </button>
            <a href="#milan" class="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-amber-100 text-amber-950 border border-amber-200 flex items-center gap-1.5">
              <span>💑</span><span>३६ गुण मिलान</span>
            </a>
            <a href="#kundali" class="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-amber-100 text-amber-950 border border-amber-200 flex items-center gap-1.5">
              <span>🔮</span><span>कुण्डली चक्र</span>
            </a>
            <a href="#jaap" class="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-amber-100 text-amber-950 border border-amber-200 flex items-center gap-1.5">
              <span>📿</span><span>जाप माला</span>
            </a>
            <a href="#temple-live" class="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-amber-100 text-amber-950 border border-amber-200 flex items-center gap-1.5">
              <span>🛕</span><span>१३ मंदिर दर्शन</span>
            </a>
            <a href="#booking" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-red-950 font-black flex items-center gap-1.5">
              <span>✨</span><span>पूजा बुकिंग</span>
            </a>
          </div>
        </div>

        <!-- 3. TODAY'S SACRED SHLOKA & BHAVARTH RIBBON -->
        <div class="glass-ribbon-saffron rounded-3xl p-3.5 sm:p-4 space-y-2.5 shadow-md border-2 border-amber-400/80">
          <div class="flex items-center justify-between border-b border-orange-200/90 pb-1.5">
            <div class="flex items-center gap-2">
              <span class="text-xl">🪔</span>
              <span class="text-xs sm:text-sm font-heading font-black text-red-950">
                आज का पावन वैदिक सुविचार एवं श्लोक (${shloka.day})
              </span>
            </div>
            <span class="glass-btn glass-btn-saffron text-[9px] font-black px-2 py-0.5 rounded-lg shadow-xs pointer-events-none">
              दैनिक प्रेरणा
            </span>
          </div>

          <div class="glass-panel rounded-2xl p-3 sm:p-4 space-y-2 shadow-sm text-center">
            <p class="font-heading font-black text-sm sm:text-base md:text-lg text-red-900 leading-relaxed">
              ${shloka.mantra}
            </p>
            <p class="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed font-sans">
              ${shloka.meaning}
            </p>
          </div>

          <div class="flex items-center justify-between pt-1 border-t border-orange-200/90 text-xs flex-wrap gap-2">
            <span class="font-bold text-amber-950">
              आचार्य पं० अश्वनी कुमार शुक्ल (गोरखपुर)
            </span>
            <div class="flex items-center gap-2">
              <button onclick="copyShlokaText()" class="glass-btn glass-btn-white px-3 py-1 rounded-xl text-xs font-bold shadow-xs">
                📋 कॉपी करें
              </button>
              <button onclick="shareShlokaWhatsApp()" class="glass-btn-3d glass-btn-3d-emerald px-3 py-1 rounded-xl text-xs font-black shadow-xs text-white">
                📲 WhatsApp स्टेटस
              </button>
            </div>
          </div>
        </div>

        <!-- 4. DAILY 12 RASHIFAL (राशिफल) PREVIEW CAROUSEL -->
        <div class="glass-ribbon rounded-3xl p-3.5 sm:p-4 space-y-3 shadow-md border-2 border-amber-300/80">
          <div class="flex items-center justify-between border-b border-amber-200 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">♈</span>
              <div>
                <h3 class="font-heading font-black text-sm sm:text-base text-red-950 leading-tight">
                  दैनिक १२ राशि भविष्यफल एवं अचूक उपाय
                </h3>
                <p class="text-[10px] sm:text-xs text-amber-900 font-medium">आज का दिन कैसा रहेगा? शुभ रंग, शुभ अंक व मार्गदर्शन</p>
              </div>
            </div>
            <span class="text-[9px] bg-amber-100 text-amber-950 font-black px-2 py-0.5 rounded-full">१२ राशियां</span>
          </div>

          <!-- Rashi Selector Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
            ${RASHIFAL_DATA.map(r => `
              <button onclick="selectRashi('${r.id}')" class="rashi-pill px-3 py-1.5 rounded-xl whitespace-nowrap transition ${APP_STATE.activeRashiId === r.id ? 'bg-gradient-to-r from-red-900 to-amber-900 text-white shadow-xs' : 'bg-white/80 border border-amber-200 text-amber-950'}">
                <span>${r.symbol}</span> <span>${r.name}</span>
              </button>
            `).join('')}
          </div>

          <!-- Selected Rashi Card Content -->
          <div id="rashi-card-display" class="p-4 rounded-2xl bg-gradient-to-br from-white to-amber-50 border-2 border-amber-300 shadow-sm space-y-2.5">
            ${renderActiveRashiCard(APP_STATE.activeRashiId)}
          </div>
        </div>

        <!-- 5. NITYA KALYAN & SADHANA KENDRA (FEATURED 3D GLASS CARDS) -->
        <div class="glass-ribbon rounded-3xl p-3.5 sm:p-4 space-y-3 shadow-md border-2 border-amber-300/80">
          <div class="flex items-center justify-between border-b border-amber-200/90 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">🪔</span>
              <div>
                <h2 class="text-sm sm:text-base font-heading font-black text-red-950 leading-tight">
                  नित्य पावन जन-कल्याण एवं साधना केंद्र
                </h2>
                <p class="text-[10px] sm:text-xs text-amber-900 font-semibold leading-tight mt-0.5">
                  विवाह कुण्डली मिलान, जन्म कुण्डली, पंचांग, रामशलाका एवं पावन जन-कल्याण सेवाएँ
                </p>
              </div>
            </div>
            <span class="glass-btn glass-btn-gold text-[9px] font-black px-2 py-0.5 rounded-full pointer-events-none">
              जनप्रिय वैदिक सेवाएँ
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            <!-- Card 1: विवाह कुण्डली मिलान -->
            <div onclick="VedicAudio.playTempleBell(); window.location.hash='#milan';" class="cursor-pointer glass-panel hover:brightness-105 p-3.5 rounded-2xl border border-rose-300/90 shadow-xs flex flex-col justify-between gap-3 transition active:scale-[0.98]">
              <div class="flex items-start gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
                  💑
                </div>
                <div>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <h3 class="text-xs sm:text-sm font-heading font-black text-rose-950 leading-tight">विवाह कुण्डली मिलान</h3>
                    <span class="text-[7.5px] bg-rose-700 text-white font-extrabold px-1.5 py-0.2 rounded-full">३६ गुण मिलान</span>
                  </div>
                  <p class="text-[10px] sm:text-[11px] text-amber-950 font-medium leading-snug mt-1">
                    वर-वधू जन्म विवरण अनुसार अष्टकूट ३६ गुण, नाड़ी, भकूट, गण दोष विचार व अचूक वैदिक परिहार।
                  </p>
                </div>
              </div>
              <button type="button" class="glass-btn-3d glass-btn-3d-saffron w-full py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-xs">
                विवाह मिलान करें →
              </button>
            </div>

            <!-- Card 2: वैदिक जन्म कुण्डली व भविष्यफल -->
            <div onclick="VedicAudio.playTempleBell(); window.location.hash='#kundali';" class="cursor-pointer glass-panel hover:brightness-105 p-3.5 rounded-2xl border border-purple-300 shadow-xs flex flex-col justify-between gap-3 transition active:scale-[0.98]">
              <div class="flex items-start gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
                  🔮
                </div>
                <div>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <h3 class="text-xs sm:text-sm font-heading font-black text-purple-950 leading-tight">वैदिक जन्म कुण्डली</h3>
                    <span class="text-[7.5px] bg-purple-700 text-white font-extrabold px-1.5 py-0.2 rounded-full">लग्न चक्र</span>
                  </div>
                  <p class="text-[10px] sm:text-[11px] text-amber-950 font-medium leading-snug mt-1">
                    जन्म लग्न, नवमांश चक्र, विंशोत्तरी महादशा, कालसर्प, मांगलिक व साढ़ेसाती संपूर्ण विश्लेषण।
                  </p>
                </div>
              </div>
              <button type="button" class="glass-btn-3d glass-btn-3d-gold w-full py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-xs">
                कुण्डली देखें →
              </button>
            </div>

            <!-- Card 3: दैनिक पंचांग व चौघड़िया -->
            <div onclick="VedicAudio.playTempleBell(); window.location.hash='#muhurat';" class="cursor-pointer glass-panel hover:brightness-105 p-3.5 rounded-2xl border border-amber-300 shadow-xs flex flex-col justify-between gap-3 transition active:scale-[0.98]">
              <div class="flex items-start gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
                  ☀️
                </div>
                <div>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <h3 class="text-xs sm:text-sm font-heading font-black text-amber-950 leading-tight">दैनिक पंचांग व चौघड़िया</h3>
                    <span class="text-[7.5px] bg-amber-700 text-white font-extrabold px-1.5 py-0.2 rounded-full">शुभ मुहूर्त</span>
                  </div>
                  <p class="text-[10px] sm:text-[11px] text-amber-950 font-medium leading-snug mt-1">
                    अभिजित मुहूर्त, अमृत काल, ब्रह्म मुहूर्त, चौघड़िया वेला एवं त्याज्य राहुकाल लाइव देखें।
                  </p>
                </div>
              </div>
              <button type="button" class="glass-btn-3d glass-btn-3d-saffron w-full py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-xs">
                पंचांग खोलें →
              </button>
            </div>

            <!-- Card 4: श्रीरामशलाका प्रश्नावली -->
            <div onclick="openRamashalakaModal()" class="cursor-pointer glass-panel hover:brightness-105 p-3.5 rounded-2xl border border-emerald-300 shadow-xs flex flex-col justify-between gap-3 transition active:scale-[0.98]">
              <div class="flex items-start gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
                  🏹
                </div>
                <div>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <h3 class="text-xs sm:text-sm font-heading font-black text-emerald-950 leading-tight">श्रीरामशलाका प्रश्नावली</h3>
                    <span class="text-[7.5px] bg-emerald-700 text-white font-extrabold px-1.5 py-0.2 rounded-full">दैवीय मार्गदर्शन</span>
                  </div>
                  <p class="text-[10px] sm:text-[11px] text-amber-950 font-medium leading-snug mt-1">
                    श्रीरामचरितमानस पर आधारित पावन शलाका चक्र। मन में प्रभु का स्मरण कर उत्तर प्राप्त करें।
                  </p>
                </div>
              </div>
              <button type="button" class="glass-btn-3d glass-btn-3d-emerald w-full py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-xs text-white">
                शलाका चक्र स्पर्श करें →
              </button>
            </div>

          </div>
        </div>

        <!-- 6. 13 MAJOR TEMPLES LIVE DARSHAN CAROUSEL / GRID -->
        <div class="glass-ribbon rounded-3xl p-3.5 sm:p-4 space-y-3 shadow-md border-2 border-amber-300/80">
          <div class="flex items-center justify-between border-b border-amber-200/90 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">🛕</span>
              <div>
                <h3 class="font-heading font-black text-sm sm:text-base text-red-950 leading-tight">
                  १३ प्रमुख पावन मंदिर व ज्योतिर्लिंग सजीव दर्शन
                </h3>
                <p class="text-[10px] sm:text-xs text-amber-900 font-medium">काशी विश्वनाथ, महाकालेश्वर, रामलला सरकार, सोमनाथ, तिरुपति व अन्य पावन तीर्थ</p>
              </div>
            </div>
            <a href="#temple-live" class="glass-btn-3d glass-btn-3d-gold px-3 py-1 rounded-xl text-xs font-black">
              सभी १३ मंदिर →
            </a>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            ${TEMPLES_DATA.slice(0, 6).map(t => `
              <div onclick="openTempleLiveModal('${t.id}')" class="group cursor-pointer rounded-2xl overflow-hidden border-2 border-amber-300 bg-white shadow-sm hover:shadow-md transition">
                <div class="relative aspect-video bg-slate-900 overflow-hidden">
                  <img src="${t.thumbnail}" alt="${t.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" onerror="this.src='https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80'">
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                  <div class="absolute top-2 left-2 flex items-center gap-1 bg-red-600/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-white/30">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot"></span>
                    <span>LIVE</span>
                  </div>
                  <div class="absolute top-2 right-2 bg-black/60 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    👁️ ${t.viewers.toLocaleString('hi-IN')} दर्शनार्थी
                  </div>
                  <div class="absolute bottom-2 left-2 right-2 text-white">
                    <h4 class="font-heading font-black text-xs sm:text-sm drop-shadow-md">${t.name}</h4>
                    <p class="text-[10px] text-amber-200/90 drop-shadow-sm truncate">${t.location}</p>
                  </div>
                </div>
                <div class="p-2.5 flex items-center justify-between text-[11px] bg-amber-50/50">
                  <span class="text-amber-950 font-bold truncate">🪔 ${t.aartiTime.split('|')[0] || 'नित्य आरती'}</span>
                  <span class="text-orange-700 font-extrabold flex items-center gap-1 shrink-0">
                    दर्शन करें <i class="fa-solid fa-play text-[9px]"></i>
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 7. POPULAR VEDIC PUJAS CATALOG -->
        <div class="glass-ribbon rounded-3xl p-3.5 sm:p-4 space-y-3 shadow-md border-2 border-amber-300/80">
          <div class="flex items-center justify-between border-b border-amber-200/90 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">🪔</span>
              <div>
                <h3 class="font-heading font-black text-sm sm:text-base text-red-950 leading-tight">
                  प्रमुख वैदिक पूजा एवं अनुष्ठान सेवाएँ
                </h3>
                <p class="text-[10px] sm:text-xs text-amber-900 font-medium">शास्त्र सम्मत विधि, संकल्प व दक्षिणा विवरण</p>
              </div>
            </div>
            <a href="#booking" class="glass-btn-3d glass-btn-3d-saffron px-3 py-1 rounded-xl text-xs font-black text-white">
              पूजा बुक करें →
            </a>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            
            <div class="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2 flex flex-col justify-between">
              <div class="space-y-1">
                <div class="flex items-center justify-between font-bold text-red-950">
                  <span class="font-heading text-sm">🔱 श्री महारुद्राभिषेक अनुष्ठान</span>
                  <span class="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px]">शिव वास</span>
                </div>
                <p class="text-gray-700 leading-snug">नमक-चमक पावन रुद्री पाठ, पंचामृत धारा एवं शिव ताण्डव स्तोत्र सहित सजीव महारुद्राभिषेक। समस्त कष्टों व ग्रह पीड़ा का शमन।</p>
              </div>
              <div class="pt-2 border-t border-amber-100 flex items-center justify-between">
                <span class="font-bold text-amber-950">अवधि: २.५ घंटे</span>
                <a href="#booking" class="text-orange-700 hover:text-orange-800 font-extrabold">संकल्प लें →</a>
              </div>
            </div>

            <div class="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2 flex flex-col justify-between">
              <div class="space-y-1">
                <div class="flex items-center justify-between font-bold text-red-950">
                  <span class="font-heading text-sm">📿 महामृत्युंजय महामंत्र जप</span>
                  <span class="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px]">आरोग्य रक्षा</span>
                </div>
                <p class="text-gray-700 leading-snug">सवा लाख अथवा ११,००० महामृत्युंजय मंत्र जप, संपुटित पाठ एवं दशांश हवन। असाध्य व्याधि निवारण व दीर्घायु प्राप्ति।</p>
              </div>
              <div class="pt-2 border-t border-amber-100 flex items-center justify-between">
                <span class="font-bold text-amber-950">वैदिक ब्राह्मणों द्वारा</span>
                <a href="#booking" class="text-orange-700 hover:text-orange-800 font-extrabold">संकल्प लें →</a>
              </div>
            </div>

            <div class="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2 flex flex-col justify-between">
              <div class="space-y-1">
                <div class="flex items-center justify-between font-bold text-red-950">
                  <span class="font-heading text-sm">✨ श्री नवग्रह शांति महायज्ञ</span>
                  <span class="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px]">ग्रह दोष शमन</span>
                </div>
                <p class="text-gray-700 leading-snug">नवग्रह मंडल निर्माण, नौ ग्रहों के वैदिक बीज मंत्र जप, समिधा आहुति व स्तुति पाठ। कालसर्प, शनि साढ़ेसाती व मांगलिक शांति।</p>
              </div>
              <div class="pt-2 border-t border-amber-100 flex items-center justify-between">
                <span class="font-bold text-amber-950">अवधि: ३.५ घंटे</span>
                <a href="#booking" class="text-orange-700 hover:text-orange-800 font-extrabold">संकल्प लें →</a>
              </div>
            </div>

          </div>
        </div>

        <!-- 8. ACHARYA PROFILE & SANATAN TRADITION -->
        <div class="glass-ribbon rounded-3xl p-4 sm:p-6 shadow-md border-2 border-amber-300/80 space-y-3">
          <div class="flex items-start gap-4 flex-col sm:flex-row">
            <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-800 flex items-center justify-center text-white text-4xl font-black shadow-lg border-2 border-amber-300 shrink-0 mx-auto sm:mx-0">
              ॐ
            </div>
            <div class="space-y-1.5 text-center sm:text-left">
              <h2 class="font-heading font-black text-base sm:text-lg text-red-950">
                आचार्य पं० अश्वनी कुमार शुक्ल — वैदिक एवं सनातन सेवा केंद्र (गोरखपुर)
              </h2>
              <p class="text-xs sm:text-sm text-amber-950 font-semibold leading-relaxed">
                पूर्वांचल एवं गोरखपुर की पावन भूमि पर शास्त्रोक्त वैदिक कर्मकाण्ड, श्रीमद्भागवत सप्ताह ज्ञान यज्ञ, श्री राम कथा वाचन, एवं पराशरी वैदिक ज्योतिष परामर्श के प्रतिष्ठित आचार्य।
              </p>
              <div class="flex items-center gap-3 pt-1 justify-center sm:justify-start text-xs font-bold text-amber-900 flex-wrap">
                <span>📍 गोरखपुर, उत्तर प्रदेश</span>
                <span>•</span>
                <span>📞 <a href="tel:+917309441019" class="text-emerald-700 hover:underline">7309441019</a></span>
                <span>•</span>
                <span>📜 शुक्ल यजुर्वेद पारंगत</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 9. VEDIC FAQS ACCORDION -->
        <div class="glass-ribbon rounded-3xl p-3.5 sm:p-4 space-y-2.5 shadow-md border-2 border-amber-300/80">
          <h3 class="font-heading font-black text-sm sm:text-base text-red-950 border-b border-amber-200 pb-2">
            ❓ शास्त्र सम्मत सामान्य प्रश्नोत्तरी (FAQs)
          </h3>
          <div class="space-y-2 text-xs">
            <details class="p-3 bg-white rounded-xl border border-amber-200 cursor-pointer">
              <summary class="font-bold text-red-950">विवाह कुण्डली मिलान में कितने गुण मिलना शुभ माना जाता है?</summary>
              <p class="mt-2 text-gray-700 leading-relaxed font-medium">वैदिक ज्योतिष के अष्टकूट मिलान में कुल ३६ गुण होते हैं। १८ से २४ गुण मिलने पर मध्यम, २५ से ३२ गुण मिलने पर उत्तम तथा ३३ से ३६ गुण मिलने पर सर्वोत्तम माना जाता है। गुणों के साथ नाड़ी दोष, भकूट दोष एवं मांगलिक विचार भी अनिवार्य होता है।</p>
            </details>
            <details class="p-3 bg-white rounded-xl border border-amber-200 cursor-pointer">
              <summary class="font-bold text-red-950">श्रीरामशलाका प्रश्नावली का उपयोग कैसे करें?</summary>
              <p class="mt-2 text-gray-700 leading-relaxed font-medium">मन में भगवान श्री सीताराम जी का स्मरण कर अपने प्रश्न पर एकाग्र हों और शलाका चक्र के किसी भी अक्षर को स्पर्श करें। ९वें क्रम के अक्षरों के योग से प्रकट होने वाली चौपाई से आपके प्रश्न का स्पष्ट व अचूक दैवीय समाधान प्राप्त होता है।</p>
            </details>
            <details class="p-3 bg-white rounded-xl border border-amber-200 cursor-pointer">
              <summary class="font-bold text-red-950">गोरखपुर में रुद्राभिषेक एवं अनुष्ठान कैसे बुक करें?</summary>
              <p class="mt-2 text-gray-700 leading-relaxed font-medium">आचार्य पं० अश्वनी कुमार शुक्ल जी से सीधे फ़ोन (7309441019) अथवा इस पोर्टल के ऑनलाइन बुकिंग प्रपत्र द्वारा अपनी इच्छित तिथि एवं समय पर रुद्राभिषेक व संकल्प पूजा बुक की जा सकती है।</p>
            </details>
          </div>
        </div>

      </div>
    `;
  },

  // --- VIEW: VIVAH MILAN & ASTROLOGY (विवाह मिलान व ज्योतिष) ---
  milan() {
    return `
      <div class="space-y-4">
        
        <!-- Top Title Ribbon -->
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2.5">
            <span class="text-3xl">💑</span>
            <div>
              <h2 class="font-heading font-black text-base sm:text-lg text-red-950 leading-tight">
                विवाह कुण्डली मिलान (अष्टकूट ३६ गुण मिलान)
              </h2>
              <p class="text-xs text-amber-900 font-medium">वर-वधू नक्षत्र चरण अनुसार वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट व नाड़ी विश्लेषण</p>
            </div>
          </div>
          <!-- Direct Audio Call CTA -->
          <a href="tel:+917309441019" class="glass-btn-3d glass-btn-3d-emerald px-3.5 py-2 rounded-xl text-xs font-black text-white flex items-center gap-1.5 shadow-xs">
            <i class="fa-solid fa-phone-volume"></i>
            <span>आचार्य जी से ऑडियो परामर्श: 7309441019</span>
          </a>
        </div>

        <!-- Dedicated Audio Call Card -->
        <div class="glass-panel p-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50/60 shadow-md flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 class="font-heading font-black text-sm sm:text-base text-emerald-950">
              📞 दूरभाष व ऑडियो कॉल परामर्श (Direct Audio Call)
            </h3>
            <p class="text-xs text-emerald-900 font-semibold mt-0.5">
              आचार्य पं० अश्वनी कुमार शुक्ल जी से सीधे ऑडियो कॉल पर परामर्श लें — जन्म कुण्डली, विवाह मिलान एवं जीवन मार्गदर्शन
            </p>
          </div>
          <div class="flex items-center gap-2">
            <a href="tel:+917309441019" class="glass-btn-3d glass-btn-3d-emerald px-4 py-2 rounded-xl text-xs sm:text-sm font-black text-white shadow-xs">
              <i class="fa-solid fa-phone-volume"></i> <span>ऑडियो कॉल: 7309441019</span>
            </a>
            <a href="https://wa.me/917309441019?text=%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%A3%E0%A4%BE%E0%A4%AE%20%E0%A4%86%E0%A4%9Release%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%AF%20%E0%A4%9C%E0%A5%80%2C%20%E0%A4%AE%E0%A5%81%E0%A4%9D%E0%A5%87%20%E0%A4%9C%E0%A5%8D%E0%A4%AF%E0%A5%8B%E0%A4%A4%E0%A4%BF%E0%A4%B7%2F%E0%A4%AA%E0%A5%82%E0%A4%9C%E0%A4%BE%20%E0%A4%AA%E0%A4%B0%E0%A4%BE%E0%A4%AE%E0%A4%B0%E0%A5%8D%E0%A4%B6%20%E0%A4%B9%E0%A5%87%E0%A4%A4%E0%A5%81%20%E0%A4%91%E0%A4%A1%E0%A4%BF%E0%A4%AF%E0%A5%8B%20%E0%A4%95%E0%A5%89%E0%A4%B2%20%E0%A4%95%E0%A4%B0%E0%A4%A8%E0%A4%BE%20%E0%A4%B9%E0%A5%88%E0%A5%A4" target="_blank" rel="noopener" class="glass-btn-3d glass-btn-3d-gold px-3.5 py-2 rounded-xl text-xs font-black">
              <i class="fa-brands fa-whatsapp text-emerald-800"></i> <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <!-- Boy & Girl Details Form -->
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80">
          <form onsubmit="handleMilanSubmit(event)" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- वर (Groom) Details -->
              <div class="p-3.5 bg-white/90 rounded-2xl border border-rose-300 shadow-xs space-y-2.5">
                <h3 class="font-heading font-black text-sm text-rose-950 flex items-center gap-1.5 border-b border-rose-100 pb-1.5">
                  <span>👦</span><span>वर (Boy / Groom) विवरण</span>
                </h3>
                <div class="space-y-2 text-xs">
                  <div>
                    <label class="block font-bold text-gray-800 mb-1">वर का नाम:</label>
                    <input type="text" id="boy-name" required class="w-full p-2 rounded-xl border border-gray-300" placeholder="उदा. राहुल शर्मा">
                  </div>
                  <div>
                    <label class="block font-bold text-gray-800 mb-1">जन्म नक्षत्र:</label>
                    <select id="boy-nakshatra" class="w-full p-2 rounded-xl border border-gray-300 bg-white">
                      ${[
                        'अश्विनी (मेष)', 'भरणी (मेष)', 'कृत्तिका (मेष/वृषभ)', 'रोहिणी (वृषभ)', 'मृगशिरा (वृषभ/मिथुन)', 'आर्द्रा (मिथुन)', 'पुनर्वसु (मिथुन/कर्क)', 'पुष्य (कर्क)', 'आश्लेषा (कर्क)', 'मघा (सिंह)', 'पूर्वाफाल्गुनी (सिंह)', 'उत्तराफाल्गुनी (सिंह/कन्या)', 'हस्त (कन्या)', 'चित्रा (कन्या/तुला)', 'स्वाति (तुला)', 'विशाखा (तुला/वृश्चिक)', 'अनुराधा (वृश्चिक)', 'ज्येष्ठा (वृश्चिक)', 'मूल (धनु)', 'पूर्वाषाढ़ा (धनु)', 'उत्तराषाढ़ा (धनु/मकर)', 'श्रवण (मकर)', 'धनिष्ठा (मकर/कुंभ)', 'शतभिषा (कुंभ)', 'पूर्वाभाद्रपद (कुंभ/मीन)', 'उत्तराभाद्रपद (मीन)', 'रेवती (मीन)'
                      ].map((n, i) => `<option value="${i}">${n}</option>`).join('')}
                    </select>
                  </div>
                  <div>
                    <label class="block font-bold text-gray-800 mb-1">नक्षत्र चरण:</label>
                    <select id="boy-charan" class="w-full p-2 rounded-xl border border-gray-300 bg-white">
                      <option value="1">प्रथम चरण (१)</option>
                      <option value="2">द्वितीय चरण (२)</option>
                      <option value="3">तृतीय चरण (३)</option>
                      <option value="4">चतुर्थ चरण (४)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- वधू (Bride) Details -->
              <div class="p-3.5 bg-white/90 rounded-2xl border border-purple-300 shadow-xs space-y-2.5">
                <h3 class="font-heading font-black text-sm text-purple-950 flex items-center gap-1.5 border-b border-purple-100 pb-1.5">
                  <span>👧</span><span>वधू (Girl / Bride) विवरण</span>
                </h3>
                <div class="space-y-2 text-xs">
                  <div>
                    <label class="block font-bold text-gray-800 mb-1">वधू का नाम:</label>
                    <input type="text" id="girl-name" required class="w-full p-2 rounded-xl border border-gray-300" placeholder="उदा. प्रिया पाण्डेय">
                  </div>
                  <div>
                    <label class="block font-bold text-gray-800 mb-1">जन्म नक्षत्र:</label>
                    <select id="girl-nakshatra" class="w-full p-2 rounded-xl border border-gray-300 bg-white">
                      ${[
                        'अश्विनी (मेष)', 'भरणी (मेष)', 'कृत्तिका (मेष/वृषभ)', 'रोहिणी (वृषभ)', 'मृगशिरा (वृषभ/मिथुन)', 'आर्द्रा (मिथुन)', 'पुनर्वसु (मिथुन/कर्क)', 'पुष्य (कर्क)', 'आश्लेषा (कर्क)', 'मघा (सिंह)', 'पूर्वाफाल्गुनी (सिंह)', 'उत्तराफाल्गुनी (सिंह/कन्या)', 'हस्त (कन्या)', 'चित्रा (कन्या/तुला)', 'स्वाति (तुला)', 'विशाखा (तुला/वृश्चिक)', 'अनुराधा (वृश्चिक)', 'ज्येष्ठा (वृश्चिक)', 'मूल (धनु)', 'पूर्वाषाढ़ा (धनु)', 'उत्तराषाढ़ा (धनु/मकर)', 'श्रवण (मकर)', 'धनिष्ठा (मकर/कुंभ)', 'शतभिषा (कुंभ)', 'पूर्वाभाद्रपद (कुंभ/मीन)', 'उत्तराभाद्रपद (मीन)', 'रेवती (मीन)'
                      ].map((n, i) => `<option value="${i}">${n}</option>`).join('')}
                    </select>
                  </div>
                  <div>
                    <label class="block font-bold text-gray-800 mb-1">नक्षत्र चरण:</label>
                    <select id="girl-charan" class="w-full p-2 rounded-xl border border-gray-300 bg-white">
                      <option value="1">प्रथम चरण (१)</option>
                      <option value="2">द्वितीय चरण (२)</option>
                      <option value="3">तृतीय चरण (३)</option>
                      <option value="4">चतुर्थ चरण (४)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            <button type="submit" class="glass-btn-3d glass-btn-3d-saffron w-full py-3 rounded-2xl font-black text-sm sm:text-base text-white shadow-md">
              💑 अष्टकूट ३६ गुण मिलान गणना करें →
            </button>
          </form>

          <!-- Milan Results Output Container -->
          <div id="milan-results-container" class="mt-4 space-y-3" style="display:none;">
            <!-- Populated via handleMilanSubmit -->
          </div>
        </div>

        <!-- Kundli Lagna Diamond Chart Section -->
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 space-y-3">
          <div class="flex items-center justify-between border-b border-amber-200 pb-2">
            <h3 class="font-heading font-black text-sm sm:text-base text-red-950">
              💎 उत्तर-भारतीय लग्न कुण्डली चक्र (North-Indian Diamond Chart)
            </h3>
            <span class="text-xs bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded-full">१२ भाव व ग्रह</span>
          </div>
          <div class="p-3 bg-amber-50/50 rounded-2xl flex items-center justify-center">
            ${VedicKundli.renderDiamondChartSVG(1, { 1: ['सू'], 2: ['गु'], 3: ['चं'], 4: ['शु'], 5: ['के'], 6: ['बु'], 7: ['मं'], 8: ['रा'], 10: ['श'] })}
          </div>
        </div>

      </div>
    `;
  },

  // --- VIEW: SATSANG & CHALISA (सत्संग व चालीसा) ---
  satsang() {
    return `
      <div class="space-y-4">
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2.5">
            <span class="text-3xl">📿</span>
            <div>
              <h2 class="font-heading font-black text-base sm:text-lg text-red-950">
                सत्संग, पावन स्तोत्र व श्री हनुमान चालीसा
              </h2>
              <p class="text-xs text-amber-900 font-medium">नित्य वाचन, भावार्थ एवं १०८ जप साधना</p>
            </div>
          </div>
          <button onclick="openChalisaModal()" class="glass-btn-3d glass-btn-3d-saffron px-3.5 py-2 rounded-xl text-xs font-black text-white">
            🚩 हनुमान चालीसा खोलें
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="p-4 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2">
            <h3 class="font-heading font-black text-sm text-red-950">श्री रुद्राष्टकम् (नमामीशमीशान निर्वाणरूपं)</h3>
            <p class="text-gray-700 leading-relaxed font-devanagari">नमामीशमीशान निर्वाणरूपं विभुं व्यापकं ब्रह्मवेदस्वरूपम्। निजं निर्गुणं निर्विकल्पं निरीहं चिदाकाशमाकाशवासं भजेऽहम्॥</p>
            <button onclick="VedicAudio.playPeaceChime()" class="text-orange-700 font-bold">शांति नाद सुनें →</button>
          </div>
          <div class="p-4 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2">
            <h3 class="font-heading font-black text-sm text-red-950">महामृत्युंजय महामंत्र (१०८ आवर्तन)</h3>
            <p class="text-gray-700 leading-relaxed font-devanagari">ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्॥</p>
            <a href="#jaap" class="text-orange-700 font-bold">माला जाप प्रारंभ करें →</a>
          </div>
        </div>
      </div>
    `;
  },

  // --- VIEW: MUHURAT & PANCHANG (पंचांग व मुहूर्त) ---
  muhurat() {
    const p = APP_STATE.panchang || VedicPanchang.calculate();
    return `
      <div class="space-y-4">
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2.5">
            <span class="text-3xl">☀️</span>
            <div>
              <h2 class="font-heading font-black text-base sm:text-lg text-red-950">
                दैनिक वैदिक पंचांग एवं शुभ मुहूर्त (गोरखपुर)
              </h2>
              <p class="text-xs text-amber-900 font-medium">${p.date} • अक्षांश: 26.7606° N, 83.3732° E</p>
            </div>
          </div>
          <button onclick="openVratCalendarModal()" class="glass-btn-3d glass-btn-3d-gold px-3.5 py-2 rounded-xl text-xs font-black">
            📅 व्रत कैलेंडर देखें
          </button>
        </div>

        <!-- Muhurat Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${SHUBH_MUHURATS_DATA.map(m => `
            <div class="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2 text-xs">
              <div class="flex items-center justify-between border-b border-amber-100 pb-1 font-bold text-red-950">
                <span class="font-heading text-sm flex items-center gap-1.5">
                  <span>${m.emoji}</span><span>${m.categoryName}</span>
                </span>
                <span class="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded text-[10px]">${m.quality}</span>
              </div>
              <p class="font-bold text-gray-900">${m.title}</p>
              <div class="space-y-1 text-gray-700">
                <div>📅 <strong>तिथि:</strong> ${m.dateFormatted} (${m.tithi})</div>
                <div>✨ <strong>नक्षत्र व योग:</strong> ${m.nakshatra} • ${m.yoga}</div>
                <div>⏱️ <strong>शुभ समय:</strong> <span class="text-emerald-800 font-bold">${m.timeSlot}</span></div>
              </div>
              <p class="text-[11px] text-gray-600 bg-amber-50/70 p-2 rounded-xl border border-amber-200/60 leading-snug">
                ${m.significance}
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // --- VIEW: KUNDALI (जन्म कुण्डली चक्र) ---
  kundali() {
    return `
      <div class="space-y-4">
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2.5">
            <span class="text-3xl">🔮</span>
            <div>
              <h2 class="font-heading font-black text-base sm:text-lg text-red-950">
                वैदिक जन्म कुण्डली व भविष्यफल विश्लेषण
              </h2>
              <p class="text-xs text-amber-900 font-medium">लग्न चक्र, नवमांश, विंशोत्तरी महादशा व ग्रह स्थिति</p>
            </div>
          </div>
          <a href="tel:+917309441019" class="glass-btn-3d glass-btn-3d-emerald px-3.5 py-2 rounded-xl text-xs font-black text-white flex items-center gap-1.5">
            <i class="fa-solid fa-phone"></i>
            <span>ज्योतिष परामर्श: 7309441019</span>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 space-y-3">
            <h3 class="font-heading font-black text-sm text-red-950 border-b border-amber-200 pb-2">
              💎 जन्म लग्न चक्र
            </h3>
            <div class="p-2 bg-amber-50/50 rounded-2xl flex items-center justify-center">
              ${VedicKundli.renderDiamondChartSVG(1, { 1: ['सू'], 2: ['गु'], 3: ['चं'], 4: ['शु'], 5: ['के'], 6: ['बु'], 7: ['मं'], 8: ['रा'], 10: ['श'] })}
            </div>
          </div>

          <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 space-y-3 text-xs">
            <h3 class="font-heading font-black text-sm text-red-950 border-b border-amber-200 pb-2">
              📜 ग्रह स्थिति एवं महादशा
            </h3>
            <div class="space-y-2">
              <div class="p-2.5 bg-white rounded-xl border border-amber-200 flex justify-between font-bold">
                <span>लग्न (Ascendant):</span><span class="text-red-900">मेष (स्वामी: मंगल)</span>
              </div>
              <div class="p-2.5 bg-white rounded-xl border border-amber-200 flex justify-between font-bold">
                <span>चंद्र राशि (Moon Sign):</span><span class="text-red-900">मिथुन (आर्द्रा नक्षत्र)</span>
              </div>
              <div class="p-2.5 bg-white rounded-xl border border-amber-200 flex justify-between font-bold">
                <span>वर्तमान महादशा:</span><span class="text-emerald-900">बृहस्पति महादशा (शुभ)</span>
              </div>
              <div class="p-2.5 bg-white rounded-xl border border-amber-200 flex justify-between font-bold">
                <span>मांगलिक स्थिति:</span><span class="text-amber-900">सौम्य / आंशिक मांगलिक</span>
              </div>
            </div>
            <div class="p-3 bg-amber-100/70 rounded-xl border border-amber-300 text-amber-950 font-medium leading-relaxed">
              💡 <strong>आचार्य परामर्श:</strong> पूर्ण कुण्डली चक्र एवं सटीक भविष्यफल समाधान हेतु जन्म विवरण सहित सीधे संपर्क करें।
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // --- VIEW: JAAP MALA (१०८ रुद्राक्ष माला जाप) ---
  // --- VIEW: JAAP MALA & AUTHENTIC MANTRAS (१०८ रुद्राक्ष माला जाप व मन्त्र संग्रह) ---
  jaap() {
    return `
      <div class="space-y-6">
        <div class="glass-ribbon rounded-3xl p-4 sm:p-6 shadow-md border-2 border-amber-300/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="space-y-1 text-center md:text-left">
            <span class="text-3xl">📿</span>
            <h2 class="font-heading font-black text-xl sm:text-2xl text-red-950">
              वैदिक मंत्र, नाद ब्रह्म एवं १०८ रुद्राक्ष जप माला
            </h2>
            <p class="text-xs font-bold text-amber-900">वेब ऑडियो एपीआई आधारित तानपूरा नाद (Sa-Pa 136.1Hz), मनका गणक एवं प्रामाणिक महामंत्र</p>
          </div>
          <button onclick="VedicAudio.toggleTanpuraDrone()" class="glass-btn-3d glass-btn-3d-gold px-4 py-2.5 rounded-xl text-xs font-black text-red-950 flex items-center gap-2 shrink-0">
            <span>ॐ</span> <span>तानपूरा नाद चालू/बंद</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left: 108 Japa Mala Counter -->
          <div class="lg:col-span-5 glass-ribbon rounded-3xl p-6 shadow-xl border-2 border-amber-400 text-center space-y-4 font-devanagari">
            <h3 class="font-heading font-black text-base text-red-950">१०८ मनका जप माला साधना</h3>
            <p class="text-[11px] text-gray-600">मनका फेरने हेतु स्पर्श करें • स्वतः ध्वनि व कम्पन</p>

            <!-- Counter Display -->
            <div class="relative w-44 h-44 mx-auto rounded-full bg-gradient-to-tr from-amber-100 via-orange-100 to-amber-200 border-4 border-amber-500 shadow-inner flex flex-col items-center justify-center select-none">
              <span id="bead-count" class="font-heading font-black text-5xl text-red-950">0</span>
              <span class="text-xs font-bold text-amber-900 uppercase tracking-widest mt-1">/ १०८ मनके</span>
            </div>

            <!-- Total Malas Completed -->
            <div class="text-xs font-bold text-amber-950 bg-amber-100/80 py-1.5 px-4 rounded-full inline-block border border-amber-300">
              पूर्ण माला: <span id="total-malas-count" class="text-red-950 font-black text-sm">0</span>
            </div>

            <!-- Big Tap Button -->
            <div>
              <button onclick="handleBeadTap()" class="glass-btn-3d glass-btn-3d-saffron w-full py-4 rounded-2xl font-black text-base sm:text-lg text-white shadow-lg active:scale-95 transition flex items-center justify-center gap-2">
                <span>📿</span> <span>मनका फेरें (Tap Bead)</span>
              </button>
            </div>

            <!-- Controls -->
            <div class="flex items-center justify-center gap-2 pt-2 text-xs">
              <button onclick="resetBeadCount()" class="px-3 py-1.5 rounded-xl bg-white border border-gray-300 font-bold text-gray-700 hover:bg-gray-50">
                ↺ रीसेट करें
              </button>
              <button onclick="VedicAudio.playOmChant()" class="px-3 py-1.5 rounded-xl bg-amber-200 text-amber-950 font-black hover:bg-amber-300">
                ॐ नाद
              </button>
              <button onclick="VedicAudio.playTempleBell()" class="px-3 py-1.5 rounded-xl bg-amber-200 text-amber-950 font-black hover:bg-amber-300">
                🔔 घंटी
              </button>
            </div>
          </div>

          <!-- Right: Categorized Vedic Mantras -->
          <div class="lg:col-span-7 space-y-4 font-devanagari">
            <div class="glass-ribbon rounded-3xl p-5 border-2 border-amber-300/80 shadow-md space-y-4">
              <div class="flex items-center justify-between border-b border-amber-200 pb-2">
                <h3 class="font-heading font-black text-base text-red-950">प्रामाणिक वैदिक महामंत्र संग्रह</h3>
                <span class="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">वेदोक्त पाठ</span>
              </div>

              <!-- Gayatri Mantra -->
              <div class="p-4 bg-white/90 rounded-2xl border border-amber-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full uppercase">ऋग्वेद महामंत्र</span>
                  <button onclick="VedicAudio.playOmChant()" class="glass-btn-3d glass-btn-3d-gold px-2.5 py-1 rounded-lg text-[10px] font-black text-red-950 flex items-center gap-1">
                    <i class="fa-solid fa-volume-high"></i> <span>ॐ नाद श्रवण</span>
                  </button>
                </div>
                <div class="text-base sm:text-lg font-heading font-black text-red-950 leading-relaxed">
                  ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥
                </div>
                <p class="text-xs text-gray-700 italic">
                  <strong>भावार्थ:</strong> उस प्राणस्वरूप, दुःखनाशक, सुखस्वरूप, श्रेष्ठ तेजस्वी परमात्मा का ध्यान करते हैं जो हमारी बुद्धि को सन्मार्ग की ओर प्रेरित करे।
                </p>
              </div>

              <!-- Mahamrityunjaya Mantra -->
              <div class="p-4 bg-white/90 rounded-2xl border border-amber-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full uppercase">संजीवनी मंत्र</span>
                  <button onclick="VedicAudio.playTempleBell()" class="glass-btn-3d glass-btn-3d-gold px-2.5 py-1 rounded-lg text-[10px] font-black text-red-950 flex items-center gap-1">
                    <i class="fa-solid fa-bell"></i> <span>घण्टा नाद</span>
                  </button>
                </div>
                <div class="text-base sm:text-lg font-heading font-black text-red-950 leading-relaxed">
                  ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥
                </div>
                <p class="text-xs text-gray-700 italic">
                  <strong>भावार्थ:</strong> त्रिनेत्रधारी भगवान शिव की आराधना करते हैं जो जीवन शक्ति की पुष्टि करते हैं। हम मृत्यु के सांसारिक बंधनों से मुक्त होकर अमरत्व को प्राप्त हों।
                </p>
              </div>

              <!-- Shanti Path -->
              <div class="p-4 bg-white/90 rounded-2xl border border-amber-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">वैदिक शांति पाठ</span>
                  <button onclick="VedicAudio.playPeaceChime()" class="glass-btn-3d glass-btn-3d-emerald px-2.5 py-1 rounded-lg text-[10px] font-black text-white flex items-center gap-1">
                    <i class="fa-solid fa-dove"></i> <span>शांति नाद</span>
                  </button>
                </div>
                <div class="text-xs sm:text-sm font-heading font-black text-red-950 leading-relaxed">
                  ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः। वनस्पतयः शान्तिर्विश्वेदेवाः शान्तिर्ब्रह्म शान्तिः सर्वं शान्तिः शान्तिरेव शान्तिः सा मा शान्तिरेधि॥ ॐ शान्तिः शान्तिः शान्तिः॥
                </div>
              </div>

              <!-- Shri Suktam & Shiva Panchakshara -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div class="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
                  <span class="text-[10px] font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">महालक्ष्मी महामंत्र</span>
                  <div class="text-xs font-bold text-red-950">ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद श्रीं ह्रीं श्रीं ॐ महालक्ष्म्यै नमः॥</div>
                </div>
                <div class="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
                  <span class="text-[10px] font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">शिव पंचाक्षर मंत्र</span>
                  <div class="text-xs font-bold text-red-950">ॐ नमः शिवाय (नागेन्द्रहाराय त्रिलोचनाय भस्माङ्गरागाय महेश्वराय)॥</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  templeLive() {
    return `
      <div class="space-y-4">
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2.5">
            <span class="text-3xl">🛕</span>
            <div>
              <h2 class="font-heading font-black text-base sm:text-lg text-red-950">
                १३ प्रमुख पावन मंदिर व ज्योतिर्लिंग सजीव दर्शन
              </h2>
              <p class="text-xs text-amber-900 font-medium">घर बैठे साक्षात प्रभु के गर्भगृह से नित्य आरती व दिव्य दर्शन</p>
            </div>
          </div>
          <button onclick="VedicAudio.playTempleBell()" class="glass-btn-3d glass-btn-3d-gold px-3.5 py-2 rounded-xl text-xs font-black">
            🔔 घंटा नाद बजाएं
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${TEMPLES_DATA.map(t => `
            <div onclick="openTempleLiveModal('${t.id}')" class="group cursor-pointer rounded-2xl overflow-hidden border-2 border-amber-300 bg-white shadow-sm hover:shadow-md transition">
              <div class="relative aspect-video bg-slate-900 overflow-hidden">
                <img src="${t.thumbnail}" alt="${t.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" onerror="this.src='https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                <div class="absolute top-2 left-2 flex items-center gap-1 bg-red-600/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-white/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot"></span>
                  <span>LIVE</span>
                </div>
                <div class="absolute top-2 right-2 bg-black/60 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  👁️ ${t.viewers.toLocaleString('hi-IN')} दर्शनार्थी
                </div>
                <div class="absolute bottom-2 left-2 right-2 text-white">
                  <h4 class="font-heading font-black text-xs sm:text-sm drop-shadow-md">${t.name}</h4>
                  <p class="text-[10px] text-amber-200/90 drop-shadow-sm truncate">${t.location}</p>
                </div>
              </div>
              <div class="p-2.5 flex items-center justify-between text-[11px] bg-amber-50/50">
                <span class="text-amber-950 font-bold truncate">🪔 ${t.aartiTime.split('|')[0] || 'नित्य आरती'}</span>
                <span class="text-orange-700 font-extrabold flex items-center gap-1 shrink-0">
                  दर्शन करें <i class="fa-solid fa-play text-[9px]"></i>
                </span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Live Prayer Wall Submission & Feed -->
        <div class="glass-ribbon rounded-3xl p-4 sm:p-6 shadow-md border-2 border-amber-300/80 space-y-4">
          <div class="flex items-center justify-between border-b border-amber-200 pb-2 flex-wrap gap-2">
            <div>
              <h3 class="font-heading font-black text-base sm:text-lg text-red-950">
                🙏 भक्त सामूहिक प्रार्थना एवं मनोरथ पटल (Live Prayer Wall)
              </h3>
              <p class="text-xs text-amber-900 font-medium">घर बैठे अपना पावन मनोरथ व प्रार्थना संदेश जोड़ें</p>
            </div>
            <button onclick="VedicAudio.playPeaceChime()" class="glass-btn-3d glass-btn-3d-emerald px-3.5 py-1.5 rounded-xl text-xs font-black text-white">
              🕊️ शांति नाद
            </button>
          </div>
          <form onsubmit="handlePrayerSubmit(event)" class="space-y-2 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" id="prayer-name" required placeholder="आपका नाम (उदा. सुरेश शुक्ल)" class="p-2.5 rounded-xl border border-gray-300 bg-white">
              <input type="text" id="prayer-city" required placeholder="नगर/स्थान (उदा. गोरखपुर)" class="p-2.5 rounded-xl border border-gray-300 bg-white">
            </div>
            <textarea id="prayer-text" rows="2" required placeholder="अपना मनोरथ, मनोकामना अथवा प्रार्थना संदेश यहाँ लिखें..." class="w-full p-2.5 rounded-xl border border-gray-300 bg-white"></textarea>
            <button type="submit" class="glass-btn-3d glass-btn-3d-saffron px-5 py-2.5 rounded-xl font-black text-white text-xs">
              प्रार्थना पटल पर जोड़ें →
            </button>
          </form>
          <div id="prayers-list" class="space-y-2 pt-2">
            <!-- Loaded dynamically via loadPrayers() -->
          </div>
        </div>
      </div>
    `;
  },

  // --- VIEW: ACHARYA LIVE & PRAYER WALL ---
  acharyaLive() {
    return `
      <div class="space-y-4">
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2.5">
            <span class="text-3xl">🔴</span>
            <div>
              <h2 class="font-heading font-black text-base sm:text-lg text-red-950">
                आचार्य सजीव प्रसारण एवं भक्त प्रार्थना पटल
              </h2>
              <p class="text-xs text-amber-900 font-medium">सजीव रुद्राभिषेक, कथा एवं यजमान संकल्प</p>
            </div>
          </div>
          <a href="tel:+917309441019" class="glass-btn-3d glass-btn-3d-emerald px-3.5 py-2 rounded-xl text-xs font-black text-white">
            📞 ऑडियो कॉल: 7309441019
          </a>
        </div>

        <!-- Video Broadcast Frame -->
        <div class="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-xl border-2 border-amber-400 max-w-3xl mx-auto">
          <iframe class="w-full h-full" src="https://www.youtube.com/embed/XcAxRyJ0DBQ?autoplay=1&mute=1" frameborder="0" allowfullscreen></iframe>
        </div>

        <!-- Live Prayer Wall Submission & Feed -->
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 space-y-3">
          <h3 class="font-heading font-black text-sm sm:text-base text-red-950 border-b border-amber-200 pb-2">
            🙏 भक्त प्रार्थना एवं मनोरथ पटल
          </h3>
          <form onsubmit="handlePrayerSubmit(event)" class="space-y-2 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" id="prayer-name" required placeholder="आपका नाम (उदा. सुरेश शुक्ल)" class="p-2 rounded-xl border border-gray-300">
              <input type="text" id="prayer-city" required placeholder="शहर (उदा. गोरखपुर)" class="p-2 rounded-xl border border-gray-300">
            </div>
            <textarea id="prayer-text" rows="2" required placeholder="अपना मनोरथ / प्रार्थना संदेश यहाँ लिखें..." class="w-full p-2 rounded-xl border border-gray-300"></textarea>
            <button type="submit" class="glass-btn-3d glass-btn-3d-saffron px-4 py-2 rounded-xl font-black text-white text-xs">
              प्रार्थना साझा करें →
            </button>
          </form>
          <div id="prayers-list" class="space-y-2 pt-2">
            <!-- Loaded dynamically via loadPrayers() -->
          </div>
        </div>
      </div>
    `;
  },

  // --- VIEW: BOOKING (ऑनलाइन पूजा बुकिंग) ---
  booking() {
    return `
      <div class="space-y-4 max-w-2xl mx-auto">
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 text-center space-y-1">
          <span class="text-3xl">✨</span>
          <h2 class="font-heading font-black text-base sm:text-lg text-red-950">
            ऑनलाइन वैदिक अनुष्ठान एवं पूजा बुकिंग
          </h2>
          <p class="text-xs text-amber-900 font-medium">शास्त्रोक्त विधि, संकल्प व दक्षिणा सहित सजीव अनुष्ठान</p>
        </div>

        <!-- Booking Form -->
        <div class="glass-ribbon rounded-3xl p-4 sm:p-6 shadow-md border-2 border-amber-300/80">
          <form onsubmit="handleBookingSubmit(event)" class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-gray-800 mb-1">पूजन / अनुष्ठान का चयन करें:</label>
              <select id="book-service" required class="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium">
                <option value="रुद्राभिषेक एवं महारुद्र पूजन">रुद्राभिषेक एवं महारुद्र पूजन</option>
                <option value="महामृत्युंजय महामंत्र जप">महामृत्युंजय महामंत्र जप</option>
                <option value="श्री नवग्रह शांति महायज्ञ">श्री नवग्रह शांति महायज्ञ</option>
                <option value="श्री सत्यनारायण महापूजा एवं कथा">श्री सत्यनारायण महापूजा एवं कथा</option>
                <option value="नूतन गृह प्रवेश एवं वास्तु शांति">नूतन गृह प्रवेश एवं वास्तु शांति</option>
                <option value="वैदिक ज्योतिष कुण्डली परामर्श">वैदिक ज्योतिष कुण्डली परामर्श (ऑडियो कॉल)</option>
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label class="block font-bold text-gray-800 mb-1">यजमान का नाम:</label>
                <input type="text" id="book-name" required placeholder="उदा. पं० रमेश पाण्डेय" class="w-full p-2.5 rounded-xl border border-gray-300">
              </div>
              <div>
                <label class="block font-bold text-gray-800 mb-1">फ़ोन नंबर (१० अंक):</label>
                <input type="tel" id="book-phone" required pattern="[0-9]{10}" placeholder="उदा. 9876543210" class="w-full p-2.5 rounded-xl border border-gray-300">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label class="block font-bold text-gray-800 mb-1">इच्छित पूजा तिथि:</label>
                <input type="date" id="book-date" required class="w-full p-2.5 rounded-xl border border-gray-300 bg-white">
              </div>
              <div>
                <label class="block font-bold text-gray-800 mb-1">समय वेला (Time Slot):</label>
                <select id="book-slot" required class="w-full p-2.5 rounded-xl border border-gray-300 bg-white">
                  <option value="08:00 - 11:00">प्रातः वेला (08:00 AM - 11:00 AM)</option>
                  <option value="11:30 - 02:30">मध्याह्न वेला (11:30 AM - 02:30 PM)</option>
                  <option value="04:00 - 07:00">सायं वेला (04:00 PM - 07:00 PM)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label class="block font-bold text-gray-800 mb-1">अनुष्ठान स्थान प्रकार (Location Type):</label>
                <select id="book-location-type" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium">
                  <option value="local_gorakhpur">गोरखपुर स्थानीय (यजमान निवास / मंदिर)</option>
                  <option value="audio_call">सीधा ऑडियो कॉल परामर्श (Phone / WhatsApp Call)</option>
                  <option value="outstation">बाहरी जिला / राज्य (पूर्वांचल व अन्य)</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-gray-800 mb-1">गोत्र (यदि ज्ञात हो):</label>
                <input type="text" id="book-gotra" placeholder="उदा. कश्यप / भारद्वाज" class="w-full p-2.5 rounded-xl border border-gray-300">
              </div>
            </div>

            <div>
              <label class="block font-bold text-gray-800 mb-1">पूजन स्थल का पूरा पता:</label>
              <input type="text" id="book-address" required placeholder="स्थान, मोहल्ला, शहर" class="w-full p-2.5 rounded-xl border border-gray-300">
            </div>

            <button type="submit" class="glass-btn-3d glass-btn-3d-saffron w-full py-3 rounded-2xl font-black text-sm sm:text-base text-white shadow-md">
              ✨ पूजा बुकिंग सबमिट करें →
            </button>
          </form>

          <!-- Tracking Reference Tool -->
          <div class="mt-4 pt-3 border-t border-amber-200 text-xs">
            <h4 class="font-bold text-amber-950 mb-1">🔍 पूर्व बुकिंग संदर्भ ट्रैक करें:</h4>
            <div class="flex gap-2">
              <input type="text" id="track-ref-input" placeholder="AKS-YYYY-XXXX" class="flex-1 p-2 rounded-xl border border-gray-300 uppercase">
              <button onclick="handleTrackBooking()" class="glass-btn-3d glass-btn-3d-gold px-3.5 py-2 rounded-xl font-black">
                ट्रैक करें
              </button>
            </div>
            <div id="track-result" style="display:none;" class="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-300 font-medium"></div>
          </div>
        </div>
      </div>
    `;
  },

  // --- VIEW: SAMAGRI & RITUALS (सामग्री सूची) ---
  rituals() {
    return `
      <div class="space-y-4">
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2.5">
            <span class="text-3xl">📋</span>
            <div>
              <h2 class="font-heading font-black text-base sm:text-lg text-red-950">
                पूजा सामग्री चेकलिस्ट एवं अनुष्ठान विधि
              </h2>
              <p class="text-xs text-amber-900 font-medium">शास्त्रोक्त सामग्री सूची, टिक मार्क एवं WhatsApp शेयर</p>
            </div>
          </div>
          <button onclick="printSamagriSlip()" class="glass-btn-3d glass-btn-3d-gold px-3.5 py-2 rounded-xl text-xs font-black">
            🖨️ पर्ची प्रिंट करें
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Puja Selector Column -->
          <div class="glass-ribbon rounded-3xl p-3.5 shadow-md border-2 border-amber-300/80 space-y-2">
            <h3 class="font-heading font-black text-sm text-red-950 mb-2">पूजा का चयन करें:</h3>
            ${SAMAGRI_DATA.map((s, idx) => `
              <button onclick="selectSamagriPuja('${s.id}')" class="w-full text-left p-2.5 rounded-xl border text-xs font-bold transition ${idx === 0 ? 'bg-amber-100 border-amber-400 text-red-950' : 'bg-white border-amber-200 text-gray-800'}">
                ${s.name}
              </button>
            `).join('')}
          </div>

          <!-- Items Checklist Column -->
          <div class="md:col-span-2 glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 space-y-3">
            <div id="samagri-checklist-items">
              <!-- Rendered via selectSamagriPuja -->
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // --- VIEW: TOOLS (वैदिक साधन) ---
  tools() {
    return `
      <div class="space-y-4">
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80">
          <h2 class="font-heading font-black text-base sm:text-lg text-red-950">
            🧭 संपूर्ण वैदिक साधन एवं कल्याणकारी टूल्स
          </h2>
          <p class="text-xs text-amber-900 font-medium">दैनिक साधना, मार्गदर्शन व शास्त्रोक्त गणनाएँ</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div onclick="openRamashalakaModal()" class="cursor-pointer glass-panel p-4 rounded-2xl border border-emerald-300 shadow-xs space-y-2 hover:scale-[1.01] transition">
            <span class="text-3xl">🏹</span>
            <h3 class="font-heading font-black text-sm text-emerald-950">श्रीरामशलाका प्रश्नावली</h3>
            <p class="text-xs text-gray-700">मानस चौपाई समाधान चक्र। स्पर्श करें और दैवीय मार्गदर्शन पाएं।</p>
          </div>
          <div onclick="openSuprabhatModal()" class="cursor-pointer glass-panel p-4 rounded-2xl border border-amber-300 shadow-xs space-y-2 hover:scale-[1.01] transition">
            <span class="text-3xl">🖼️</span>
            <h3 class="font-heading font-black text-sm text-amber-950">१-क्लिक सुप्रभात कार्ड</h3>
            <p class="text-xs text-gray-700">आज का पंचांग, पावन श्लोक व आशीर्वाद युक्त WhatsApp फोटो स्टेटस।</p>
          </div>
          <div onclick="openChalisaModal()" class="cursor-pointer glass-panel p-4 rounded-2xl border border-rose-300 shadow-xs space-y-2 hover:scale-[1.01] transition">
            <span class="text-3xl">🚩</span>
            <h3 class="font-heading font-black text-sm text-rose-950">श्री हनुमान चालीसा पाठ</h3>
            <p class="text-xs text-gray-700">नेत्र-सुख वाचन, दोहे, चौपाई व संपूर्ण सरल हिंदी भावार्थ।</p>
          </div>
          <div onclick="openNamkaranModal()" class="cursor-pointer glass-panel p-4 rounded-2xl border border-purple-300 shadow-xs space-y-2 hover:scale-[1.01] transition">
            <span class="text-3xl">👶</span>
            <h3 class="font-heading font-black text-sm text-purple-950">शिशु नामकरण कैलकुलेटर</h3>
            <p class="text-xs text-gray-700">२७ नक्षत्रों के ४ चरणों अनुसार शुभ नामाक्षर व वैदिक नाम।</p>
          </div>
          <div onclick="openVratCalendarModal()" class="cursor-pointer glass-panel p-4 rounded-2xl border border-amber-300 shadow-xs space-y-2 hover:scale-[1.01] transition">
            <span class="text-3xl">📅</span>
            <h3 class="font-heading font-black text-sm text-amber-950">२ वर्ष व्रत कैलेंडर</h3>
            <p class="text-xs text-gray-700">२०२६-२०२८ के २४ एकादशी पारण समय, प्रदोष व महापर्व।</p>
          </div>
          <div onclick="window.location.hash='#jaap'" class="cursor-pointer glass-panel p-4 rounded-2xl border border-amber-300 shadow-xs space-y-2 hover:scale-[1.01] transition">
            <span class="text-3xl">📿</span>
            <h3 class="font-heading font-black text-sm text-amber-950">१०८ रुद्राक्ष जाप माला</h3>
            <p class="text-xs text-gray-700">अकॉस्टिक क्लिक ध्वनि एवं १३६.१Hz तानपूरा ॐ नाद सहित।</p>
          </div>
        </div>
      </div>
    `;
  },

  // --- VIEW: ADMIN (प्रशासनिक नियंत्रण कक्ष) ---
  admin() {
    if (!APP_STATE.isAdmin) {
      return `
        <div class="glass-ribbon rounded-3xl p-6 text-center max-w-md mx-auto space-y-3">
          <i class="fa-solid fa-lock text-4xl text-amber-600"></i>
          <h2 class="font-heading font-black text-lg text-red-950">व्यवस्थापक लॉगिन आवश्यक</h2>
          <p class="text-xs text-gray-700">प्रशासनिक डैशबोर्ड व यजमान बही-खाता देखने हेतु कृपया लॉगिन करें।</p>
          <button onclick="openAdminLoginModal()" class="glass-btn-3d glass-btn-3d-gold px-6 py-2.5 rounded-xl font-black text-sm">
            लॉगिन करें →
          </button>
        </div>
      `;
    }

    return `
      <div class="space-y-4">
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 class="font-heading font-black text-base sm:text-lg text-red-950">
              🛡️ प्रशासनिक नियंत्रण कक्ष एवं यजमान बही-खाता
            </h2>
            <p class="text-xs text-amber-900 font-medium">सत्र सक्रिय • सुरक्षित SQLite WAL डेटाबेस</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="API.exportYajmans()" class="glass-btn-3d glass-btn-3d-emerald px-3 py-1.5 rounded-xl text-xs font-black text-white">
              📥 बही-खाता CSV एक्सपोर्ट
            </button>
            <button onclick="handleAdminLogout()" class="px-3 py-1.5 rounded-xl bg-red-800 text-white font-bold text-xs">
              लॉगआउट
            </button>
          </div>
        </div>

        <!-- Yajman Records Table -->
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 space-y-2">
          <h3 class="font-heading font-black text-sm text-red-950">📖 संरक्षित यजमान बही-खाता</h3>
          <div id="admin-yajmans-table" class="overflow-x-auto text-xs">
            <p class="text-gray-500">लोड हो रहा है...</p>
          </div>
        </div>

        <!-- Admin Audit Logs -->
        <div class="glass-ribbon rounded-3xl p-4 shadow-md border-2 border-amber-300/80 space-y-2">
          <h3 class="font-heading font-black text-sm text-red-950">🛡️ सुरक्षा एवं ऑडिट लॉग्स</h3>
          <div id="admin-audit-logs" class="overflow-x-auto text-xs max-h-48 overflow-y-auto">
            <p class="text-gray-500">लोड हो रहा है...</p>
          </div>
        </div>
      </div>
    `;
  }

  // --- VIEW: ABOUT ACHARYA (आचार्य परिचय एवं शोध) ---
  about() {
    return `
      <div class="space-y-6">
        <!-- Hero Header -->
        <div class="glass-ribbon rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-300/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-2 text-center md:text-left">
            <div class="inline-flex items-center gap-2 bg-amber-100 text-amber-950 px-3 py-1 rounded-full text-xs font-black border border-amber-300">
              <span class="w-2 h-2 rounded-full bg-emerald-500 live-dot"></span>
              <span>गोरखपुर, उत्तर प्रदेश • वैदिक एवं सनातन सेवा केंद्र</span>
            </div>
            <h1 class="font-heading font-black text-2xl sm:text-4xl text-red-950 leading-tight">
              आचार्य पं० अश्वनी कुमार शुक्ल
            </h1>
            <p class="text-sm sm:text-base font-bold text-amber-900 font-devanagari">
              वैदिक कर्मकाण्ड मर्मज्ञ, फलित ज्योतिष शोधार्थी एवं श्रीमद्भागवत कथा व्यास
            </p>
            <p class="text-xs text-gray-700 leading-relaxed max-w-2xl font-devanagari">
              पूर्वांचल की पावन तपोभूमि गोरखपुर से सनातन वैदिक संस्कारों, शुद्ध वेदोक्त अनुष्ठानों, महायज्ञों एवं प्रामाणिक जन्म कुण्डली मार्गदर्शन हेतु समर्पित आध्यात्मिक संस्थान।
            </p>
          </div>
          <div class="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
            <a href="tel:+917309441019" class="glass-btn-3d glass-btn-3d-emerald px-5 py-3 rounded-2xl text-xs sm:text-sm font-black text-white text-center flex items-center justify-center gap-2">
              <i class="fa-solid fa-phone"></i>
              <span>7309441019 पर संपर्क करें</span>
            </a>
            <a href="https://wa.me/917309441019?text=नमस्ते%20आचार्य%20जी,%20मुझे%20परामर्श%20हेतु%20जानकारी%20चाहिए।" target="_blank" class="glass-btn-3d glass-btn-3d-gold px-5 py-3 rounded-2xl text-xs sm:text-sm font-black text-red-950 text-center flex items-center justify-center gap-2">
              <i class="fa-brands fa-whatsapp text-emerald-700 text-base"></i>
              <span>WhatsApp परामर्श</span>
            </a>
          </div>
        </div>

        <!-- Detailed Biography & Spiritual Lineage -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="glass-ribbon rounded-3xl p-6 shadow-md border-2 border-amber-300/80 space-y-3 font-devanagari">
            <h3 class="font-heading font-black text-lg text-red-950 border-b border-amber-200 pb-2 flex items-center gap-2">
              <span>📜</span> <span>साधना पृष्ठभूमि एवं गुरु परम्परा</span>
            </h3>
            <p class="text-xs text-gray-800 leading-relaxed">
              आचार्य पं० अश्वनी कुमार शुक्ल जी शुक्लयजुर्वेद माध्यन्दिनीय शाखा के वेदोक्त कर्मकाण्ड, अष्टादश महापुराण एवं पराशरी ज्योतिष परम्परा के निष्ठावान साधक हैं। काशी एवं पूर्वांचल के प्रकाण्ड आचार्यों के सानिध्य में आपने वेद-वेदांग, षोडश संस्कार, रुद्राष्टाध्यायी एवं फलित ज्योतिष का गहन अध्ययन संपन्न किया है।
            </p>
            <p class="text-xs text-gray-800 leading-relaxed">
              विगत 15 से अधिक वर्षों से आप देश-विदेश के सैकड़ों यजमान परिवारों के यहाँ श्रीमद्भागवत सप्ताह ज्ञान यज्ञ, श्री राम कथा, महारुद्राभिषेक, नूतन गृह प्रवेश एवं महायज्ञों का शास्त्रीय रीति से संचालन करते आ रहे हैं।
            </p>
          </div>

          <div class="glass-ribbon rounded-3xl p-6 shadow-md border-2 border-amber-300/80 space-y-3 font-devanagari">
            <h3 class="font-heading font-black text-lg text-red-950 border-b border-amber-200 pb-2 flex items-center gap-2">
              <span>🎓</span> <span>शास्त्रीय योग्यता एवं शोध क्षेत्र</span>
            </h3>
            <ul class="space-y-2 text-xs text-gray-800">
              <li class="flex items-start gap-2">
                <span class="text-amber-600 font-black">✦</span>
                <span><strong>आचार्य उपाधि:</strong> सम्पूर्णानन्द संस्कृत विश्वविद्यालय परम्परा से ज्योतिष एवं कर्मकाण्ड में विशिष्ट योग्यता।</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-amber-600 font-black">✦</span>
                <span><strong>पूर्वांचल शोध:</strong> पूर्वांचल अंचल की वैदिक मान्यताओं, लोक संस्कारों एवं राप्ती-सरयू तीरे वैदिक परम्पराओं पर प्रामाणिक शोध।</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-amber-600 font-black">✦</span>
                <span><strong>500+ सफल आयोजन:</strong> श्रीमद्भागवत सप्ताह, महारुद्राभिषेक, नवचंडी महायज्ञ एवं वास्तु शांति अनुष्ठान।</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-amber-600 font-black">✦</span>
                <span><strong>निष्ठा:</strong> सनातन परम्परा की शुचिता, स्वेच्छा दक्षिणा एवं यजमान कल्याण हेतु निष्काम सेवा भाव।</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Key Pillars Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="glass-ribbon rounded-3xl p-4 shadow-sm border border-amber-300 text-center space-y-2">
            <span class="text-3xl">📖</span>
            <h4 class="font-heading font-black text-sm text-red-950">भागवत एवं राम कथा</h4>
            <p class="text-[11px] text-gray-700">7 दिवसीय संगीतमय श्रीमद्भागवत कथा एवं 9 दिवसीय रामकथा नवाह्न परायण।</p>
            <a href="#katha-vachan" class="inline-block text-xs font-bold text-orange-700 hover:underline">कथा विवरण देखें →</a>
          </div>
          <div class="glass-ribbon rounded-3xl p-4 shadow-sm border border-amber-300 text-center space-y-2">
            <span class="text-3xl">🕉️</span>
            <h4 class="font-heading font-black text-sm text-red-950">वैदिक कर्मकाण्ड</h4>
            <p class="text-[11px] text-gray-700">रुद्राभिषेक, सत्यनारायण कथा, नवग्रह शांति एवं षोडश संस्कार।</p>
            <a href="#rituals" class="inline-block text-xs font-bold text-orange-700 hover:underline">अनुष्ठान सूची →</a>
          </div>
          <div class="glass-ribbon rounded-3xl p-4 shadow-sm border border-amber-300 text-center space-y-2">
            <span class="text-3xl">🔮</span>
            <h4 class="font-heading font-black text-sm text-red-950">कुण्डली एवं ज्योतिष</h4>
            <p class="text-[11px] text-gray-700">36 गुण मिलान, लग्न चक्र, मांगलिक विचार व साढ़े साती विश्लेषण।</p>
            <a href="#milan" class="inline-block text-xs font-bold text-orange-700 hover:underline">कुण्डली साधन →</a>
          </div>
          <div class="glass-ribbon rounded-3xl p-4 shadow-sm border border-amber-300 text-center space-y-2">
            <span class="text-3xl">📦</span>
            <h4 class="font-heading font-black text-sm text-red-950">सामग्री चेकलिस्ट</h4>
            <p class="text-[11px] text-gray-700">7 प्रमुख पूजाओं की शास्त्रोक्त सामग्री सूची, टिक-मार्क व WhatsApp शेयर।</p>
            <a href="#samagri" class="inline-block text-xs font-bold text-orange-700 hover:underline">चेकलिस्ट खोलें →</a>
          </div>
        </div>

        <!-- Gorakhpur Seva Kendra Address & Contact Card -->
        <div class="glass-ribbon rounded-3xl p-6 shadow-md border-2 border-amber-300/80 font-devanagari flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-1.5 text-center md:text-left">
            <div class="text-xs font-black text-orange-800 uppercase tracking-wider">अधिकृत सेवा केंद्र</div>
            <h3 class="font-heading font-black text-lg text-red-950">
              आचार्य पं० अश्वनी कुमार शुक्ल — वैदिक एवं सनातन सेवा केंद्र
            </h3>
            <p class="text-xs text-gray-700">
              📍 तारामण्डल / राप्ती तट परिक्षेत्र, गोरखपुर, उत्तर प्रदेश, भारत (पिन: 273001)
            </p>
            <p class="text-xs text-gray-600">
              दैनिक परामर्श समय: प्रातः 08:00 से रात्रि 09:00 बजे तक (सपरिवार प्रत्यक्ष दर्शन अथवा दूरभाष)
            </p>
          </div>
          <div class="flex flex-wrap gap-2 justify-center">
            <a href="#booking" class="glass-btn-3d glass-btn-3d-saffron px-4 py-2.5 rounded-xl text-xs font-black text-white">
              ✨ अनुष्ठान बुक करें
            </a>
            <a href="#dakshina" class="glass-btn-3d glass-btn-3d-gold px-4 py-2.5 rounded-xl text-xs font-black text-red-950">
              🪙 दक्षिणा नीति देखें
            </a>
          </div>
        </div>
      </div>
    `;
  },

  // --- VIEW: KATHA VACHAN (श्रीमद्भागवत एवं राम कथा वाचन) ---
  kathaVachan() {
    return `
      <div class="space-y-6">
        <!-- Header Ribbon -->
        <div class="glass-ribbon rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-300/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="space-y-1 text-center md:text-left">
            <div class="inline-flex items-center gap-2 bg-orange-100 text-orange-950 px-3 py-1 rounded-full text-xs font-black border border-orange-300">
              <span>📖</span>
              <span>व्यासपीठ अमृत वर्षा</span>
            </div>
            <h2 class="font-heading font-black text-2xl sm:text-3xl text-red-950">
              श्रीमद्भागवत एवं श्री राम कथा वाचन
            </h2>
            <p class="text-xs sm:text-sm font-bold text-amber-900">
              आचार्य पं० अश्वनी कुमार शुक्ल जी के पावन सानिध्य में संगीतमय ज्ञान यज्ञ
            </p>
          </div>
          <a href="#booking" class="glass-btn-3d glass-btn-3d-saffron px-5 py-3 rounded-2xl text-xs sm:text-sm font-black text-white shrink-0">
            ✨ कथा अनुष्ठान बुक करें
          </a>
        </div>

        <!-- 3 Major Katha Offerings -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- 1. Shrimad Bhagwat Saptah -->
          <div class="glass-ribbon rounded-3xl p-5 border-2 border-amber-300/80 shadow-md flex flex-col justify-between space-y-4 font-devanagari">
            <div class="space-y-2">
              <span class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-950 border border-orange-300">
                7 दिवसीय ज्ञान यज्ञ
              </span>
              <h3 class="font-heading font-black text-lg text-red-950">श्रीमद्भागवत सप्ताह ज्ञान यज्ञ</h3>
              <p class="text-xs text-gray-700 leading-relaxed">
                गोकर्ण उपाख्यान, राजा परीक्षित मोक्ष, कपिल देवहूति संवाद, ध्रुव-प्रह्लाद चरित्र, श्रीकृष्ण जन्मोत्सव (नंदोत्सव), गोवर्धन पूजा, महारास, रुक्मिणी विवाह एवं सुदामा चरित्र का भावपूर्ण, संगीतमय गायन।
              </p>
              <div class="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs text-amber-950 font-bold space-y-1">
                <div>फल: पितृ तृप्ति, सर्वपाप मुक्ति एवं कुल कल्याण</div>
                <div>अवधि: नित्य 4 से 5 घंटे (7 दिवस)</div>
              </div>
            </div>
            <a href="#booking" class="glass-btn-3d glass-btn-3d-gold w-full py-2.5 rounded-xl text-xs font-black text-red-950 text-center block">
              भागवत कथा निश्चित करें →
            </a>
          </div>

          <!-- 2. Shri Ram Katha -->
          <div class="glass-ribbon rounded-3xl p-5 border-2 border-amber-300/80 shadow-md flex flex-col justify-between space-y-4 font-devanagari">
            <div class="space-y-2">
              <span class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-950 border border-red-300">
                9 दिवसीय नवाह्न परायण
              </span>
              <h3 class="font-heading font-black text-lg text-red-950">मर्यादा पुरुषोत्तम श्री राम कथा</h3>
              <p class="text-xs text-gray-700 leading-relaxed">
                गोस्वामी तुलसीदास जी विरचित श्रीरामचरितमानस के सातों काण्डों (बालकाण्ड से उत्तरकाण्ड) का प्रामाणिक, मर्यादा एवं भक्ति रस से ओतप्रोत वाचन। सजीव झांकियां एवं सामूहिक सुंदरकांड पाठ।
              </p>
              <div class="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs text-amber-950 font-bold space-y-1">
                <div>फल: गृह क्लेश शांति, मर्यादा एवं राम कृपा प्राप्ति</div>
                <div>अवधि: नित्य 3 से 4 घंटे (9 दिवस)</div>
              </div>
            </div>
            <a href="#booking" class="glass-btn-3d glass-btn-3d-gold w-full py-2.5 rounded-xl text-xs font-black text-red-950 text-center block">
              श्री राम कथा निश्चित करें →
            </a>
          </div>

          <!-- 3. Shiv Mahapuran Katha -->
          <div class="glass-ribbon rounded-3xl p-5 border-2 border-amber-300/80 shadow-md flex flex-col justify-between space-y-4 font-devanagari">
            <div class="space-y-2">
              <span class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                7 दिवसीय महारुद्र कथा
              </span>
              <h3 class="font-heading font-black text-lg text-red-950">श्री शिव महापुराण कथा</h3>
              <p class="text-xs text-gray-700 leading-relaxed">
                रुद्र संहिता, सती चरित्र, शिव-पार्वती विवाह, कार्तिकेय-गणेश जन्म, 12 ज्योतिर्लिंगों की महिमा एवं नित्य सविधि पार्थिव शिवलिंग निर्माण व महारुद्राभिषेक पूजन।
              </p>
              <div class="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs text-amber-950 font-bold space-y-1">
                <div>फल: अकाल मृत्यु निवारण, आरोग्य एवं शिव सायुज्य</div>
                <div>अवधि: नित्य 3 से 4 घंटे (7 दिवस)</div>
              </div>
            </div>
            <a href="#booking" class="glass-btn-3d glass-btn-3d-gold w-full py-2.5 rounded-xl text-xs font-black text-red-950 text-center block">
              शिव महापुराण निश्चित करें →
            </a>
          </div>
        </div>

        <!-- Katha Guidelines & Organizer Rules -->
        <div class="glass-ribbon rounded-3xl p-6 shadow-md border-2 border-amber-300/80 font-devanagari space-y-4">
          <h3 class="font-heading font-black text-base sm:text-lg text-red-950 border-b border-amber-200 pb-2">
            📋 कथा आयोजन हेतु यजमान व्यवस्था एवं शास्त्रोक्त नियम
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-800 leading-relaxed">
            <div class="p-4 bg-white/80 rounded-2xl border border-amber-200 space-y-2">
              <h4 class="font-bold text-red-950 flex items-center gap-1.5">
                <span>🪔</span> <span>व्यासपीठ एवं मण्डप व्यवस्था</span>
              </h4>
              <p>कथा स्थल पर शुद्ध, पूर्व अथवा उत्तरमुखी व्यासपीठ, मंगल कलश, अखण्ड दीप एवं पोथी पूजन हेतु स्वच्छ वेदी का निर्माण किया जाना चाहिए।</p>
            </div>
            <div class="p-4 bg-white/80 rounded-2xl border border-amber-200 space-y-2">
              <h4 class="font-bold text-red-950 flex items-center gap-1.5">
                <span>🪙</span> <span>दक्षिणा एवं सहयोग नीति</span>
              </h4>
              <p>आचार्य जी द्वारा कथा वाचन में स्वेच्छा दक्षिणा नीति का पालन किया जाता है। यजमान अपनी सामर्थ्य एवं श्रद्धानुसार दक्षिणा संकल्प करते हैं।</p>
            </div>
          </div>
          <div class="text-center pt-2">
            <a href="tel:+917309441019" class="glass-btn-3d glass-btn-3d-emerald px-6 py-3 rounded-xl text-xs font-black text-white inline-flex items-center gap-2">
              <i class="fa-solid fa-phone"></i>
              <span>सीधे आचार्य जी से तिथियों व मुहूर्त पर वार्ता करें (7309441019)</span>
            </a>
          </div>
        </div>
      </div>
    `;
  },

  // --- VIEW: LIBRARY (सनातन ज्ञान एवं शोध पुस्तकालय) ---
  library() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="glass-ribbon rounded-3xl p-6 shadow-xl border-2 border-amber-300/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="space-y-1 text-center md:text-left">
            <div class="inline-flex items-center gap-2 bg-amber-100 text-amber-950 px-3 py-1 rounded-full text-xs font-black border border-amber-300">
              <span>📚</span>
              <span>ज्ञान, संस्कार एवं शोध</span>
            </div>
            <h2 class="font-heading font-black text-2xl sm:text-3xl text-red-950">
              सनातन ज्ञान एवं शोध पुस्तकालय
            </h2>
            <p class="text-xs sm:text-sm font-bold text-amber-900">
              पूर्वांचल वैदिक परम्पराएं, शास्त्रोक्त विधान एवं आचार्य जी के प्रामाणिक शोध लेख
            </p>
          </div>
          <!-- Search Input -->
          <div class="w-full md:w-80">
            <input type="text" id="lib-search" oninput="searchLibraryArticles()" placeholder="लेख खोजें (जैसे: परम्परा, वास्तु, भागवत)..." class="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-xs font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500">
          </div>
        </div>

        <!-- Filter Category Pills -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-bold text-amber-950 pb-1">
          <button onclick="searchLibraryArticles('all')" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-900 to-amber-900 text-white shadow-xs">
            सभी लेख
          </button>
          <button onclick="searchLibraryArticles('purvanchal_traditions')" class="px-3 py-1.5 rounded-xl bg-white border border-amber-200 hover:bg-amber-100 transition">
            पूर्वांचल परम्परा
          </button>
          <button onclick="searchLibraryArticles('vedic_philosophy')" class="px-3 py-1.5 rounded-xl bg-white border border-amber-200 hover:bg-amber-100 transition">
            वैदिक दर्शन व भागवत
          </button>
          <button onclick="searchLibraryArticles('karmakand_vidhi')" class="px-3 py-1.5 rounded-xl bg-white border border-amber-200 hover:bg-amber-100 transition">
            कर्मकाण्ड व वास्तु विधि
          </button>
        </div>

        <!-- Articles Grid Container -->
        <div id="articles-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <!-- Populated dynamically via searchLibraryArticles() -->
        </div>
      </div>
    `;
  },

  // --- VIEW: EVENTS (आगामी कार्यक्रम एवं धार्मिक आयोजन) ---
  events() {
    return `
      <div class="space-y-6">
        <div class="glass-ribbon rounded-3xl p-6 shadow-xl border-2 border-amber-300/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="space-y-1 text-center md:text-left">
            <div class="inline-flex items-center gap-2 bg-orange-100 text-orange-950 px-3 py-1 rounded-full text-xs font-black border border-orange-300">
              <span>📅</span>
              <span>धार्मिक कार्यक्रम पंचांग</span>
            </div>
            <h2 class="font-heading font-black text-2xl sm:text-3xl text-red-950">
              आगामी कार्यक्रम एवं धार्मिक आयोजन
            </h2>
            <p class="text-xs sm:text-sm font-bold text-amber-900">
              आचार्य जी के आगामी श्रीमद्भागवत सप्ताह, महारुद्राभिषेक एवं धार्मिक सत्रों का विवरण
            </p>
          </div>
          <a href="#booking" class="glass-btn-3d glass-btn-3d-saffron px-5 py-3 rounded-2xl text-xs sm:text-sm font-black text-white shrink-0">
            ✨ नया अनुष्ठान बुक करें
          </a>
        </div>

        <!-- Events Timeline List -->
        <div id="events-timeline-container" class="space-y-4">
          <!-- Populated dynamically via loadEventsTimeline() -->
        </div>
      </div>
    `;
  },

  // --- VIEW: SAMAGRI (पूजा सामग्री चेकलिस्ट जनरेटर) ---
  samagri() {
    return `
      <div class="space-y-6">
        <div class="glass-ribbon rounded-3xl p-6 shadow-xl border-2 border-amber-300/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="space-y-1 text-center md:text-left">
            <div class="inline-flex items-center gap-2 bg-amber-100 text-amber-950 px-3 py-1 rounded-full text-xs font-black border border-amber-300">
              <span>📦</span>
              <span>शास्त्रोक्त संकलन</span>
            </div>
            <h2 class="font-heading font-black text-2xl sm:text-3xl text-red-950">
              पूजा सामग्री चेकलिस्ट जनरेटर
            </h2>
            <p class="text-xs sm:text-sm font-bold text-amber-900">
              अनुष्ठान पूर्व यजमान हेतु सामग्री संकलन, टिक मार्क, प्रिंट एवं WhatsApp शेयर
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="printSamagriSlip()" class="glass-btn-3d glass-btn-3d-gold px-4 py-2.5 rounded-xl text-xs font-black text-red-950 flex items-center gap-1.5">
              <span>🖨️</span> <span>पर्ची प्रिंट</span>
            </button>
            <button onclick="copySamagriWhatsApp()" class="glass-btn-3d glass-btn-3d-emerald px-4 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-1.5">
              <i class="fa-brands fa-whatsapp"></i> <span>WhatsApp भेजें</span>
            </button>
          </div>
        </div>

        <!-- Puja Selector and Checklist Container -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- Left: Selector -->
          <div class="glass-ribbon rounded-3xl p-4 border-2 border-amber-300/80 shadow-md space-y-3 font-devanagari">
            <h3 class="font-heading font-black text-sm text-red-950 border-b border-amber-200 pb-2">
              अनुष्ठान चुनें:
            </h3>
            <div class="space-y-2">
              ${SAMAGRI_DATA.map((s, idx) => `
                <button onclick="selectSamagriPuja('${s.id}')" class="w-full text-left p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${idx === 0 ? 'bg-amber-100 border-amber-400 text-red-950 shadow-xs' : 'bg-white border-amber-200 text-gray-800 hover:bg-amber-50'}">
                  <span>${s.name}</span>
                  <span class="text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full shrink-0 ml-1">${s.items.length} वस्तुएं</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Right: Items Checklist -->
          <div class="md:col-span-2 glass-ribbon rounded-3xl p-5 border-2 border-amber-300/80 shadow-md space-y-3 font-devanagari">
            <div id="samagri-checklist-items">
              <!-- Rendered via selectSamagriPuja -->
            </div>
            <div class="pt-4 border-t border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span class="text-gray-600 font-medium">सामग्री एकत्र करने के पश्चात आचार्य जी से मुहूर्त की पुष्टि करें।</span>
              <div class="flex gap-2">
                <button onclick="copySamagriWhatsApp()" class="glass-btn-3d glass-btn-3d-emerald px-4 py-2 rounded-xl text-xs font-black text-white">
                  WhatsApp शेयर
                </button>
                <a href="#booking" class="glass-btn-3d glass-btn-3d-saffron px-4 py-2 rounded-xl text-xs font-black text-white">
                  यह पूजा बुक करें
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // --- VIEW: DAKSHINA POLICY (दक्षिणा एवं सहयोग नीति) ---
  dakshina() {
    return `
      <div class="space-y-6">
        <div class="glass-ribbon rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-300/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="space-y-1 text-center md:text-left">
            <div class="inline-flex items-center gap-2 bg-amber-100 text-amber-950 px-3 py-1 rounded-full text-xs font-black border border-amber-300">
              <span>🪙</span>
              <span>शास्त्र सम्मत नीति</span>
            </div>
            <h2 class="font-heading font-black text-2xl sm:text-3xl text-red-950">
              दक्षिणा, दान एवं सहयोग नीति
            </h2>
            <p class="text-xs sm:text-sm font-bold text-amber-900">
              शास्त्र सम्मत वैदिक अनुष्ठानों में दक्षिणा का महत्व एवं पारदर्शी सहयोग व्यवस्था
            </p>
          </div>
          <a href="tel:+917309441019" class="glass-btn-3d glass-btn-3d-emerald px-5 py-3 rounded-2xl text-xs sm:text-sm font-black text-white shrink-0">
            📞 7309441019 पर संपर्क
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 font-devanagari">
          <!-- Left: Principles -->
          <div class="glass-ribbon rounded-3xl p-6 border-2 border-amber-300/80 shadow-md space-y-4">
            <h3 class="font-heading font-black text-base sm:text-lg text-red-950 border-b border-amber-200 pb-2">
              📜 शास्त्रोक्त दक्षिणा का शास्त्रीय विधान
            </h3>
            <div class="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs italic font-bold text-amber-950">
              "यथाशक्ति प्रदातव्यं दक्षिणा फलदायिनी। यजमानस्य श्रद्धया कर्म सिद्ध्यति नान्यथा॥"
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">
              सनातन धर्म में वेद-विद्या, कथा वाचन एवं कर्मकाण्ड का कोई व्यापारिक मूल्य नहीं हो सकता। दक्षिणा यजमान की निष्ठा, श्रद्धा एवं सामर्थ्य के अनुसार स्वेच्छा से अर्पित किया जाने वाला पवित्र संकल्प है।
            </p>
            <ul class="space-y-2 text-xs text-gray-800">
              <li class="flex items-start gap-2">
                <span class="text-amber-600 font-bold">✓</span>
                <span><strong>स्वेच्छा दक्षिणा:</strong> किसी भी यजमान पर कोई अनिवार्य शुल्क या दबाव नहीं होता।</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-amber-600 font-bold">✓</span>
                <span><strong>सत्पात्रे दानम्:</strong> प्राप्त सहयोग का उपयोग वेद विद्यालय, गौ सेवा, अन्नक्षेत्र एवं सनातन धर्म के प्रचार में होता है।</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-amber-600 font-bold">✓</span>
                <span><strong>पारदर्शिता:</strong> प्रत्येक संकल्प की रसीद एवं संदर्भ कोड सुरक्षित प्रदान किया जाता है।</span>
              </li>
            </ul>
          </div>

          <!-- Right: Dakshina Sankalp Form -->
          <div class="glass-ribbon rounded-3xl p-6 border-2 border-amber-300/80 shadow-md space-y-4">
            <h3 class="font-heading font-black text-base sm:text-lg text-red-950 border-b border-amber-200 pb-2">
              🪙 दक्षिणा एवं सहयोग संकल्प प्रपत्र
            </h3>
            <form id="dakshina-form" onsubmit="submitDakshinaOrder(event)" class="space-y-3 text-xs">
              <div>
                <label class="block font-bold text-amber-950 mb-1">श्रद्धालु / यजमान का नाम *</label>
                <input type="text" id="dk-name" required placeholder="उदा. रमेश कुमार मिश्र" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white">
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block font-bold text-amber-950 mb-1">मोबाइल नंबर *</label>
                  <input type="tel" id="dk-phone" required placeholder="10 अंकों का मोबाइल" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white">
                </div>
                <div>
                  <label class="block font-bold text-amber-950 mb-1">गोत्र (ऐच्छिक)</label>
                  <input type="text" id="dk-gotra" placeholder="उदा. कश्यप / भारद्वाज" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block font-bold text-amber-950 mb-1">संकल्प राशि (₹)</label>
                  <input type="number" id="dk-amount" placeholder="उदा. 1100, 2100" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold">
                </div>
                <div>
                  <label class="block font-bold text-amber-950 mb-1">सहयोग उद्देश्य</label>
                  <select id="dk-purpose" class="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold">
                    <option value="कथा आयोजन दक्षिणा">कथा आयोजन दक्षिणा</option>
                    <option value="रुद्राभिषेक दक्षिणा">रुद्राभिषेक दक्षिणा</option>
                    <option value="अन्नक्षेत्र व गौ सेवा">अन्नक्षेत्र व गौ सेवा</option>
                    <option value="वेद प्रचार व मन्दिर सेवा">वेद प्रचार व मन्दिर सेवा</option>
                  </select>
                </div>
              </div>
              <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div><strong>UPI ID:</strong> 7309441019@upi</div>
                <div><strong>PhonePe / GPay / Paytm:</strong> 7309441019</div>
              </div>
              <button type="submit" class="glass-btn-3d glass-btn-3d-saffron w-full py-3 rounded-xl font-black text-white text-xs">
                🪙 दक्षिणा संकल्प दर्ज करें →
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  },
};

// ----------------------------------------------------------------------------
// 10. HELPER FUNCTIONS & ACTIVE RASHI DISPLAY
// ----------------------------------------------------------------------------
function selectRashi(rashiId) {
  APP_STATE.activeRashiId = rashiId;
  const disp = document.getElementById('rashi-card-display');
  if (disp) disp.innerHTML = renderActiveRashiCard(rashiId);

  document.querySelectorAll('.rashi-pill').forEach(btn => {
    btn.className = btn.textContent.includes(RASHIFAL_DATA.find(r => r.id === rashiId).name)
      ? 'rashi-pill px-3 py-1.5 rounded-xl whitespace-nowrap transition bg-gradient-to-r from-red-900 to-amber-900 text-white shadow-xs'
      : 'rashi-pill px-3 py-1.5 rounded-xl whitespace-nowrap transition bg-white/80 border border-amber-200 text-amber-950';
  });
}

function renderActiveRashiCard(rashiId) {
  const r = RASHIFAL_DATA.find(x => x.id === rashiId) || RASHIFAL_DATA[0];
  return `
    <div class="flex items-center justify-between border-b border-amber-200 pb-2 flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <span class="text-2xl">${r.symbol}</span>
        <div>
          <h4 class="font-heading font-black text-sm sm:text-base text-red-950 leading-tight">${r.name} राशि (${r.englishName})</h4>
          <span class="text-[10px] text-amber-900 font-bold">स्वामी: ${r.lord} • तत्व: ${r.element}</span>
        </div>
      </div>
      <div class="text-[10px] text-gray-700 bg-amber-100 px-2.5 py-1 rounded-full font-bold">
        शुभ रंग: ${r.colorHex} • नामाक्षर: ${r.letters}
      </div>
    </div>
    <div class="space-y-1.5 text-xs text-gray-800 leading-relaxed font-medium">
      <p>🌟 <strong>दैनिक फलादेश:</strong> आज का दिन आपके लिए कार्यक्षेत्र में उत्साह एवं नए अवसरों से युक्त रहेगा। परिवार में सामंजस्य बना रहेगा तथा आध्यात्मिक रुचि में वृद्धि होगी।</p>
      <p class="text-emerald-900 bg-emerald-50 p-2 rounded-xl border border-emerald-200">📿 <strong>अचूक शास्त्रीय उपाय:</strong> प्रातः काल भगवान सूर्यनारायण को तांबे के लोटे से अर्घ्य दें एवं ॐ नमो भगवते वासुदेवाय मंत्र का २१ बार जप करें।</p>
    </div>
  `;
}

function copyShlokaText() {
  const dayIdx = new Date().getDay();
  const s = DAILY_SHLOKAS[dayIdx];
  const t = `🪔 *आज का पावन वैदिक सुविचार एवं श्लोक* 🪔\n\n${s.mantra}\n\n${s.meaning}\n\n- आचार्य पं० अश्वनी कुमार शुक्ल (गोरखपुर)\n📞 7309441019`;
  navigator.clipboard.writeText(t);
  showToast('✓ श्लोक कॉपी हो गया!', 'success');
  VedicAudio.playPeaceChime();
}

function shareShlokaWhatsApp() {
  const dayIdx = new Date().getDay();
  const s = DAILY_SHLOKAS[dayIdx];
  const t = `🪔 *आज का पावन वैदिक सुविचार एवं श्लोक* 🪔\n\n${s.mantra}\n\n${s.meaning}\n\n- आचार्य पं० अश्वनी कुमार शुक्ल (गोरखपुर)\n📞 7309441019`;
  window.open(`https://wa.me/917309441019?text=${encodeURIComponent(t)}`, '_blank');
}

// Milan Calculation Submission
function handleMilanSubmit(e) {
  e.preventDefault();
  VedicAudio.playTempleBell();

  const boyNak = document.getElementById('boy-nakshatra').value;
  const girlNak = document.getElementById('girl-nakshatra').value;

  const result = VedicKundli.calculateGunaMilan({ nakshatra: boyNak }, { nakshatra: girlNak });
  const container = document.getElementById('milan-results-container');
  if (!container) return;

  container.innerHTML = `
    <div class="p-4 rounded-2xl border-2 ${result.verdictClass} shadow-md space-y-3">
      <div class="flex items-center justify-between border-b pb-2 flex-wrap gap-2">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider block">कुल अष्टकूट गुण मिलान</span>
          <span class="font-heading font-black text-2xl sm:text-3xl">${result.total} / ३६ गुण</span>
        </div>
        <span class="font-black text-xs sm:text-sm px-3 py-1 rounded-full bg-white/70 border">
          ${result.verdict}
        </span>
      </div>

      <!-- Breakdown Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        ${Object.values(result.breakdown).map(b => `
          <div class="p-2 bg-white/80 rounded-xl border border-amber-200">
            <span class="block text-[10px] text-gray-600 font-bold">${b.name}</span>
            <span class="font-black text-sm text-red-950">${b.score} / ${b.max}</span>
          </div>
        `).join('')}
      </div>

      <!-- Dosha Remarks -->
      <div class="text-xs font-bold space-y-1 pt-1">
        <div>नाड़ी दोष: ${result.nadiDosha ? '<span class="text-rose-700">⚠️ नाड़ी दोष विद्यमान (परिहार अनिवार्य)</span>' : '<span class="text-emerald-700">✓ नाड़ी दोष रहित (शुभ)</span>'}</div>
        <div>भकूट दोष: ${result.bhakootDosha ? '<span class="text-rose-700">⚠️ भकूट दोष विद्यमान</span>' : '<span class="text-emerald-700">✓ भकूट दोष रहित</span>'}</div>
      </div>

      <!-- Direct Audio Call Assistance -->
      <div class="pt-2 border-t flex items-center justify-between flex-wrap gap-2">
        <span class="text-xs text-gray-800">दोष परिहार व संपूर्ण शास्त्रीय विश्लेषण हेतु:</span>
        <a href="tel:+917309441019" class="glass-btn-3d glass-btn-3d-emerald px-3 py-1.5 rounded-xl text-xs font-black text-white">
          📞 आचार्य जी से बात करें (7309441019)
        </a>
      </div>
    </div>
  `;
  container.style.display = 'block';
  container.scrollIntoView({ behavior: 'smooth' });
}

// ----------------------------------------------------------------------------
// 11. JAAP BEAD TAP & COUNTER
// ----------------------------------------------------------------------------
let currentBead = 0;
let totalMalas = 0;

function handleBeadTap() {
  VedicAudio.playBeadClick();
  currentBead++;
  if (currentBead >= 108) {
    currentBead = 0;
    totalMalas++;
    VedicAudio.playTempleBell();
    showToast(`🎉 १ पूर्ण माला (१०८ मंत्र) संपन्न हुई! कुल माला: ${totalMalas}`, 'success');
  }
  const beadEl = document.getElementById('bead-count');
  const malaEl = document.getElementById('total-malas-count');
  if (beadEl) beadEl.textContent = currentBead;
  if (malaEl) malaEl.textContent = totalMalas;
}

function resetBeadCount() {
  if (confirm('क्या आप जाप गणना रीसेट करना चाहते हैं?')) {
    currentBead = 0;
    totalMalas = 0;
    const beadEl = document.getElementById('bead-count');
    const malaEl = document.getElementById('total-malas-count');
    if (beadEl) beadEl.textContent = '0';
    if (malaEl) malaEl.textContent = '0';
    showToast('जाप गणना रीसेट हुई।', 'info');
  }
}

// ----------------------------------------------------------------------------
// 12. BOOKING SUBMISSION & TRACKING
// ----------------------------------------------------------------------------
async function handleBookingSubmit(e) {
  e.preventDefault();
  const payload = {
    service_name: document.getElementById('book-service').value,
    client_name: document.getElementById('book-name').value.trim(),
    client_phone: document.getElementById('book-phone').value.trim(),
    booking_date: document.getElementById('book-date').value,
    time_slot: document.getElementById('book-slot').value,
    location_type: document.getElementById('book-location-type').value,
    venue_address: document.getElementById('book-address').value.trim(),
    gotra: document.getElementById('book-gotra').value.trim() || 'कश्यप'
  };

  const res = await API.createBooking(payload);
  if (res.ok && res.data.booking) {
    VedicAudio.playTempleBell();
    showToast(`✓ पूजा बुकिंग सफल! संदर्भ कोड: ${res.data.booking.reference_code}`, 'success');
    alert(`🎉 आपकी पूजा बुकिंग सफलतापूर्वक दर्ज हो गई है!\n\nसंदर्भ कोड: ${res.data.booking.reference_code}\n\nआचार्य जी द्वारा शीघ्र ही आपसे संपर्क किया जाएगा।`);
  } else {
    showToast(res.data.error || 'बुकिंग में त्रुटि।', 'error');
  }
}

async function handleTrackBooking() {
  const ref = document.getElementById('track-ref-input').value.trim();
  if (!ref) return;

  const res = await API.trackBooking(ref);
  const disp = document.getElementById('track-result');
  if (!disp) return;

  if (res.ok && res.data.reference_code) {
    const b = res.data;
    disp.innerHTML = `
      <div class="space-y-1">
        <div class="flex justify-between font-bold text-red-950">
          <span>संदर्भ: ${b.reference_code}</span>
          <span class="uppercase font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">${b.status}</span>
        </div>
        <div>अनुष्ठान: ${b.service_name}</div>
        <div>यजमान: ${b.client_name} • तिथि: ${b.booking_date} (${b.time_slot})</div>
      </div>
    `;
  } else {
    disp.innerHTML = `<span class="text-rose-700">⚠️ संदर्भ कोड नहीं मिला। कृपया सही कोड दर्ज करें।</span>`;
  }
  disp.style.display = 'block';
}

// ----------------------------------------------------------------------------
// 13. PRAYER WALL HANDLERS
// ----------------------------------------------------------------------------
async function handlePrayerSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('prayer-name').value.trim();
  const city = document.getElementById('prayer-city').value.trim();
  const text = document.getElementById('prayer-text').value.trim();

  const res = await API.submitPrayer({ devotee_name: name, city, prayer_text: text });
  if (res.ok) {
    VedicAudio.playPeaceChime();
    showToast('✓ प्रार्थना पटल पर साझा हुई!', 'success');
    document.getElementById('prayer-text').value = '';
    loadPrayers();
  } else {
    showToast(res.data.error || 'त्रुटि।', 'error');
  }
}

async function loadPrayers() {
  const el = document.getElementById('prayers-list');
  if (!el) return;

  const res = await API.getPrayers();
  if (res.ok && Array.isArray(res.data)) {
    el.innerHTML = res.data.map(p => `
      <div class="p-2.5 bg-white rounded-xl border border-amber-200 text-xs space-y-1">
        <div class="flex items-center justify-between font-bold text-red-950">
          <span>🙏 ${p.devotee_name} (${p.city})</span>
          <span class="text-[10px] text-gray-500">${new Date(p.created_at).toLocaleDateString('hi-IN')}</span>
        </div>
        <p class="text-gray-800 leading-relaxed">${p.prayer_text}</p>
      </div>
    `).join('');
  }
}

// ----------------------------------------------------------------------------
// 14. SAMAGRI CHECKLIST FUNCTIONS
// ----------------------------------------------------------------------------
function selectSamagriPuja(pujaId) {
  APP_STATE.activeSamagriPujaId = pujaId;
  const puja = SAMAGRI_DATA.find(p => p.id === pujaId) || SAMAGRI_DATA[0];
  const container = document.getElementById('samagri-checklist-items');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-3">
      <div class="flex items-center justify-between border-b border-amber-200 pb-2">
        <h4 class="font-heading font-black text-sm text-red-950">${puja.name}</h4>
        <span class="text-[10px] bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded-full">
          कुल ${puja.items.length} आवश्यक सामग्री
        </span>
      </div>
      <div class="space-y-1.5 text-xs">
        ${puja.items.map((it, idx) => `
          <label class="flex items-center justify-between p-2 bg-white rounded-xl border border-amber-100 hover:bg-amber-50 cursor-pointer">
            <span class="flex items-center gap-2">
              <input type="checkbox" class="w-4 h-4 rounded text-orange-600 focus:ring-orange-500">
              <span class="font-medium text-gray-800">${it.name}</span>
            </span>
            <span class="text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded">${it.qty}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

function printSamagriSlip() {
  window.print();
}

// ----------------------------------------------------------------------------
// 15. ADMIN OPERATIONS & LOGOUT
// ----------------------------------------------------------------------------
function handleAdminLogout() {
  localStorage.removeItem('acharya_admin_token');
  APP_STATE.token = '';
  APP_STATE.isAdmin = false;
  showToast('लॉगआउट संपन्न।', 'info');
  window.location.hash = '#home';
}

async function loadAdminTables() {
  const tableEl = document.getElementById('admin-yajmans-table');
  const auditEl = document.getElementById('admin-audit-logs');
  if (!tableEl) return;

  const res = await API.getYajmans();
  if (res.ok && Array.isArray(res.data)) {
    tableEl.innerHTML = `
      <table class="w-full text-left border-collapse border border-amber-200">
        <thead>
          <tr class="bg-amber-100/80 text-amber-950">
            <th class="p-2 border">नाम</th>
            <th class="p-2 border">फ़ोन</th>
            <th class="p-2 border">गोत्र</th>
            <th class="p-2 border">शहर</th>
            <th class="p-2 border">अनुष्ठान</th>
          </tr>
        </thead>
        <tbody>
          ${res.data.map(y => `
            <tr class="hover:bg-amber-50">
              <td class="p-2 border font-bold">${y.name}</td>
              <td class="p-2 border">${y.phone}</td>
              <td class="p-2 border">${y.gotra || '-'}</td>
              <td class="p-2 border">${y.city || 'गोरखपुर'}</td>
              <td class="p-2 border">${y.last_service || 'रुद्राभिषेक'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  if (auditEl) {
    const aRes = await API.getAuditLogs();
    if (aRes.ok && Array.isArray(aRes.data)) {
      auditEl.innerHTML = aRes.data.map(l => `
        <div class="p-1.5 border-b border-gray-100 flex justify-between">
          <span><strong>${l.action}</strong> by ${l.username}</span>
          <span class="text-gray-400">${l.created_at}</span>
        </div>
      `).join('');
    }
  }
}

// ----------------------------------------------------------------------------
// 16. CLIENT-SIDE ROUTER & NAVIGATION ENGINE
// ----------------------------------------------------------------------------
const VedicApp = {
  navigate(target) {
    let rawHash = (target || window.location.hash || '#home').trim();
    if (rawHash === '#' || rawHash === '') rawHash = '#home';

    // Normalize routes
    const routeMap = {
      '#/': 'home',
      '#home': 'home',
      '#/home': 'home',
      '#about': 'about',
      '#/about': 'about',
      '#katha-vachan': 'kathaVachan',
      '#/katha-vachan': 'kathaVachan',
      '#library': 'library',
      '#/library': 'library',
      '#events': 'events',
      '#/events': 'events',
      '#samagri': 'samagri',
      '#/samagri': 'samagri',
      '#dakshina': 'dakshina',
      '#/dakshina': 'dakshina',
      '#astrology': 'milan',
      '#/astrology': 'milan',
      '#milan': 'milan',
      '#/milan': 'milan',
      '#/panchang': 'muhurat',
      '#muhurat': 'muhurat',
      '#/muhurat': 'muhurat',
      '#kundali': 'kundali',
      '#/kundali': 'kundali',
      '#/mantras': 'jaap',
      '#mantras': 'jaap',
      '#satsang': 'satsang',
      '#/satsang': 'satsang',
      '#jaap': 'jaap',
      '#/jaap': 'jaap',
      '#/live-darshan': 'templeLive',
      '#live-darshan': 'templeLive',
      '#temple-live': 'templeLive',
      '#/temple-live': 'templeLive',
      '#acharya-live': 'acharyaLive',
      '#/acharya-live': 'acharyaLive',
      '#/booking': 'booking',
      '#booking': 'booking',
      '#/puja-services': 'rituals',
      '#puja-services': 'rituals',
      '#rituals': 'rituals',
      '#/rituals': 'rituals',
      '#tools': 'tools',
      '#/tools': 'tools',
      '#/admin': 'admin',
      '#admin': 'admin',
      '#contact': 'about',
      '#/contact': 'about'
    };

    const viewKey = routeMap[rawHash] || 'home';

    // Push to history if new
    if (APP_STATE.currentTab !== viewKey) {
      APP_STATE.history.push(APP_STATE.currentTab);
      APP_STATE.currentTab = viewKey;
    }

    // Toggle Back Button Visibility
    const backBtn = document.getElementById('btn-back-page');
    if (backBtn) {
      backBtn.style.display = APP_STATE.history.length > 0 ? 'inline-flex' : 'none';
    }

    // Update Subnav Active State
    document.querySelectorAll('.subnav-pill').forEach(pill => {
      const href = pill.getAttribute('href');
      if (href && (href === rawHash || routeMap[href] === viewKey)) {
        pill.className = 'subnav-pill px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 bg-gradient-to-r from-red-900 to-amber-900 text-white shadow-xs';
      } else {
        pill.className = 'subnav-pill px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 hover:bg-amber-200/70 border border-amber-300/50 text-amber-950';
      }
    });

    // Render View
    const viewport = document.getElementById('app-viewport');
    if (viewport && Views[viewKey]) {
      viewport.innerHTML = Views[viewKey]();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Post-render lifecycle hooks
            if (viewKey === 'acharyaLive' || viewKey === 'templeLive') loadPrayers();
      if (viewKey === 'rituals' || viewKey === 'samagri') selectSamagriPuja('rudrabhishek');
      if (viewKey === 'library') searchLibraryArticles();
      if (viewKey === 'events') loadEventsTimeline();
      if (viewKey === 'admin') loadAdminTables();
    }
  },

  goBack() {
    VedicAudio.playTempleBell();
    if (APP_STATE.history.length > 0) {
      const prev = APP_STATE.history.pop();
      APP_STATE.currentTab = prev;
      window.location.hash = '#' + prev;
    } else {
      window.location.hash = '#home';
    }
  }
};

// ----------------------------------------------------------------------------
// 17. INITIALIZATION & DOM READY HOOK
// ----------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  // Mobile Hamburger Toggle
  const hamburger = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-nav-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    // Auto-close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }

  // Calculate live daily panchang
  APP_STATE.panchang = VedicPanchang.calculate();

  // Route on hash change
  window.addEventListener('hashchange', () => VedicApp.navigate());

  // Initial navigation
  VedicApp.navigate();
});
