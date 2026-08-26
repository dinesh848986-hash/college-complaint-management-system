const path = require('path');
const fs = require('fs');

async function runTests() {
  console.log('--- Starting API Integration & Security Verification ---');

  // Start the server cleanly awaiting database connection
  const { startServer } = require('./src/server');
  const serverInstance = await startServer();

  const PORT = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${PORT}/api`;

  let student1Token = '';
  let student1Id = '';
  let student2Token = '';
  let student2Id = '';
  let complaint1Id = '';
  let complaint2Id = '';

  try {
    // 1. Health check
    console.log('\n[TEST 1] GET /api/health');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log('Health Response:', healthData);
    if (healthData.status !== 'healthy') throw new Error('Health check failed');
    console.log('✓ Health check passed');

    // 2. Register Student 1
    console.log('\n[TEST 2] POST /api/auth/register (Student 1)');
    const reg1Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Johnson',
        email: `alice.${Date.now()}@campus.edu`,
        password: 'password123',
        studentId: '2024CS001',
        department: 'Computer Science & Engineering',
        phone: '555-0101',
      }),
    });
    const reg1Data = await reg1Res.json();
    console.log('Register 1:', { success: reg1Data.success, email: reg1Data.user?.email });
    if (!reg1Data.success || !reg1Data.token) {
      throw new Error(`Student 1 registration failed: ${reg1Data.message}`);
    }
    student1Token = reg1Data.token;
    student1Id = reg1Data.user.id;
    console.log('✓ Student 1 registered & token generated');

    // 3. Register Student 2
    console.log('\n[TEST 3] POST /api/auth/register (Student 2)');
    const reg2Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Smith',
        email: `bob.${Date.now()}@campus.edu`,
        password: 'password123',
        studentId: '2024ME045',
        department: 'Mechanical Engineering',
      }),
    });
    const reg2Data = await reg2Res.json();
    if (!reg2Data.success || !reg2Data.token) {
      throw new Error(`Student 2 registration failed: ${reg2Data.message}`);
    }
    student2Token = reg2Data.token;
    student2Id = reg2Data.user.id;
    console.log('✓ Student 2 registered');

    // 4. Verify GET /api/auth/me for Student 1
    console.log('\n[TEST 4] GET /api/auth/me (Student 1 Profile)');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const meData = await meRes.json();
    console.log('Profile:', { id: meData.user?.id, name: meData.user?.name, role: meData.user?.role });
    if (!meData.success || meData.user.id !== student1Id) {
      throw new Error('GetMe returned unexpected user data');
    }
    console.log('✓ Profile retrieved successfully with JWT');

    // 5. Create Complaint with Attachment (Student 1)
    console.log('\n[TEST 5] POST /api/complaints (Student 1 with file)');
    const testFilePath = path.join(__dirname, 'test-evidence.png');
    // Write 1x1 PNG dummy buffer
    const dummyPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    fs.writeFileSync(testFilePath, dummyPng);

    const formData = new FormData();
    formData.append('title', 'Broken air conditioner in Lab 201');
    formData.append('category', 'Laboratory');
    formData.append('location', 'Tech Building, 2nd Floor, Lab 201');
    formData.append('priority', 'High');
    formData.append('description', 'The main AC unit in Lab 201 is making loud rattling noises and leaking water onto the floor.');
    
    const fileBlob = new Blob([fs.readFileSync(testFilePath)], { type: 'image/png' });
    formData.append('attachment', fileBlob, 'ac-leak-report.png');

    const complaint1Res = await fetch(`${baseUrl}/complaints`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
      body: formData,
    });
    const complaint1Data = await complaint1Res.json();
    console.log('Complaint 1 creation:', {
      success: complaint1Data.success,
      id: complaint1Data.complaint?._id,
      status: complaint1Data.complaint?.status,
      category: complaint1Data.complaint?.category,
      attachment: complaint1Data.complaint?.attachment?.filename,
    });

    if (!complaint1Data.success || !complaint1Data.complaint) {
      throw new Error(`Complaint 1 creation failed: ${complaint1Data.message}`);
    }
    complaint1Id = complaint1Data.complaint._id;
    console.log('✓ Complaint 1 created with attachment');

    // 6. Create Complaint for Student 2
    console.log('\n[TEST 6] POST /api/complaints (Student 2)');
    const formData2 = new FormData();
    formData2.append('title', 'Weak Wi-Fi signal in Hostel Block B');
    formData2.append('category', 'Wi-Fi');
    formData2.append('location', 'Hostel Block B, 3rd Floor corridors');
    formData2.append('priority', 'Medium');
    formData2.append('description', 'Wi-Fi disconnects frequently during evening study hours.');

    const complaint2Res = await fetch(`${baseUrl}/complaints`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student2Token}` },
      body: formData2,
    });
    const complaint2Data = await complaint2Res.json();
    if (!complaint2Data.success) throw new Error('Complaint 2 creation failed');
    complaint2Id = complaint2Data.complaint._id;
    console.log('✓ Complaint 2 created for Student 2');

    // 7. GET /api/complaints for Student 1 (Strict Ownership Verification)
    console.log('\n[TEST 7] GET /api/complaints (Student 1 should ONLY see their complaints)');
    const listRes = await fetch(`${baseUrl}/complaints`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const listData = await listRes.json();
    console.log(`Student 1 complaints count: ${listData.count}`);
    const student1OwnsAll = listData.complaints.every(
      (c) => c.student._id === student1Id || c.student === student1Id
    );
    if (!student1OwnsAll) {
      throw new Error('Data leak! Student 1 can see other students complaints');
    }
    const hasStudent2Complaint = listData.complaints.some((c) => c._id === complaint2Id);
    if (hasStudent2Complaint) {
      throw new Error('Security Breach: Student 1 received Student 2 complaint in list');
    }
    console.log('✓ Strict ownership verified: Student 1 only received their own complaints');

    // 8. GET /api/complaints/:id for Student 1 accessing their own complaint
    console.log('\n[TEST 8] GET /api/complaints/:id (Access own complaint)');
    const getOwnRes = await fetch(`${baseUrl}/complaints/${complaint1Id}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const getOwnData = await getOwnRes.json();
    if (!getOwnData.success || getOwnData.complaint._id !== complaint1Id) {
      throw new Error('Failed to fetch own complaint details');
    }
    console.log('✓ Student 1 successfully accessed their own complaint details');

    // 9. Cross-access security test: Student 1 tries to fetch Student 2 complaint
    console.log('\n[TEST 9] Security Barrier: Student 1 attempts to fetch Student 2 complaint');
    const forbiddenRes = await fetch(`${baseUrl}/complaints/${complaint2Id}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    console.log(`Response status: ${forbiddenRes.status} (Expected 403 Forbidden)`);
    if (forbiddenRes.status !== 403) {
      throw new Error(`Security Failure: Expected 403 Forbidden, got ${forbiddenRes.status}`);
    }
    console.log('✓ Security Verified: Cross-student access correctly forbidden (403)');

    // 10. Unauthenticated access test
    console.log('\n[TEST 10] Security Barrier: Unauthenticated request to /api/complaints');
    const unauthRes = await fetch(`${baseUrl}/complaints`);
    console.log(`Response status: ${unauthRes.status} (Expected 401 Unauthorized)`);
    if (unauthRes.status !== 401) {
      throw new Error(`Security Failure: Expected 401 Unauthorized, got ${unauthRes.status}`);
    }
    console.log('✓ Security Verified: Unauthenticated requests rejected (401)');

    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    console.log('\n=============================================');
    console.log('🎉 ALL 10 TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('=============================================');
    serverInstance.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    if (serverInstance) serverInstance.close();
    process.exit(1);
  }
}

runTests();
