const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Raise a new complaint
// @route   POST /api/complaints
// @access  Private
const raiseComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Create new complaint
    const complaint = await Complaint.create({
      userId: req.user.id,
      title,
      description
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during complaint creation' });
  }
};

// @desc    Get user's complaints
// @route   GET /api/complaints/my
// @access  Private
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id })
      .populate('userId', 'name email ebId')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all complaints (admin only)
// @route   GET /api/complaints
// @access  Private/Admin
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .populate('userId', 'name email ebId')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update complaint status (admin only)
// @route   PUT /api/complaints/:id
// @access  Private/Admin
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Update fields if provided
    if (status) complaint.status = status;
    if (response) complaint.response = response;

    await complaint.save();

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id).populate('userId', 'name email ebId');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user can access this complaint (owner or admin)
    if (req.user.id.toString() !== complaint.userId._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  raiseComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  getComplaintById
};