const User = require('../models/User');
const Complaint = require('../models/Complaint');

const seedDemoData = async () => {
  try {
    // Seed default student
    const demoEmail = 'student@campus.edu';
    let demoUser = await User.findOne({ email: demoEmail }).select('+password');

    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex Rivera (Demo Student)',
        email: demoEmail,
        password: 'student123',
        role: 'student',
        studentId: 'CS2024-001',
        department: 'Computer Science & Engineering',
        phone: '555-0199',
      });
      console.log(`[Seed] Demo student account created: ${demoEmail} / student123`);
    } else {
      const matches = await demoUser.comparePassword('student123');
      if (!matches) {
        demoUser.password = 'student123';
        await demoUser.save();
        console.log(`[Seed] Demo student password synchronized to student123`);
      }
    }

    // Seed default administrator
    const adminEmail = 'admin@campus.edu';
    let adminUser = await User.findOne({ email: adminEmail }).select('+password');

    if (!adminUser) {
      adminUser = await User.create({
        name: 'Campus Administrator',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        studentId: 'ADMIN-01',
        department: 'Administration',
        phone: '555-0100',
      });
      console.log(`[Seed] Demo admin account created: ${adminEmail} / admin123`);
    } else {
      const adminMatches = await adminUser.comparePassword('admin123');
      if (!adminMatches || adminUser.role !== 'admin') {
        adminUser.password = 'admin123';
        adminUser.role = 'admin';
        await adminUser.save();
        console.log(`[Seed] Demo admin account updated and synchronized: ${adminEmail}`);
      }
    }

    // Seed sample complaints for the demo student if none exist
    const complaintCount = await Complaint.countDocuments({ student: demoUser._id });
    if (complaintCount === 0) {
      await Complaint.create([
        {
          student: demoUser._id,
          title: 'Library Wi-Fi Connectivity Drops Frequently',
          description: 'The Wi-Fi in the 2nd floor silent study room keeps disconnecting every 10-15 minutes.',
          category: 'Wi-Fi',
          location: 'Central Library, 2nd Floor',
          priority: 'Medium',
          status: 'In Progress',
          statusHistory: [
            {
              status: 'Submitted',
              changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              comment: 'Complaint submitted by student',
            },
            {
              status: 'Under Review',
              changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              comment: 'Reviewed by IT admin',
            },
            {
              status: 'In Progress',
              changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              comment: 'Technician dispatched to check access points',
            },
          ],
          assignedTo: 'Campus IT Helpdesk',
          assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          student: demoUser._id,
          title: 'Projector Bulb Flickering in Lab 304',
          description: 'The overhead projector in Computer Lab 304 flickers and turns off during lectures.',
          category: 'Laboratory',
          location: 'Academic Block B, Room 304',
          priority: 'High',
          status: 'Under Review',
          statusHistory: [
            {
              status: 'Submitted',
              changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              comment: 'Complaint submitted by student',
            },
            {
              status: 'Under Review',
              changedAt: new Date(),
              comment: 'Facilities team notified for bulb replacement',
            },
          ],
        },
      ]);
      console.log('[Seed] Demo student sample complaints seeded');
    }
  } catch (error) {
    console.error('[Seed] Error seeding demo data:', error.message);
  }
};

module.exports = { seedDemoData };
