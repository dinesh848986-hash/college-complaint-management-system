// Automated integration test for Backend Phase 1 (Admin & Lifecycle APIs)
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('====================================================');
  console.log('  BACKEND PHASE 1 INTEGRATION & SECURITY TEST SUITE  ');
  console.log('====================================================\n');

  let studentToken = '';
  let studentId = '';
  let adminToken = '';
  let createdComplaintId = '';

  try {
    // 1. Health check
    console.log('[TEST 1] Checking API Health...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    if (healthData.status !== 'healthy') throw new Error('API is not healthy');
    console.log('  ✓ API Health check passed.\n');

    // 2. Student Authentication
    console.log('[TEST 2] Testing Student Authentication (student@campus.edu)...');
    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@campus.edu',
        password: 'student123',
      }),
    });
    const studentLoginData = await studentLoginRes.json();
    if (!studentLoginData.success || !studentLoginData.token) {
      throw new Error(`Student login failed: ${JSON.stringify(studentLoginData)}`);
    }
    studentToken = studentLoginData.token;
    studentId = studentLoginData.user.id;
    console.log(`  ✓ Student authenticated successfully. User: ${studentLoginData.user.name} (${studentLoginData.user.role})\n`);

    // 3. Student Complaint Creation
    console.log('[TEST 3] Testing Student Complaint Creation...');
    const newComplaintRes = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Broken AC Unit in Room 204',
        description: 'The ceiling air conditioner is making loud noises and leaking water.',
        category: 'Classroom',
        location: 'Science Block, Room 204',
        priority: 'High',
      }),
    });
    const newComplaintData = await newComplaintRes.json();
    if (!newComplaintData.success || !newComplaintData.complaint?._id) {
      throw new Error(`Complaint creation failed: ${JSON.stringify(newComplaintData)}`);
    }
    createdComplaintId = newComplaintData.complaint._id;
    console.log(`  ✓ Complaint created successfully: ID=${createdComplaintId}, Status=${newComplaintData.complaint.status}\n`);

    // 4. Student Complaint Viewing (Student Isolation)
    console.log('[TEST 4] Testing Student Complaint Viewing (GET /api/complaints)...');
    const studentComplaintsRes = await fetch(`${BASE_URL}/complaints`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentComplaintsData = await studentComplaintsRes.json();
    if (!studentComplaintsData.success || !Array.isArray(studentComplaintsData.complaints)) {
      throw new Error(`Student complaint retrieval failed: ${JSON.stringify(studentComplaintsData)}`);
    }
    const foundCreated = studentComplaintsData.complaints.some((c) => c._id === createdComplaintId);
    if (!foundCreated) throw new Error('Created complaint not found in student list');
    console.log(`  ✓ Student complaint viewing passed. Found ${studentComplaintsData.count} complaints for student.\n`);

    // 5. Admin Authentication
    console.log('[TEST 5] Testing Admin Authentication (admin@campus.edu)...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@campus.edu',
        password: 'admin123',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginData.success || !adminLoginData.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);
    }
    adminToken = adminLoginData.token;
    if (adminLoginData.user.role !== 'admin') {
      throw new Error(`Expected admin role, got: ${adminLoginData.user.role}`);
    }
    console.log(`  ✓ Admin authenticated successfully: ${adminLoginData.user.name} (${adminLoginData.user.role})\n`);

    // 6. Security Check: Normal Student Attempting Admin Endpoints
    console.log('[TEST 6] Verifying Security: Student accessing Admin Endpoints (Must be 403)...');
    const unauthorizedAdminQueueRes = await fetch(`${BASE_URL}/complaints/admin`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    if (unauthorizedAdminQueueRes.status !== 403) {
      throw new Error(`Expected 403 for student accessing /api/complaints/admin, got ${unauthorizedAdminQueueRes.status}`);
    }
    console.log('  ✓ GET /api/complaints/admin correctly rejected student with 403 Forbidden.');

    const unauthorizedPatchRes = await fetch(`${BASE_URL}/complaints/${createdComplaintId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ status: 'In Progress' }),
    });
    if (unauthorizedPatchRes.status !== 403) {
      throw new Error(`Expected 403 for student PATCHing complaint, got ${unauthorizedPatchRes.status}`);
    }
    console.log('  ✓ PATCH /api/complaints/:id correctly rejected student with 403 Forbidden.\n');

    // 7. Admin Complaint Retrieval (Global Queue across all students)
    console.log('[TEST 7] Testing Admin Complaint Retrieval (GET /api/complaints/admin)...');
    const adminComplaintsRes = await fetch(`${BASE_URL}/complaints/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminComplaintsData = await adminComplaintsRes.json();
    if (!adminComplaintsData.success || !Array.isArray(adminComplaintsData.complaints)) {
      throw new Error(`Admin complaint retrieval failed: ${JSON.stringify(adminComplaintsData)}`);
    }
    console.log(`  ✓ Admin retrieved all complaints: Total=${adminComplaintsData.count}.`);

    // Test filter by category
    const classroomFilterRes = await fetch(`${BASE_URL}/complaints/admin?category=Classroom`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const classroomData = await classroomFilterRes.json();
    if (!classroomData.success || classroomData.count === 0) {
      throw new Error('Category filter failed on admin queue');
    }
    console.log(`  ✓ Filter by category="Classroom" passed (${classroomData.count} found).\n`);

    // 8. Admin Status Update: Under Review
    console.log('[TEST 8] Testing Admin Status Update -> "Under Review"...');
    const statusUpdateRes1 = await fetch(`${BASE_URL}/complaints/${createdComplaintId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'Under Review',
        adminComments: 'Facilities team assigned to inspect the unit.',
      }),
    });
    const statusUpdateData1 = await statusUpdateRes1.json();
    if (!statusUpdateData1.success || statusUpdateData1.complaint.status !== 'Under Review') {
      throw new Error(`Status update failed: ${JSON.stringify(statusUpdateData1)}`);
    }
    console.log('  ✓ Status transitioned to "Under Review".\n');

    // 9. Department & Staff Assignment
    console.log('[TEST 9] Testing Department & Staff Assignment...');
    const assignRes = await fetch(`${BASE_URL}/complaints/${createdComplaintId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'Assigned',
        assignedDepartment: 'HVAC & Electrical Maintenance',
        assignedStaff: 'David Miller (Technician)',
      }),
    });
    const assignData = await assignRes.json();
    if (
      !assignData.success ||
      assignData.complaint.assignedDepartment !== 'HVAC & Electrical Maintenance' ||
      assignData.complaint.assignedStaff !== 'David Miller (Technician)' ||
      assignData.complaint.status !== 'Assigned'
    ) {
      throw new Error(`Assignment update failed: ${JSON.stringify(assignData)}`);
    }
    console.log(`  ✓ Assigned Department: "${assignData.complaint.assignedDepartment}"`);
    console.log(`  ✓ Assigned Staff: "${assignData.complaint.assignedStaff}"\n`);

    // 10. Admin Comments & In Progress
    console.log('[TEST 10] Testing Admin Comments Update & "In Progress"...');
    const inProgressRes = await fetch(`${BASE_URL}/complaints/${createdComplaintId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'In Progress',
        adminComments: 'Technician on-site fixing drainage line and cooling coil.',
      }),
    });
    const inProgressData = await inProgressRes.json();
    if (!inProgressData.success || inProgressData.complaint.status !== 'In Progress') {
      throw new Error(`In Progress update failed: ${JSON.stringify(inProgressData)}`);
    }
    console.log(`  ✓ Admin comments updated: "${inProgressData.complaint.adminComments}"\n`);

    // 11. Resolution Details & Resolved
    console.log('[TEST 11] Testing Resolution Details & "Resolved"...');
    const resolvedRes = await fetch(`${BASE_URL}/complaints/${createdComplaintId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'Resolved',
        resolutionDetails: 'Replaced clogged condensate pipe and tested AC cooling at 22°C. Operates silently now.',
      }),
    });
    const resolvedData = await resolvedRes.json();
    if (
      !resolvedData.success ||
      resolvedData.complaint.status !== 'Resolved' ||
      !resolvedData.complaint.resolutionDetails
    ) {
      throw new Error(`Resolution update failed: ${JSON.stringify(resolvedData)}`);
    }
    console.log(`  ✓ Resolution details stored: "${resolvedData.complaint.resolutionDetails}"\n`);

    // 12. Verify statusHistory Preservation
    console.log('[TEST 12] Verifying statusHistory Lifecycle Preservation...');
    const detailsRes = await fetch(`${BASE_URL}/complaints/${createdComplaintId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const detailsData = await detailsRes.json();
    const history = detailsData.complaint.statusHistory;
    console.log(`  Total History Transitions: ${history.length}`);
    history.forEach((h, idx) => {
      console.log(`    [${idx + 1}] ${h.status} at ${h.changedAt} -> "${h.comment || ''}"`);
    });
    if (history.length < 5) {
      throw new Error(`Expected at least 5 status history entries, found: ${history.length}`);
    }
    console.log('  ✓ statusHistory successfully preserved and sequenced.\n');

    // 13. Safe Deletion Tests
    console.log('[TEST 13] Testing Safe Deletion Controls...');
    // Create a throwaway complaint to test student deletion
    const throwawayRes = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Temporary Draft Grievance',
        description: 'Created to test cancellation/deletion',
        category: 'Other',
        location: 'Quad',
      }),
    });
    const throwawayData = await throwawayRes.json();
    const throwawayId = throwawayData.complaint._id;

    // Student cancels own 'Submitted' complaint
    const deleteStudentOwnRes = await fetch(`${BASE_URL}/complaints/${throwawayId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const deleteStudentOwnData = await deleteStudentOwnRes.json();
    if (!deleteStudentOwnData.success) {
      throw new Error(`Student deletion of own submitted complaint failed: ${JSON.stringify(deleteStudentOwnData)}`);
    }
    console.log('  ✓ Student successfully deleted own "Submitted" complaint.');

    // Student trying to delete a 'Resolved' complaint should be rejected
    const deleteResolvedByStudent = await fetch(`${BASE_URL}/complaints/${createdComplaintId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    if (deleteResolvedByStudent.status !== 400) {
      throw new Error(`Expected 400 for student deleting non-submitted complaint, got ${deleteResolvedByStudent.status}`);
    }
    console.log('  ✓ Student correctly blocked from deleting "Resolved" complaint.');

    // Admin can delete any complaint
    const deleteByAdminRes = await fetch(`${BASE_URL}/complaints/${createdComplaintId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteByAdminData = await deleteByAdminRes.json();
    if (!deleteByAdminData.success) {
      throw new Error(`Admin deletion failed: ${JSON.stringify(deleteByAdminData)}`);
    }
    console.log('  ✓ Administrator successfully performed complaint cleanup.\n');

    console.log('====================================================');
    console.log('  ALL 13 TESTS PASSED SUCCESSFULLY!                 ');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
