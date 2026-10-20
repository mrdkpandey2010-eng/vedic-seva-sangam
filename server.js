/**
 * आचार्य पं० अश्वनी कुमार शुक्ल — वैदिक एवं सनातन सेवा केंद्र (गोरखपुर, उ०प्र०)
 * Production-Oriented Zero-Dependency Web Application & Server
 * 
 * Built with native Node.js (node:http, node:sqlite, node:crypto, node:fs, node:path)
 * Compatible with Node.js 22+ (Native SQLite, No node_modules compilation required)
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

// ============================================================================
// 1. ENVIRONMENT CONFIGURATION LOADER
// ============================================================================
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const config = {
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || '0.0.0.0',
    SESSION_SECRET: process.env.SESSION_SECRET || 'acharya_shukla_vedic_2026_secret',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
    ADMIN_DEFAULT_PASSWORD: process.env.ADMIN_DEFAULT_PASSWORD || 'Acharya@Gorakhpur2026',
    ACHARYA_NAME: process.env.ACHARYA_NAME || 'आचार्य पं० अश्वनी कुमार शुक्ल',
    ACHARYA_LOCATION: process.env.ACHARYA_LOCATION || 'गोरखपुर, उत्तर प्रदेश, भारत (Gorakhpur, UP, India)',
    ACHARYA_PHONE: process.env.ACHARYA_PHONE || '7309441019',
    PAYMENT_GATEWAY_PROVIDER: process.env.PAYMENT_GATEWAY_PROVIDER || 'unconfigured'
  };

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const [key, ...vals] = line.split('=');
      const val = vals.join('=').trim();
      if (key && val) {
        config[key.trim()] = val;
      }
    });
  }
  return config;
}

const ENV = loadEnv();

// ============================================================================
// 2. NATIVE SQLITE DATABASE INITIALIZATION & MIGRATIONS
// ============================================================================
const dbPath = path.join(__dirname, 'data', 'vedic.db');
const db = new DatabaseSync(dbPath);

function initDatabase() {
  // WAL mode & pragmas
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // 1. Site Profile Table (Acharya's Verified Details - Editable)
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      acharya_name TEXT NOT NULL,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      phone TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT,
      bio TEXT NOT NULL,
      qualifications TEXT,
      research_overview TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Admin Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Services Catalog Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      duration_hours REAL DEFAULT 2.0,
      dakshina_guideline TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Bookings & Appointments Table (With Conflict Prevention)
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_ref TEXT UNIQUE NOT NULL,
      service_id INTEGER,
      service_name TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      client_email TEXT,
      booking_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      location_type TEXT NOT NULL,
      venue_address TEXT NOT NULL,
      gotra TEXT,
      sankalp_notes TEXT,
      dakshina_amount REAL DEFAULT 0,
      advance_paid REAL DEFAULT 0,
      status TEXT DEFAULT 'requested',
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Yajman Bahi-Khata (Protected Ledger) Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS yajmans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      gotra TEXT,
      family_members TEXT,
      address TEXT,
      notes TEXT,
      total_rituals INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Events & Kathas Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      event_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      venue TEXT NOT NULL,
      stream_url TEXT,
      stream_status TEXT DEFAULT 'upcoming',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. Sanatan Knowledge Articles & Research Library
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      references_text TEXT,
      is_published INTEGER DEFAULT 1,
      views_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 8. Live Prayer Wall (Community Intentions with Moderation)
  db.exec(`
    CREATE TABLE IF NOT EXISTS prayers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      devotee_name TEXT NOT NULL,
      city TEXT NOT NULL,
      prayer_text TEXT NOT NULL,
      is_moderated INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 9. Dakshina & Donation Records Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS dakshina_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_no TEXT UNIQUE NOT NULL,
      devotee_name TEXT NOT NULL,
      devotee_phone TEXT NOT NULL,
      amount REAL NOT NULL,
      purpose TEXT NOT NULL,
      payment_mode TEXT DEFAULT 'UPI / Direct',
      status TEXT DEFAULT 'pending',
      transaction_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 10. Audit Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      performed_by TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed Default Profile if empty
  const profileCount = db.prepare('SELECT COUNT(*) as count FROM site_profile').all()[0].count;
  if (profileCount === 0) {
    db.exec(`
      INSERT INTO site_profile (id, acharya_name, title, location, phone, whatsapp, email, bio, qualifications, research_overview)
      VALUES (
        1,
        'आचार्य पं० अश्वनी कुमार शुक्ल',
        'वैदिक कर्मकाण्ड, ज्योतिष मर्मज्ञ एवं श्रीमद्भागवत कथा वाचक',
        'गोरखपुर, उत्तर प्रदेश, भारत (Gorakhpur, UP, India)',
        '7309441019',
        '+917309441019',
        'acharya.ashwanishukla@gmail.com',
        'गोरखपुर की पावन धरा से सनातन वैदिक संस्कृति, ज्योतिषीय मार्गदर्शन, प्रामाणिक कर्मकाण्ड एवं श्रीमद्भागवत कथा के प्रचार-प्रसार हेतु समर्पित। यजमानों के कल्याणार्थ शुद्ध शास्त्रोक्त विधि से अनुष्ठान एवं शोधपरक मार्गदर्शन प्रदान करते हैं।',
        'वेद, कर्मकाण्ड एवं पराशर ज्योतिष में दीर्घकालीन प्रामाणिक स्वाध्याय व अनुभव (विवरण संपादन योग्य)',
        'पूर्वांचल की सनातन धार्मिक परम्पराओं, गृह्यसूत्रों के संस्कार विधान एवं काल गणना पर निरंतर शोध व लेखन'
      );
    `);
  }

  // Seed Default Admin if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').all()[0].count;
  if (userCount === 0) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(ENV.ADMIN_DEFAULT_PASSWORD, salt, 64).toString('hex');
    const stmt = db.prepare('INSERT INTO users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)');
    stmt.run(ENV.ADMIN_USERNAME, hash, salt, 'admin');
  }

  // Seed Initial Services if empty
  const servicesCount = db.prepare('SELECT COUNT(*) as count FROM services').all()[0].count;
  if (servicesCount === 0) {
    const defaultServices = [
      ['katha', 'श्रीमद्भागवत सप्ताह ज्ञान यज्ञ', 'संगीतमय एवं भावपूर्ण 7 दिवसीय श्रीमद्भागवत महापुराण कथा वाचन एवं अमृत वर्षा।', 28.0, 'यजमान की इच्छानुसार / स्वेच्छा दक्षिणा'],
      ['katha', 'श्री राम कथा एवं नवाह्न परायण', 'मर्यादा पुरुषोत्तम भगवान श्री राम के आदर्श चरित्र का 9 दिवसीय पावन गान एवं प्रवचन।', 27.0, 'यजमान की इच्छानुसार / स्वेच्छा दक्षिणा'],
      ['puja', 'रुद्राभिषेक एवं महारुद्र पूजन', 'भगवान भोलेनाथ का पञ्चामृत, गन्ने का रस, गंगाजल व 108 बेलपत्र द्वारा महाभिषेक।', 3.0, '₹2100 - ₹5100'],
      ['puja', 'श्री सत्यनारायण व्रत कथा एवं पूजन', 'पूर्णिमा, संक्रांति अथवा मांगलिक अवसर पर भगवान सत्यनारायण का सविधि पूजन।', 2.5, '₹1100 - ₹2100'],
      ['puja', 'गृह प्रवेश एवं वास्तु शांति अनुष्ठान', 'नवीन गृह अथवा प्रतिष्ठान में वास्तु दोष निवारण, नवग्रह होम एवं मंगल कलश स्थापना।', 4.5, '₹3100 - ₹7100'],
      ['puja', 'नवग्रह शांति एवं महायज्ञ', 'दोष निवारण, ग्रह शांति एवं सुख-समृद्धि हेतु वैदिक मंत्रों से 9 ग्रहों का विशेष हवन।', 3.5, '₹2500 - ₹5100'],
      ['sanskar', 'विवाह संस्कार एवं पाणिग्रहण विधि', 'कन्यादान, सप्तपदी, लाजा होम एवं पूर्ण वैदिक रीति से पवित्र विवाह संस्कार संपन्नता।', 6.0, 'यजमान विमर्श अनुसार'],
      ['sanskar', 'मुंडन (चूड़ाकर्म) एवं नामकरण संस्कार', 'शिशु के दीर्घायु व मेधा वृद्धि हेतु शुभ मुहूर्त में वैदिक संस्कार विधि।', 2.0, '₹1100 - ₹2100'],
      ['astrology', 'विस्तृत जन्म कुण्डली एवं भविष्य फलकथन', 'लग्न चक्र, नवमांश, महादशा, गोचर एवं करियर, स्वास्थ्य, वैवाहिक जीवन का विश्लेषण।', 1.0, '₹501 - ₹1100'],
      ['astrology', 'कुण्डली मिलान एवं गुण-दोष विश्लेषण', 'वर-कन्या की अष्टकूट 36 गुण मिलान, मांगलिक विचार एवं नाड़ी दोष परिहार परामर्श।', 1.0, '₹501'],
      ['puja', 'कालसर्प योग एवं पितृ दोष शांति', 'जीवन में आ रहे आकस्मिक विघ्नों व कालसर्प योग के निवारणार्थ वैदिक अनुष्ठान।', 4.0, '₹3100 - ₹5100']
    ];

    const stmt = db.prepare('INSERT INTO services (category, title, description, duration_hours, dakshina_guideline) VALUES (?, ?, ?, ?, ?)');
    defaultServices.forEach(s => stmt.run(s[0], s[1], s[2], s[3], s[4]));
  }

  // Seed Initial Articles if empty
  const articlesCount = db.prepare('SELECT COUNT(*) as count FROM articles').all()[0].count;
  if (articlesCount === 0) {
    const defaultArticles = [
      [
        'purvanchal-vedic-traditions',
        'पूर्वांचल की सनातन धार्मिक परम्पराएं एवं लोक संस्कार',
        'गोरखपुर एवं पूर्वांचल अंचल की वैदिक मान्यताओं, देव स्थानक और लोकाचार का शास्त्रीय विश्लेषण।',
        'पूर्वी उत्तर प्रदेश (पूर्वांचल) की भूमि वैदिक काल से ही तपस्वियों, योगियों और आचार्यों की तपोभूमि रही है। बाबा गोरखनाथ की पावन नगरी गोरखपुर से लेकर सरयू तट अयोध्या तक, यहाँ के लोक संस्कारों में गृह्यसूत्रों के नियमों का अत्यंत सूक्ष्म पालन होता है। यहां की विवाह पद्धतियां, छठ व्रत, कजरी तीज और एकादशी व्रतों में वेदोक्त सिद्धांतों और लोक संस्कृति का अद्भुत समन्वय है।',
        'purvanchal_traditions',
        'आचार्य पं० अश्वनी कुमार शुक्ल',
        'ऋग्वेद गृह्यसूत्र, भविष्य पुराण एवं पूर्वांचल लोक साहित्य संग्रह'
      ],
      [
        'shrimad-bhagwat-katha-mahatmya',
        'कलिकाल में श्रीमद्भागवत कथा का माहात्म्य एवं श्रवण फल',
        'श्रीमद्भागवत महापुराण के श्रवण मात्र से चित्त शुद्धि एवं भव सागर से मुक्ति का शास्त्रोक्त प्रमाण।',
        'श्रीमद्भागवत महापुराण भगवान श्रीकृष्ण का वाङ्मय स्वरूप है। कलियुग में जब समस्त साधन क्षीण हो जाते हैं, तब केवल श्रीमद्भागवत कथा का श्रवण ही जीव को परमानंद और भगवत्कृपा प्रदान करता है। गोकर्ण जी द्वारा धुंधुकारी की मुक्ति का प्रसंग इस बात का साक्षात प्रमाण है कि पापी से पापी जीव भी इस कथा के श्रवण से मुक्त हो जाता है।',
        'vedic_philosophy',
        'आचार्य पं० अश्वनी कुमार शुक्ल',
        'श्रीमद्भागवत महापुराण - पद्म पुराणोक्त माहात्म्य'
      ],
      [
        'griha-pravesh-vastu-shanti-vidhi',
        'गृह प्रवेश एवं वास्तु शांति: शास्त्रीय नियम व मुहूर्त विचार',
        'नूतन गृह में प्रवेश से पूर्व वास्तु दोष शमन, सूर्य संक्रमण एवं तिथि शुद्धि का महत्व।',
        'वास्तु शास्त्र के अनुसार भूमि और भवन पंचमहाभूतों (पृथ्वी, जल, अग्नि, वायु, आकाश) का संघात हैं। जब हम किसी भवन का निर्माण करते हैं तो जाने-अनजाने भूमि खनन और वृक्ष छेदन से वास्तु पुरुष रुष्ट होते हैं। अतः गृह प्रवेश से पूर्व वास्तु शांति, नवग्रह हवन, गौ प्रवेश और मंगल कलश स्थापन अति आवश्यक है।',
        'karmakanda_sanskar',
        'आचार्य पं० अश्वनी कुमार शुक्ल',
        'बृहत्संहिता, वास्तुराजवल्लभ एवं निर्णयसिंधु'
      ]
    ];

    const stmt = db.prepare('INSERT INTO articles (slug, title, summary, content, category, author, references_text) VALUES (?, ?, ?, ?, ?, ?, ?)');
    defaultArticles.forEach(a => stmt.run(a[0], a[1], a[2], a[3], a[4], a[5], a[6]));
  }

  // Seed Initial Events if empty
  const eventsCount = db.prepare('SELECT COUNT(*) as count FROM events').all()[0].count;
  if (eventsCount === 0) {
    const defaultEvents = [
      ['श्रीमद्भागवत सप्ताह ज्ञान यज्ञ (गोरखपुर)', 'katha', '2026-11-10', '2026-11-17', 'श्री संकट मोचन धाम परिसर, तारामंडल, गोरखपुर', 'https://www.youtube.com/embed/live_stream?channel=UCvW_Gj_y020W8f4X9y-0cDA', 'upcoming', 'आचार्य पं० अश्वनी कुमार शुक्ल जी के श्रीमुख से दिव्य 7 दिवसीय भागवत अमृत वर्षा।'],
      ['कार्तिक पूर्णिमा महा रुद्राभिषेक एवं दीपदान', 'puja', '2026-11-24', '2026-11-24', 'राप्ती तट, राजघाट, गोरखपुर', 'https://www.youtube.com/embed/live_stream?channel=UCv9zH-a-m0sXF8979G_nO9A', 'upcoming', 'विश्व शांति एवं राष्ट्र कल्याण हेतु 11 वैदिक विप्रों द्वारा सामूहिक महारुद्राभिषेक।']
    ];

    const stmt = db.prepare('INSERT INTO events (title, event_type, start_date, end_date, venue, stream_url, stream_status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    defaultEvents.forEach(e => stmt.run(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7]));
  }

  // Seed Initial Sample Bookings if empty
  const bookingsCount = db.prepare('SELECT COUNT(*) as count FROM bookings').all()[0].count;
  if (bookingsCount === 0) {
    const defaultBookings = [
      ['AKS-2026-1001', 3, 'रुद्राभिषेक एवं महारुद्र पूजन', 'श्री विजय नारायण पाण्डेय', '9876543210', 'vijay.pandey@example.com', '2026-10-25', '09:00 - 12:00', 'local_gorakhpur', 'मकान नं 45, सिविल लाइन्स, गोरखपुर', 'कश्यप', 'परिवार के स्वास्थ्य व शांति हेतु रुद्राभिषेक', 3100, 1000, 'confirmed', 'सामग्री सूची WhatsApp पर प्रेषित।'],
      ['AKS-2026-1002', 4, 'श्री सत्यनारायण व्रत कथा एवं पूजन', 'श्री राजेश कुमार शुक्ल', '9450123456', 'rajesh.shukla@example.com', '2026-10-28', '16:00 - 18:30', 'local_gorakhpur', 'इंजीनियरिंग कॉलेज रोड, गोरखपुर', 'भारद्वाज', 'गृह में सुख-समृद्धि हेतु', 2100, 500, 'requested', 'समय पुष्टिकरण हेतु यजमान से वार्ता प्रतीक्षित।']
    ];

    const stmt = db.prepare('INSERT INTO bookings (booking_ref, service_id, service_name, client_name, client_phone, client_email, booking_date, time_slot, location_type, venue_address, gotra, sankalp_notes, dakshina_amount, advance_paid, status, admin_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    defaultBookings.forEach(b => stmt.run(b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7], b[8], b[9], b[10], b[11], b[12], b[13], b[14], b[15]));
  }

  // Seed Initial Yajman Records if empty
  const yajmanCount = db.prepare('SELECT COUNT(*) as count FROM yajmans').all()[0].count;
  if (yajmanCount === 0) {
    const defaultYajmans = [
      ['श्री विजय नारायण पाण्डेय', '9876543210', 'vijay.pandey@example.com', 'कश्यप', 'श्रीमती सुनीता पाण्डेय, आयुष पाण्डेय', 'सिविल लाइन्स, गोरखपुर', 'नियमित रुद्राभिषेक व एकादशी अनुष्ठान यजमान', 4],
      ['श्री राजेश कुमार शुक्ल', '9450123456', 'rajesh.shukla@example.com', 'भारद्वाज', 'श्रीमती नीलम शुक्ल, अनुराग शुक्ल', 'इंजीनियरिंग कॉलेज रोड, गोरखपुर', 'सत्यनारायण कथा एवं नवग्रह पूजन यजमान', 2]
    ];

    const stmt = db.prepare('INSERT INTO yajmans (name, phone, email, gotra, family_members, address, notes, total_rituals) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    defaultYajmans.forEach(y => stmt.run(y[0], y[1], y[2], y[3], y[4], y[5], y[6], y[7]));
  }

  // Seed Initial Moderated Prayers
  const prayerCount = db.prepare('SELECT COUNT(*) as count FROM prayers').all()[0].count;
  if (prayerCount === 0) {
    const defaultPrayers = [
      ['रमेश चंद्र त्रिपाठी', 'गोरखपुर', 'आचार्य जी के मार्गदर्शन से हमारे गृह प्रवेश का अनुष्ठान अत्यंत शुभता से संपन्न हुआ। हर हर महादेव।', 1],
      ['अंजली मिश्रा', 'देवरिया', 'श्रीमद्भागवत कथा सुनकर मन को असीम शांति प्राप्त हुई। पूज्य आचार्य जी को नमन।', 1]
    ];
    const stmt = db.prepare('INSERT INTO prayers (devotee_name, city, prayer_text, is_moderated) VALUES (?, ?, ?, ?)');
    defaultPrayers.forEach(p => stmt.run(p[0], p[1], p[2], p[3]));
  }
}

// ============================================================================
// 3. SECURITY & SESSION MANAGEMENT
// ============================================================================
const activeSessions = new Map(); // token -> { userId, username, role, expiresAt }

function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 Hours
  activeSessions.set(token, {
    userId: user.id,
    username: user.username,
    role: user.role,
    expiresAt
  });
  return { token, expiresAt };
}

function verifySession(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const session = activeSessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return session;
}

function logAudit(action, performedBy, details, ip) {
  try {
    const stmt = db.prepare('INSERT INTO audit_logs (action, performed_by, details, ip_address) VALUES (?, ?, ?, ?)');
    stmt.run(action, performedBy, details, ip || '127.0.0.1');
  } catch (e) {
    console.error('Audit log error:', e);
  }
}

// ============================================================================
// 4. HTTP REQUEST HELPER UTILITIES
// ============================================================================
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) { // 2MB Limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function serveStaticFile(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for client-side SPA routing
        const indexPath = path.join(__dirname, 'index.html');
        fs.readFile(indexPath, (indexErr, indexData) => {
          if (indexErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(indexData);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

// ============================================================================
// 5. MAIN ROUTER & API HANDLER
// ============================================================================
async function handleRequest(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const clientIP = req.socket.remoteAddress || '127.0.0.1';

  // --------------------------------------------------------------------------
  // API ROUTES
  // --------------------------------------------------------------------------
  if (pathname.startsWith('/api/')) {

    // HEALTH CHECK
    if (pathname === '/api/health' && method === 'GET') {
      return sendJSON(res, 200, {
        status: 'UP',
        app: 'आचार्य पं० अश्वनी कुमार शुक्ल — वैदिक एवं सनातन सेवा केंद्र',
        location: 'Gorakhpur, UP',
        phone: '7309441019',
        timestamp: new Date().toISOString()
      });
    }

    // 1. AUTHENTICATION: LOGIN
    if (pathname === '/api/auth/login' && method === 'POST') {
      try {
        const body = await parseJSONBody(req);
        const { username, password } = body;
        if (!username || !password) {
          return sendJSON(res, 400, { error: 'कृपया यूज़रनेम एवं पासवर्ड दर्ज करें।' });
        }

        const user = db.prepare('SELECT * FROM users WHERE username = ?').all(username)[0];
        if (!user) {
          logAudit('LOGIN_FAILED', username, 'User not found', clientIP);
          return sendJSON(res, 401, { error: 'अमान्य क्रेडेंशियल्स।' });
        }

        const testHash = crypto.scryptSync(password, user.salt, 64).toString('hex');
        if (testHash !== user.password_hash) {
          logAudit('LOGIN_FAILED', username, 'Incorrect password', clientIP);
          return sendJSON(res, 401, { error: 'अमान्य क्रेडेंशियल्स।' });
        }

        const session = createSession(user);
        logAudit('LOGIN_SUCCESS', username, 'Admin session established', clientIP);
        return sendJSON(res, 200, {
          message: 'सफलतापूर्वक लॉग इन हुए।',
          token: session.token,
          expiresAt: session.expiresAt,
          user: { id: user.id, username: user.username, role: user.role }
        });
      } catch (err) {
        return sendJSON(res, 500, { error: err.message });
      }
    }

    // AUTH: ME
    if (pathname === '/api/auth/me' && method === 'GET') {
      const session = verifySession(req);
      if (!session) {
        return sendJSON(res, 401, { error: 'अनधिकृत सत्र (Unauthorized).' });
      }
      return sendJSON(res, 200, { user: session });
    }

    // AUTH: LOGOUT
    if (pathname === '/api/auth/logout' && method === 'POST') {
      const authHeader = req.headers['authorization'] || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) activeSessions.delete(token);
      logAudit('LOGOUT', 'user', 'Session cleared', clientIP);
      return sendJSON(res, 200, { message: 'सफलतापूर्वक लॉग आउट हुए।' });
    }

    // 2. SITE PROFILE (ACHARYA JI'S VERIFIED DETAILS)
    if (pathname === '/api/profile' && method === 'GET') {
      const profile = db.prepare('SELECT * FROM site_profile WHERE id = 1').all()[0];
      return sendJSON(res, 200, profile);
    }

    if (pathname === '/api/profile' && method === 'PUT') {
      const session = verifySession(req);
      if (!session || session.role !== 'admin') {
        return sendJSON(res, 403, { error: 'केवल व्यवस्थापक (Admin) ही प्रोफाइल बदल सकते हैं।' });
      }
      try {
        const body = await parseJSONBody(req);
        const { acharya_name, title, location, phone, whatsapp, email, bio, qualifications, research_overview } = body;
        
        const stmt = db.prepare(`
          UPDATE site_profile 
          SET acharya_name = ?, title = ?, location = ?, phone = ?, whatsapp = ?, email = ?, bio = ?, qualifications = ?, research_overview = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = 1
        `);
        stmt.run(acharya_name, title, location, phone, whatsapp, email, bio, qualifications, research_overview);
        logAudit('PROFILE_UPDATED', session.username, 'Acharya profile details updated', clientIP);
        return sendJSON(res, 200, { message: 'प्रोफाइल सफलतापूर्वक अद्यतन की गई।' });
      } catch (err) {
        return sendJSON(res, 500, { error: err.message });
      }
    }

    // 3. SERVICES CATALOG
    if (pathname === '/api/services' && method === 'GET') {
      const services = db.prepare('SELECT * FROM services WHERE is_active = 1 ORDER BY category, id').all();
      return sendJSON(res, 200, services);
    }

    if (pathname === '/api/services' && method === 'POST') {
      const session = verifySession(req);
      if (!session || session.role !== 'admin') {
        return sendJSON(res, 403, { error: 'अनधिकृत।' });
      }
      try {
        const body = await parseJSONBody(req);
        const { category, title, description, duration_hours, dakshina_guideline } = body;
        const stmt = db.prepare('INSERT INTO services (category, title, description, duration_hours, dakshina_guideline) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(category, title, description, duration_hours || 2.0, dakshina_guideline);
        logAudit('SERVICE_ADDED', session.username, `Added service: ${title}`, clientIP);
        return sendJSON(res, 201, { message: 'सेवा सफलतापूर्वक जोड़ी गई।', id: Number(result.lastInsertRowid) });
      } catch (err) {
        return sendJSON(res, 500, { error: err.message });
      }
    }

    // 4. BOOKINGS WORKFLOW (DEVOTEE BOOKING & ADMIN MANAGEMENT)
    // Public: Devotee Create Booking with Conflict Prevention Check
    if (pathname === '/api/bookings' && method === 'POST') {
      try {
        const body = await parseJSONBody(req);
        const {
          service_id,
          service_name,
          client_name,
          client_phone,
          client_email,
          booking_date,
          time_slot,
          location_type,
          venue_address,
          gotra,
          sankalp_notes
        } = body;

        // Validation
        if (!service_name || !client_name || !client_phone || !booking_date || !time_slot || !venue_address) {
          return sendJSON(res, 400, { error: 'कृपया सेवा, नाम, मोबाइल, दिनांक, समय और स्थान अवश्य भरें।' });
        }

        // Validate 10-digit mobile
        const cleanPhone = client_phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length < 10) {
          return sendJSON(res, 400, { error: 'कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।' });
        }

        // Slot Conflict Prevention: Check for already CONFIRMED bookings on the same date and slot
        const conflict = db.prepare(`
          SELECT id, booking_ref, client_name FROM bookings 
          WHERE booking_date = ? AND time_slot = ? AND status = 'confirmed'
        `).all(booking_date, time_slot)[0];

        let initialStatus = 'requested';
        let conflictNotice = null;
        if (conflict) {
          conflictNotice = 'सूचना: इस दिनांक एवं समय पर पहले से एक अनुष्ठान स्वीकृत है। आपका अनुरोध समीक्षाधीन (Requested) दर्ज किया गया है। आचार्य जी शीघ्र संपर्क कर समय निश्चित करेंगे।';
        }

        // Generate unique reference ID
        const datePart = booking_date.replace(/-/g, '').slice(2, 6); // YYMM
        const randPart = Math.floor(1000 + Math.random() * 9000);
        const bookingRef = `AKS-${datePart}-${randPart}`;

        const stmt = db.prepare(`
          INSERT INTO bookings (
            booking_ref, service_id, service_name, client_name, client_phone, client_email,
            booking_date, time_slot, location_type, venue_address, gotra, sankalp_notes, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          bookingRef,
          service_id || null,
          service_name,
          client_name,
          cleanPhone,
          client_email || null,
          booking_date,
          time_slot,
          location_type || 'local_gorakhpur',
          venue_address,
          gotra || 'अविदित / कश्यप',
          sankalp_notes || null,
          initialStatus
        );

        // Also record/update Yajman register automatically
        try {
          const existingYajman = db.prepare('SELECT id, total_rituals FROM yajmans WHERE phone = ?').all(cleanPhone)[0];
          if (existingYajman) {
            db.prepare('UPDATE yajmans SET total_rituals = total_rituals + 1 WHERE id = ?').run(existingYajman.id);
          } else {
            db.prepare('INSERT INTO yajmans (name, phone, email, gotra, address, notes, total_rituals) VALUES (?, ?, ?, ?, ?, ?, 1)')
              .run(client_name, cleanPhone, client_email || null, gotra || null, venue_address, `प्रथम अनुष्ठान संदर्भ: ${bookingRef}`);
          }
        } catch (e) {
          console.error('Yajman auto-sync error:', e);
        }

        logAudit('BOOKING_REQUESTED', client_name, `Ref: ${bookingRef} on ${booking_date} ${time_slot}`, clientIP);

        return sendJSON(res, 201, {
          success: true,
          booking_ref: bookingRef,
          status: initialStatus,
          message: 'अनुष्ठान बुकिंग अनुरोध सफलतापूर्वक दर्ज हुआ!',
          conflictNotice
        });
      } catch (err) {
        return sendJSON(res, 500, { error: err.message });
      }
    }

    // Public: Track Booking Status by Reference
    if (pathname.startsWith('/api/bookings/track/') && method === 'GET') {
      const ref = pathname.replace('/api/bookings/track/', '').trim();
      const booking = db.prepare(`
        SELECT booking_ref, service_name, client_name, booking_date, time_slot, location_type, venue_address, status, created_at 
        FROM bookings WHERE booking_ref = ?
      `).all(ref)[0];

      if (!booking) {
        return sendJSON(res, 404, { error: 'इस संदर्भ संख्या (Booking Ref) का कोई रिकॉर्ड प्राप्त नहीं हुआ।' });
      }
      return sendJSON(res, 200, booking);
    }

    // Admin: Get All Bookings
    if (pathname === '/api/bookings' && method === 'GET') {
      const session = verifySession(req);
      if (!session || session.role !== 'admin') {
        return sendJSON(res, 403, { error: 'अनधिकृत (Unauthorized).' });
      }
      const bookings = db.prepare('SELECT * FROM bookings ORDER BY booking_date DESC, id DESC').all();
      return sendJSON(res, 200, bookings);
    }

    // Admin: Update Booking Status & Notes (with Conflict Check when Confirming)
    if (pathname.startsWith('/api/bookings/') && pathname.endsWith('/status') && method === 'PATCH') {
      const session = verifySession(req);
      if (!session || session.role !== 'admin') {
        return sendJSON(res, 403, { error: 'अनधिकृत।' });
      }
      const id = pathname.split('/')[3];
      try {
        const body = await parseJSONBody(req);
        const { status, admin_notes, booking_date, time_slot, dakshina_amount, advance_paid } = body;

        const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').all(id)[0];
        if (!booking) {
          return sendJSON(res, 404, { error: 'बुकिंग प्राप्त नहीं हुई।' });
        }

        const targetDate = booking_date || booking.booking_date;
        const targetSlot = time_slot || booking.time_slot;

        // If confirming, check conflict with other confirmed bookings
        if (status === 'confirmed') {
          const conflict = db.prepare(`
            SELECT id, booking_ref FROM bookings 
            WHERE booking_date = ? AND time_slot = ? AND status = 'confirmed' AND id != ?
          `).all(targetDate, targetSlot, id)[0];

          if (conflict) {
            return sendJSON(res, 409, {
              error: `समय विवाद (Slot Conflict): दिनांक ${targetDate} समय ${targetSlot} पर पहले से बुकिंग (${conflict.booking_ref}) स्वीकृत है। कृपया समय बदलें अथवा पहले वाले को रीशेड्यूल करें।`
            });
          }
        }

        const stmt = db.prepare(`
          UPDATE bookings 
          SET status = COALESCE(?, status),
              admin_notes = COALESCE(?, admin_notes),
              booking_date = COALESCE(?, booking_date),
              time_slot = COALESCE(?, time_slot),
              dakshina_amount = COALESCE(?, dakshina_amount),
              advance_paid = COALESCE(?, advance_paid)
          WHERE id = ?
        `);
        stmt.run(
          status ?? null,
          admin_notes ?? null,
          booking_date ?? null,
          time_slot ?? null,
          dakshina_amount ?? null,
          advance_paid ?? null,
          id
        );

        logAudit('BOOKING_STATUS_CHANGED', session.username, `Booking ${booking.booking_ref} status set to ${status}`, clientIP);
        return sendJSON(res, 200, { message: 'बुकिंग स्थिति अद्यतन की गई।' });
      } catch (err) {
        return sendJSON(res, 500, { error: err.message });
      }
    }

    // 5. YAJMAN BAHI-KHATA (PROTECTED ADMIN LEDGER)
    if (pathname === '/api/yajmans' && method === 'GET') {
      const session = verifySession(req);
      if (!session || session.role !== 'admin') {
        return sendJSON(res, 403, { error: 'अनधिकृत access।' });
      }
      const yajmans = db.prepare('SELECT * FROM yajmans ORDER BY total_rituals DESC, id DESC').all();
      return sendJSON(res, 200, yajmans);
    }

    if (pathname === '/api/yajmans' && method === 'POST') {
      const session = verifySession(req);
      if (!session || session.role !== 'admin') {
        return sendJSON(res, 403, { error: 'अनधिकृत।' });
      }
      try {
        const body = await parseJSONBody(req);
        const { name, phone, email, gotra, family_members, address, notes, total_rituals } = body;
        if (!name || !phone) {
          return sendJSON(res, 400, { error: 'यजमान का नाम एवं फोन आवश्यक है।' });
        }
        const stmt = db.prepare('INSERT INTO yajmans (name, phone, email, gotra, family_members, address, notes, total_rituals) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        const result = stmt.run(name, phone, email || null, gotra || null, family_members || null, address || null, notes || null, total_rituals || 1);
        logAudit('YAJMAN_ADDED', session.username, `Added yajman ${name} (${phone})`, clientIP);
        return sendJSON(res, 201, { message: 'यजमान रिकॉर्ड सहेजा गया।', id: Number(result.lastInsertRowid) });
      } catch (err) {
        return sendJSON(res, 500, { error: err.message });
      }
    }

    if (pathname === '/api/yajmans/export' && method === 'GET') {
      const session = verifySession(req);
      if (!session || session.role !== 'admin') {
        return sendJSON(res, 403, { error: 'अनधिकृत।' });
      }
      const yajmans = db.prepare('SELECT * FROM yajmans ORDER BY id ASC').all();
      let csv = "ID,Name,Phone,Email,Gotra,FamilyMembers,Address,TotalRituals,Notes,CreatedAt\n";
      yajmans.forEach(y => {
        const cleanNotes = (y.notes || '').replace(/"/g, '""');
        const cleanAddr = (y.address || '').replace(/"/g, '""');
        csv += `"${y.id}","${y.name}","${y.phone}","${y.email || ''}","${y.gotra || ''}","${y.family_members || ''}","${cleanAddr}",${y.total_rituals},"${cleanNotes}","${y.created_at}"\n`;
      });
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=Yajman_Bahi_Khata_${new Date().toISOString().slice(0, 10)}.csv`
      });
      return res.end(csv);
    }

    // 6. EVENTS & KATHAS
    if (pathname === '/api/events' && method === 'GET') {
      const events = db.prepare('SELECT * FROM events ORDER BY start_date DESC').all();
      return sendJSON(res, 200, events);
    }

    if (pathname === '/api/events' && method === 'POST') {
      const session = verifySession(req);
      if (!session || session.role !== 'admin') {
        return sendJSON(res, 403, { error: 'अनधिकृत।' });
      }
      try {
        const body = await parseJSONBody(req);
        const { title, event_type, start_date, end_date, venue, stream_url, stream_status, description } = body;
        const stmt = db.prepare('INSERT INTO events (title, event_type, start_date, end_date, venue, stream_url, stream_status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        const result = stmt.run(title, event_type, start_date, end_date || null, venue, stream_url || null, stream_status || 'upcoming', description || null);
        logAudit('EVENT_ADDED', session.username, `Event ${title}`, clientIP);
        return sendJSON(res, 201, { message: 'कार्यक्रम सहेजा गया।', id: Number(result.lastInsertRowid) });
      } catch (err) {
        return sendJSON(res, 500, { error: err.message });
      }
    }

    // 7. ARTICLES & KNOWLEDGE LIBRARY
    if (pathname === '/api/articles' && method === 'GET') {
      const search = parsedUrl.searchParams.get('q') || '';
      const category = parsedUrl.searchParams.get('cat') || '';
      let query = 'SELECT id, slug, title, summary, category, author, references_text, views_count, created_at FROM articles WHERE is_published = 1';
      const params = [];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      if (search) {
        query += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }
      query += ' ORDER BY id DESC';

      const articles = db.prepare(query).all(...params);
      return sendJSON(res, 200, articles);
    }

    if (pathname.startsWith('/api/articles/') && method === 'GET') {
      const slug = pathname.replace('/api/articles/', '');
      const article = db.prepare('SELECT * FROM articles WHERE slug = ? OR id = ?').all(slug, slug)[0];
      if (!article) {
        return sendJSON(res, 404, { error: 'लेख प्राप्त नहीं हुआ।' });
      }
      db.prepare('UPDATE articles SET views_count = views_count + 1 WHERE id = ?').run(article.id);
      return sendJSON(res, 200, article);
    }

    if (pathname === '/api/articles' && method === 'POST') {
      const session = verifySession(req);
      if (!session || session.role !== 'admin') {
        return sendJSON(res, 403, { error: 'अनधिकृत।' });
      }
      try {
        const body = await parseJSONBody(req);
        const { title, summary, content, category, author, references_text, slug } = body;
        const autoSlug = slug || title.toLowerCase().replace(/[^a-zA-Z0-9\u0900-\u097F]+/g, '-').slice(0, 50) + '-' + Date.now();
        const stmt = db.prepare('INSERT INTO articles (slug, title, summary, content, category, author, references_text) VALUES (?, ?, ?, ?, ?, ?, ?)');
        const result = stmt.run(autoSlug, title, summary, content, category, author || ENV.ACHARYA_NAME, references_text || null);
        logAudit('ARTICLE_PUBLISHED', session.username, `Article: ${title}`, clientIP);
        return sendJSON(res, 201, { message: 'लेख प्रकाशित हुआ।', id: Number(result.lastInsertRowid), slug: autoSlug });
      } catch (err) {
        return sendJSON(res, 500, { error: err.message });
      }
    }

    // 8. PRAYERS & COMMUNITY INTENTIONS
    if (pathname === '/api/prayers' && method === 'GET') {
      const prayers = db.prepare('SELECT id, devotee_name, city, prayer_text, created_at FROM prayers WHERE is_moderated = 1 ORDER BY id DESC LIMIT 50').all();
      return sendJSON(res, 200, prayers);
    }

    if (pathname === '/api/prayers' && method === 'POST') {
      try {
        const body = await parseJSONBody(req);
        const { devotee_name, city, prayer_text } = body;
        if (!devotee_name || !prayer_text) {
          return sendJSON(res, 400, { error: 'कृपया नाम एवं प्रार्थना संदेश लिखें।' });
        }
        // Basic anti-spam check
        if (prayer_text.length < 5 || prayer_text.length > 500) {
          return sendJSON(res, 400, { error: 'प्रार्थना संदेश 5 से 500 अक्षरों के मध्य होना चाहिए।' });
        }
        const stmt = db.prepare('INSERT INTO prayers (devotee_name, city, prayer_text, is_moderated) VALUES (?, ?, ?, 1)');
        stmt.run(devotee_name.slice(0, 60), (city || 'गोरखपुर').slice(0, 60), prayer_text);
        return sendJSON(res, 201, { message: 'आपकी प्रार्थना व मनोरथ सफलतापूर्वक साझा हुआ।' });
      } catch (err) {
        return sendJSON(res, 500, { error: err.message });
      }
    }

    // 9. DAKSHINA & DONATIONS WORKFLOW
    if (pathname === '/api/dakshina/create-order' && method === 'POST') {
      try {
        const body = await parseJSONBody(req);
        const { devotee_name, devotee_phone, amount, purpose } = body;

        if (!devotee_name || !devotee_phone || !amount || amount <= 0) {
          return sendJSON(res, 400, { error: 'कृपया नाम, फोन एवं वैध दक्षिणा राशि दर्ज करें।' });
        }

        const refNo = `DAK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const stmt = db.prepare('INSERT INTO dakshina_transactions (reference_no, devotee_name, devotee_phone, amount, purpose, status) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(refNo, devotee_name, devotee_phone, amount, purpose || 'सामान्य दक्षिणा', 'pending');

        return sendJSON(res, 201, {
          success: true,
          reference_no: refNo,
          amount,
          provider: ENV.PAYMENT_GATEWAY_PROVIDER,
          status: 'pending',
          instruction: 'ऑनलाइन गेटवे कॉन्फ़िगरेशन प्रक्रियाधीन है। आप सीधे UPI अथवा बैंक खाते में दक्षिणा प्रेषित कर सकते हैं।'
        });
      } catch (err) {
        return sendJSON(res, 500, { error: err.message });
      }
    }

    // 10. AUDIT LOGS (ADMIN ONLY)
    if (pathname === '/api/audit-logs' && method === 'GET') {
      const session = verifySession(req);
      if (!session || session.role !== 'admin') {
        return sendJSON(res, 403, { error: 'अनधिकृत।' });
      }
      const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100').all();
      return sendJSON(res, 200, logs);
    }

    // 404 for unhandled API endpoints
    return sendJSON(res, 404, { error: 'API endpoint not found' });
  }

  // --------------------------------------------------------------------------
  // STATIC ASSETS & SPA ROUTING
  // --------------------------------------------------------------------------
  let staticPath = pathname === '/' ? '/index.html' : pathname;
  let fullPath = path.join(__dirname, staticPath);

  // Security check: avoid directory traversal
  if (!fullPath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  serveStaticFile(req, res, fullPath);
}

// ============================================================================
// 6. START SERVER
// ============================================================================
initDatabase();

const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(ENV.PORT, ENV.HOST, () => {
    console.log(`=================================================================`);
    console.log(`🕉️  आचार्य पं० अश्वनी कुमार शुक्ल — वैदिक एवं सनातन सेवा केंद्र`);
    console.log(`📍  गोरखपुर, उत्तर प्रदेश (Gorakhpur, UP, India) | 📞 7309441019`);
    console.log(`🚀  Server running on http://localhost:${ENV.PORT}`);
    console.log(`🛡️  Database: SQLite WAL (${dbPath})`);
    console.log(`🔑  Admin Username: ${ENV.ADMIN_USERNAME}`);
    console.log(`=================================================================`);
  });
}

module.exports = { server, db, initDatabase, handleRequest, ENV };
