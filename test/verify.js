/**
 * Comprehensive Automated Test Suite
 * आचार्य पं० अश्वनी कुमार शुक्ल — वैदिक एवं सनातन सेवा केंद्र (Gorakhpur)
 */

const http = require('node:http');
const assert = require('node:assert');
const { server, db } = require('../server');

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3000${path}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🕉️ Starting Comprehensive Test Suite for Acharya Pt. Ashwani Kumar Shukla Platform...\n');

  try {
    // TEST 1: Health check endpoint
    console.log('Test 1: Health Check...');
    const health = await makeRequest('/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.body.status, 'UP');
    assert.strictEqual(health.body.phone, '7309441019');
    console.log('✅ Passed: Health check OK.\n');

    // TEST 2: Profile Retrieval (Acharya Ji verified details)
    console.log('Test 2: Acharya Profile...');
    const profile = await makeRequest('/api/profile');
    assert.strictEqual(profile.status, 200);
    assert.strictEqual(profile.body.phone, '7309441019');
    assert.ok(profile.body.acharya_name.includes('अश्वनी'));
    assert.ok(profile.body.location.includes('गोरखपुर'));
    console.log(`✅ Passed: Profile verified for ${profile.body.acharya_name} (${profile.body.location}).\n`);

    // TEST 3: Admin Authentication & Security
    console.log('Test 3: Admin Authentication...');
    // Invalid credentials
    const badLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'WrongPassword' }
    });
    assert.strictEqual(badLogin.status, 401);

    // Valid credentials
    const goodLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'Acharya@Gorakhpur2026' }
    });
    assert.strictEqual(goodLogin.status, 200);
    assert.ok(goodLogin.body.token);
    const adminToken = goodLogin.body.token;
    console.log('✅ Passed: Admin authentication & session security verified.\n');

    // TEST 4: Protected Route Access Control
    console.log('Test 4: Protected Route Protection (Yajmans)...');
    // Without token -> 403
    const unauthYajmans = await makeRequest('/api/yajmans');
    assert.strictEqual(unauthYajmans.status, 403);

    // With token -> 200
    const authYajmans = await makeRequest('/api/yajmans', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(authYajmans.status, 200);
    assert.ok(Array.isArray(authYajmans.body));
    console.log(`✅ Passed: Protected Yajman Bahi-Khata inaccessible without token, accessible with token (${authYajmans.body.length} records).\n`);

    // TEST 5: Public Devotee Booking Submission & Reference Generation
    console.log('Test 5: Devotee Booking Submission...');
    const bookingPayload = {
      service_name: 'रुद्राभिषेक एवं महारुद्र पूजन',
      client_name: 'परीक्षण यजमान (Test Devotee)',
      client_phone: '9876543210',
      client_email: 'test@example.com',
      booking_date: '2026-11-20',
      time_slot: '08:00 - 11:00',
      location_type: 'local_gorakhpur',
      venue_address: 'गोरखपुर विश्वविद्यालय मार्ग, गोरखपुर',
      gotra: 'भारद्वाज',
      sankalp_notes: 'सुख समृद्धि व शांति हेतु'
    };

    const newBooking = await makeRequest('/api/bookings', {
      method: 'POST',
      body: bookingPayload
    });
    assert.strictEqual(newBooking.status, 201);
    assert.ok(newBooking.body.booking_ref.startsWith('AKS-'));
    const testBookingRef = newBooking.body.booking_ref;
    console.log(`✅ Passed: Booking created with reference ${testBookingRef}.\n`);

    // TEST 6: Booking Tracking by Reference ID
    console.log('Test 6: Booking Tracking by Reference...');
    const trackRes = await makeRequest(`/api/bookings/track/${testBookingRef}`);
    assert.strictEqual(trackRes.status, 200);
    assert.strictEqual(trackRes.body.client_name, 'परीक्षण यजमान (Test Devotee)');
    console.log(`✅ Passed: Public tracking verified for ${testBookingRef}.\n`);

    // TEST 7: Slot Conflict Detection
    console.log('Test 7: Slot Conflict Detection on Confirmation...');
    // Find booking ID in DB
    const bookingRow = db.prepare('SELECT id FROM bookings WHERE booking_ref = ?').all(testBookingRef)[0];
    assert.ok(bookingRow);

    // First confirm it
    const confirmRes = await makeRequest(`/api/bookings/${bookingRow.id}/status`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: { status: 'confirmed' }
    });
    assert.strictEqual(confirmRes.status, 200);

    // Now try to create another booking on the SAME date & slot
    const secondBooking = await makeRequest('/api/bookings', {
      method: 'POST',
      body: {
        ...bookingPayload,
        client_name: 'दूसरा यजमान (Second Devotee)',
        client_phone: '9123456789'
      }
    });
    assert.strictEqual(secondBooking.status, 201);
    assert.ok(secondBooking.body.conflictNotice); // Server returned conflict notice!

    // Try to confirm second booking on the same slot -> Must return 409 Conflict
    const secondRow = db.prepare('SELECT id FROM bookings WHERE booking_ref = ?').all(secondBooking.body.booking_ref)[0];
    const conflictConfirm = await makeRequest(`/api/bookings/${secondRow.id}/status`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: { status: 'confirmed' }
    });
    assert.strictEqual(conflictConfirm.status, 409);
    console.log(`✅ Passed: Slot conflict detected correctly (HTTP 409 returned).\n`);

    // TEST 8: Audit Logging
    console.log('Test 8: Audit Logs Check...');
    const auditLogs = await makeRequest('/api/audit-logs', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(auditLogs.status, 200);
    assert.ok(auditLogs.body.length > 0);
    console.log(`✅ Passed: Audit log generated ${auditLogs.body.length} security events.\n`);

    // TEST 9: Static SPA Serving (index.html, app.js)
    console.log('Test 9: Static Asset Delivery...');
    const indexReq = await makeRequest('/');
    assert.strictEqual(indexReq.status, 200);
    assert.ok(indexReq.body.includes('आचार्य पं० अश्वनी कुमार शुक्ल'));

    const appReq = await makeRequest('/app.js');
    assert.strictEqual(appReq.status, 200);
    assert.ok(appReq.body.includes('VedicPanchang'));
    console.log('✅ Passed: index.html and app.js served cleanly.\n');

    console.log('🎉 ALL 9 TEST SUITES PASSED FLAWLESSLY! Platform is production-ready.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

// Start test server
server.listen(3000, '127.0.0.1', () => {
  runTests();
});
