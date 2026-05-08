const Donation = require('../models/Donation');
const User = require('../models/User');
const BankAccount = require('../models/BankAccount');

// @desc    Create new donation
// @route   POST /api/donations
// @access  Private
exports.createDonation = async (req, res) => {
  try {
    const { amount, bankCode, message, isAnonymous, streamerId } = req.body;

    // Validation
    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุจำนวนเงินที่ถูกต้อง'
      });
    }

    if (!bankCode) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกธนาคาร'
      });
    }

    if (!streamerId) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบข้อมูล Streamer'
      });
    }

    // Check if streamer exists
    const streamer = await User.findById(streamerId);
    if (!streamer) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบ Streamer นี้'
      });
    }

    // Create donation
    const donation = await Donation.create({
      user: req.user.id,
      streamer: streamerId,
      amount,
      bankCode,
      message: message || '',
      isAnonymous: isAnonymous || false,
      status: 'pending'
    });

    // Populate user info
    await donation.populate('user', 'displayName avatarUrl youtubeId');

    res.status(201).json({
      success: true,
      message: 'สร้างคำขอรับบริจาคสำเร็จ กรุณาโอนเงินและอัพโหลดสลิป',
      data: donation
    });

  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างคำขอรับบริจาค',
      error: error.message
    });
  }
};

// @desc    Get user's donations
// @route   GET /api/donations/my
// @access  Private
exports.getMyDonations = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const donations = await Donation.find(query)
      .populate('streamer', 'displayName channelTitle')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Donation.countDocuments(query);

    res.json({
      success: true,
      data: donations,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get my donations error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    });
  }
};

// @desc    Upload slip for donation
// @route   PUT /api/donations/:id/slip
// @access  Private
exports.uploadSlip = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionRef, transactionDate } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาอัพโหลดรูปสลิปการโอน'
      });
    }

    const donation = await Donation.findOne({ 
      _id: id, 
      user: req.user.id 
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอรับบริจาคนี้'
      });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถอัพโหลดสลิปได้ คำขอนี้อยู่ในสถานะ ' + donation.status
      });
    }

    // Update donation with slip
    donation.slipImage = `/uploads/${req.file.filename}`;
    donation.transactionRef = transactionRef || '';
    donation.transactionDate = transactionDate ? new Date(transactionDate) : new Date();
    await donation.save();

    res.json({
      success: true,
      message: 'อัพโหลดสลิปสำเร็จ รอการตรวจสอบ',
      data: donation
    });

  } catch (error) {
    console.error('Upload slip error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพโหลดสลิป'
    });
  }
};

// @desc    Get public recent donations (for overlay)
// @route   GET /api/donations/public/:streamerId
// @access  Public
exports.getPublicDonations = async (req, res) => {
  try {
    const { streamerId } = req.params;
    const { limit = 10 } = req.query;

    const donations = await Donation.find({
      streamer: streamerId,
      status: 'verified',
      isShownOnOverlay: true
    })
      .populate('user', 'displayName avatarUrl youtubeId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Format data for overlay
    const formattedDonations = donations.map(d => ({
      id: d._id,
      displayName: d.isAnonymous ? 'ผู้ใจบุญ' : d.user?.displayName || 'ไม่ระบุชื่อ',
      avatarUrl: d.isAnonymous ? '' : d.user?.avatarUrl || '',
      amount: d.amount,
      formattedAmount: d.formattedAmount,
      message: d.message,
      bankCode: d.bankCode,
      createdAt: d.createdAt
    }));

    res.json({
      success: true,
      data: formattedDonations
    });

  } catch (error) {
    console.error('Get public donations error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    });
  }
};

// @desc    Get donation by ID
// @route   GET /api/donations/:id
// @access  Private
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('user', 'displayName avatarUrl email')
      .populate('streamer', 'displayName channelTitle')
      .populate('verifiedBy', 'displayName');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอรับบริจาคนี้'
      });
    }

    // Check permission
    const isOwner = donation.user._id.toString() === req.user.id;
    const isStreamer = donation.streamer._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isStreamer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้'
      });
    }

    res.json({
      success: true,
      data: donation
    });

  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    });
  }
};

// @desc    Cancel pending donation
// @route   DELETE /api/donations/:id
// @access  Private
exports.cancelDonation = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: 'pending'
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอรับบริจาคนี้ หรือไม่สามารถยกเลิกได้'
      });
    }

    donation.status = 'expired';
    await donation.save();

    res.json({
      success: true,
      message: 'ยกเลิกคำขอรับบริจาคสำเร็จ'
    });

  } catch (error) {
    console.error('Cancel donation error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยกเลิก'
    });
  }
};
