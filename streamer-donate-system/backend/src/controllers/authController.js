const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    YouTube OAuth Callback
// @route   GET /api/auth/youtube/callback
// @access  Public
exports.youtubeCallback = async (req, res) => {
  try {
    // In production, this would handle the actual YouTube OAuth flow
    // For now, we'll simulate it with mock data
    
    const { youtubeId, displayName, avatarUrl, email, channelTitle, profileUrl } = req.body;
    
    if (!youtubeId || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลไม่ครบถ้วน'
      });
    }

    // Find or create user
    let user = await User.findOne({ youtubeId });

    if (user) {
      // Update user info
      user.displayName = displayName || user.displayName;
      user.avatarUrl = avatarUrl || user.avatarUrl;
      user.email = email || user.email;
      user.channelTitle = channelTitle || user.channelTitle;
      user.profileUrl = profileUrl || user.profileUrl;
      user.lastLoginAt = new Date();
      
      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'บัญชีของคุณถูกบล็อก'
        });
      }
      
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        youtubeId,
        displayName,
        avatarUrl: avatarUrl || '',
        email: email || '',
        channelTitle: channelTitle || '',
        profileUrl: profileUrl || '',
        lastLoginAt: new Date()
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login สำเร็จ',
      data: {
        user: {
          id: user._id,
          youtubeId: user.youtubeId,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          email: user.email,
          channelTitle: user.channelTitle,
          profileUrl: user.profileUrl,
          role: user.role,
          isBlocked: user.isBlocked
        },
        token
      }
    });

  } catch (error) {
    console.error('YouTube callback error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการ Login',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    
    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  res.json({
    success: true,
    message: 'Logout สำเร็จ'
  });
};

// @desc    Mock YouTube OAuth redirect (for development)
// @route   GET /api/auth/youtube
// @access  Public
exports.youtubeAuthRedirect = async (req, res) => {
  try {
    // In production, this would redirect to YouTube OAuth
    // For development, return mock credentials
    res.json({
      success: true,
      message: 'Mock YouTube OAuth - ใช้ข้อมูลนี้สำหรับ Login',
      mockData: {
        youtubeId: `mock-${Date.now()}`,
        displayName: 'Test User',
        avatarUrl: 'https://via.placeholder.com/100',
        email: 'test@example.com',
        channelTitle: 'Test Channel',
        profileUrl: 'https://youtube.com/channel/test'
      },
      note: 'ใน Production จะต้อง Redirect ไป YouTube OAuth จริง'
    });

  } catch (error) {
    console.error('YouTube redirect error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด'
    });
  }
};

// @desc    Update user role to streamer
// @route   PUT /api/auth/become-streamer
// @access  Private
exports.becomeStreamer = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { role: 'streamer' },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'คุณได้เป็น Streamer แล้ว',
      data: user
    });

  } catch (error) {
    console.error('Become streamer error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพเดทบทบาท'
    });
  }
};
