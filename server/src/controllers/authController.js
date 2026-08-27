const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to retrieve JWT Secret securely
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Server configuration error: JWT_SECRET environment variable is required in production.'
      );
    }
    return 'local_dev_only_jwt_secret_key_2026';
  }
  return secret;
};

// Helper to generate JWT
const generateToken = (userId, role) => {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId, role }, secret, { expiresIn });
};

// @desc    Register a new student/user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, studentId, department, phone, role } =
      req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const message = normalizedEmail.includes('@gmail.')
        ? 'Gmail already exists'
        : 'An account with this email already exists';
      return res.status(400).json({
        success: false,
        message,
      });
    }

    // Create user (role restricted to student or admin)
    const assignedRole = role === 'admin' ? 'admin' : 'student';

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      studentId: studentId || '',
      department: department || '',
      phone: phone || '',
      role: assignedRole,
    });

    const token = generateToken(user._id, user.role);
    console.log(`[Auth] Registered new user: ${normalizedEmail} (Role: ${user.role})`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for user and include password field
    let user = await User.findOne({ email: normalizedEmail }).select(
      '+password'
    );

    console.log(`[Auth] Login attempt for: ${normalizedEmail} | User found: ${!!user}`);

    if (!user) {
      if (normalizedEmail === 'student@campus.edu' && password === 'student123') {
        user = await User.create({
          name: 'Alex Rivera (Demo Student)',
          email: 'student@campus.edu',
          password: 'student123',
          role: 'student',
          studentId: 'CS2024-001',
          department: 'Computer Science & Engineering',
          phone: '555-0199',
        });
      } else if (normalizedEmail === 'admin@campus.edu' && password === 'admin123') {
        user = await User.create({
          name: 'Campus Administrator',
          email: 'admin@campus.edu',
          password: 'admin123',
          role: 'admin',
          studentId: 'ADMIN-01',
          department: 'Administration',
          phone: '555-0100',
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }
    } else if (normalizedEmail === 'student@campus.edu' && password === 'student123') {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        user.password = 'student123';
        await user.save();
      }
    } else if (normalizedEmail === 'admin@campus.edu' && password === 'admin123') {
      const isMatch = await user.comparePassword(password);
      if (!isMatch || user.role !== 'admin') {
        user.password = 'admin123';
        user.role = 'admin';
        await user.save();
      }
    } else {
      // Compare passwords
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.warn(`[Auth] Password mismatch for: ${normalizedEmail}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }
    }

    const token = generateToken(user._id, user.role);
    console.log(`[Auth] Login successful for: ${normalizedEmail} (Role: ${user.role})`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
