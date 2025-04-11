const axios = require('axios');
const Student = require('../models/Student');

const syncStudents = async (req, res) => {
  try {
    // Fetch students from the provided API
    const response = await axios.get('https://67ebf57baa794fb3222c4652.mockapi.io/eraah/students');
    const students = response.data;

    // Update or create students in database
    for (const student of students) {
      await Student.findOneAndUpdate(
        { id: student.id },
        {
          ...student,
          last_updated: new Date()
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ message: 'Students synchronized successfully' });
  } catch (error) {
    console.error('Error syncing students:', error);
    res.status(500).json({ message: 'Error syncing students', error: error.message });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
  try {
    let query = {};
    let sort = { name: 1 }; // Default sort by name ascending

    // Parse query parameters
    const { sortBy, sortOrder, active, course } = req.query;

    // Filter by active status if provided
    if (active !== undefined) {
      query.active = active === 'true';
    }

    // Filter by course if provided
    if (course) {
      query.course = course;
    }

    // Sort based on parameters
    if (sortBy) {
      sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    }

    const students = await Student.find(query).sort(sort);
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

const getStudentStats = async (req, res) => {
  try {
    // Count active vs inactive students
    const activeCount = await Student.countDocuments({ active: true });
    const inactiveCount = await Student.countDocuments({ active: false });
    
    // Average age
    const avgAgeResult = await Student.aggregate([
      { $group: { _id: null, averageAge: { $avg: '$age' } } }
    ]);
    const averageAge = avgAgeResult.length > 0 ? avgAgeResult[0].averageAge : 0;
    
    // Students per course
    const studentsPerCourse = await Student.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      activeCount,
      inactiveCount,
      averageAge,
      studentsPerCourse: studentsPerCourse.map(item => ({ 
        course: item._id, 
        count: item.count 
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student stats', error: error.message });
  }
};

module.exports = {
  syncStudents,
  getStudents,
  getStudentStats
};