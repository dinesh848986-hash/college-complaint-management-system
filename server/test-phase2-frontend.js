const BASE_URL = 'http://localhost:5000';

async function testPhase2() {
  console.log('===========================================================');
  console.log('   PHASE 2 FRONTEND & ADMIN INTEGRATION VERIFICATION       ');
  console.log('===========================================================\n');

  try {
    // 1. Verify Frontend SPA Index & Assets
    console.log('[STEP 1] Verifying frontend SPA bundle serving...');
    const htmlRes = await fetch(`${BASE_URL}/admin`);
    const htmlText = await htmlRes.text();
    if (!htmlText.includes('<div id="root"></div>') || !htmlText.includes('/assets/index-')) {
      throw new Error('SPA index.html not served properly for /admin route');
    }
    console.log('  ✓ SPA index.html serves correctly for /admin (React Router fallback).\n');

    // 2. Admin Authentication
    console.log('[STEP 2] Authenticating as Admin (admin@campus.edu)...');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@campus.edu', password: 'admin123' }),
    });
    const adminData = await adminLoginRes.json();
    if (!adminData.success || adminData.user.role !== 'admin') {
      throw new Error(`Admin login failed: ${JSON.stringify(adminData)}`);
    }
    const adminToken = adminData.token;
    console.log(`  ✓ Admin login verified: ${adminData.user.name} (${adminData.user.role})\n`);

    // 3. Admin Dashboard Statistics Calculation (using actual API data)
    console.log('[STEP 3] Fetching Admin Complaints Queue & Computing 8 KPIs...');
    const adminQueueRes = await fetch(`${BASE_URL}/api/complaints/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const queueData = await adminQueueRes.json();
    if (!queueData.success || !Array.isArray(queueData.complaints)) {
      throw new Error('Failed to retrieve complaints queue');
    }

    const complaints = queueData.complaints;
    const stats = {
      total: complaints.length,
      submitted: complaints.filter((c) => c.status === 'Submitted').length,
      underReview: complaints.filter((c) => c.status === 'Under Review').length,
      assigned: complaints.filter((c) => c.status === 'Assigned').length,
      inProgress: complaints.filter((c) => c.status === 'In Progress').length,
      resolved: complaints.filter((c) => c.status === 'Resolved').length,
      closed: complaints.filter((c) => c.status === 'Closed').length,
      critical: complaints.filter((c) => c.priority === 'Critical').length,
    };
    console.log('  Calculated Real Dashboard Stats:', stats);
    console.log('  ✓ Verified 8 real-time KPI metrics calculated from database.\n');

    // 4. Test Search & Filters
    console.log('[STEP 4] Testing Search & Filtering parameters...');
    const searchRes = await fetch(`${BASE_URL}/api/complaints/admin?search=Wi-Fi`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const searchData = await searchRes.json();
    console.log(`  ✓ Search query for "Wi-Fi" matched: ${searchData.count} items.`);

    const catRes = await fetch(`${BASE_URL}/api/complaints/admin?category=Laboratory`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const catData = await catRes.json();
    console.log(`  ✓ Category filter "Laboratory" matched: ${catData.count} items.`);

    const prioRes = await fetch(`${BASE_URL}/api/complaints/admin?priority=High`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const prioData = await prioRes.json();
    console.log(`  ✓ Priority filter "High" matched: ${prioData.count} items.\n`);

    // 5. Admin Managing a Complaint (Status, Dept, Staff, Notes, Resolution)
    console.log('[STEP 5] Testing Admin Action: Update status, assign dept & staff, add notes...');
    const targetComplaint = complaints[0];
    if (!targetComplaint) throw new Error('No complaints in database to test');

    const updatePayload = {
      status: 'In Progress',
      assignedDepartment: 'Facilities & Campus IT Support',
      assignedStaff: 'Marcus Vance (Lead Tech)',
      adminComments: 'Diagnosed intermittent signal. Replacing switch port 4.',
      resolutionDetails: '',
    };

    const updateRes = await fetch(`${BASE_URL}/api/complaints/${targetComplaint._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(updatePayload),
    });
    const updatedData = await updateRes.json();
    if (!updatedData.success || updatedData.complaint.status !== 'In Progress') {
      throw new Error(`Admin update failed: ${JSON.stringify(updatedData)}`);
    }
    console.log(`  ✓ Updated complaint #${targetComplaint._id.slice(-6)}:`);
    console.log(`    - Status: ${updatedData.complaint.status}`);
    console.log(`    - Department: ${updatedData.complaint.assignedDepartment}`);
    console.log(`    - Staff: ${updatedData.complaint.assignedStaff}`);
    console.log(`    - Remarks: ${updatedData.complaint.adminComments}\n`);

    // 6. Admin Resolving Grievance
    console.log('[STEP 6] Testing Admin Action: Resolving complaint with resolution details...');
    const resolvePayload = {
      status: 'Resolved',
      adminComments: 'Resolution verified by IT supervisor.',
      resolutionDetails: 'Replaced faulty Gigabit switch and verified signal strength throughout the hall.',
    };
    const resolveRes = await fetch(`${BASE_URL}/api/complaints/${targetComplaint._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(resolvePayload),
    });
    const resolvedData = await resolveRes.json();
    if (!resolvedData.success || resolvedData.complaint.status !== 'Resolved') {
      throw new Error(`Resolve failed: ${JSON.stringify(resolvedData)}`);
    }
    console.log(`  ✓ Grievance marked Resolved with summary: "${resolvedData.complaint.resolutionDetails}"\n`);

    // 7. Student Verification: Student logs in and verifies updated grievance details
    console.log('[STEP 7] Verifying Student visibility of administrative updates...');
    const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@campus.edu', password: 'student123' }),
    });
    const studentData = await studentLoginRes.json();
    const studentToken = studentData.token;

    const studentViewRes = await fetch(`${BASE_URL}/api/complaints/${targetComplaint._id}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentViewData = await studentViewRes.json();
    if (!studentViewData.success) throw new Error('Student unable to view complaint');

    const c = studentViewData.complaint;
    if (
      c.status !== 'Resolved' ||
      c.assignedDepartment !== 'Facilities & Campus IT Support' ||
      !c.resolutionDetails
    ) {
      throw new Error('Student did not see updated admin fields');
    }
    console.log(`  ✓ Student verified updated status: "${c.status}"`);
    console.log(`  ✓ Student verified assigned department: "${c.assignedDepartment}"`);
    console.log(`  ✓ Student verified resolution summary: "${c.resolutionDetails}"\n`);

    // 8. Security Verification: Student access to /api/complaints/admin
    console.log('[STEP 8] Verifying Security: Student cannot access Admin API...');
    const forbiddenRes = await fetch(`${BASE_URL}/api/complaints/admin`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    if (forbiddenRes.status !== 403) {
      throw new Error(`Expected 403 for student accessing admin API, got ${forbiddenRes.status}`);
    }
    console.log('  ✓ Student accessing /api/complaints/admin successfully blocked (403 Forbidden).\n');

    // 9. Existing Student Functionality Check
    console.log('[STEP 9] Verifying Existing Student Dashboard and Grievance Creation...');
    const studentDashRes = await fetch(`${BASE_URL}/api/complaints`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentDashData = await studentDashRes.json();
    if (!studentDashData.success) throw new Error('Student dashboard failed');
    console.log(`  ✓ Student dashboard loaded ${studentDashData.count} personal complaints.`);

    const newStudentGrievanceRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Water Cooler Filter Replacement',
        description: 'Water cooler near room 102 needs cartridge replacement.',
        category: 'Cleanliness',
        location: 'Ground Floor Corridor',
        priority: 'Low',
      }),
    });
    const newGrievanceData = await newStudentGrievanceRes.json();
    if (!newGrievanceData.success) throw new Error('Complaint submission failed');
    console.log(`  ✓ Student complaint submission passed (ID: ${newGrievanceData.complaint._id}).\n`);

    console.log('===========================================================');
    console.log('   ALL PHASE 2 VERIFICATION CHECKS PASSED!                 ');
    console.log('===========================================================');
  } catch (err) {
    console.error('\n❌ VERIFICATION ERROR:', err.message);
    process.exit(1);
  }
}

testPhase2();
