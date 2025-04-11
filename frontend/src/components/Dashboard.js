import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { studentService } from '../services/api'; // Import the properly configured service
import '../styles/Dashboard.css';

// Student Table component
const StudentTable = ({ students, loading }) => {
  return (
    <div className="table-container">
      <h3>Student List</h3>
      {loading ? (
        <p>Loading students...</p>
      ) : (
        <table className="student-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Course</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map(student => (
                <tr key={student._id || student.id}>
                  <td>{student._id || student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.age}</td>
                  <td>{student.course}</td>
                  <td className={student.active ? 'active-status' : 'inactive-status'}>
                    {student.active ? 'Active' : 'Inactive'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No students found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

const StudentCharts = ({ students, stats }) => {
  if (!students.length) return <p>No data to display charts</p>;
  
  return (
    <div className="charts-container">
      <div className="chart-card">
        <h3>Student Statistics</h3>
        <div className="stats-display">
          <div className="stat-item">
            <span className="stat-label">Total Students:</span>
            <span className="stat-value">{students.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active Students:</span>
            <span className="stat-value">
              {students.filter(s => s.active).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Age:</span>
            <span className="stat-value">
              {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + (s.age || 0), 0) / students.length) : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    active: '',
    course: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [courses, setCourses] = useState([]);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { logout } = useAuth();

  useEffect(() => {
    // Fetch students and stats on component mount
    fetchStudents();
    fetchStats();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log("Fetching students with filters:", filters);
      const studentsData = await studentService.getStudents(filters);
      console.log("Received students data:", studentsData);
      setStudents(studentsData);
      
      // Extract unique courses for filter dropdown
      const uniqueCourses = [...new Set(studentsData.map(student => student.course).filter(Boolean))];
      setCourses(uniqueCourses);
    } catch (err) {
      setError('Failed to fetch students. Please try again.');
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log("Fetching stats");
      const statsData = await studentService.getStats();
      console.log("Received stats data:", statsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSyncStudents = async () => {
    try {
      setLoading(true);
      console.log("Syncing students");
      await studentService.syncStudents();
      await fetchStudents();
      await fetchStats();
    } catch (err) {
      setError('Failed to sync students. Please try again.');
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const applyFilters = async () => {
    await fetchStudents();
  };

  const resetFilters = () => {
    setFilters({
      active: '',
      course: '',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-theme' : ''}`}>
      <header className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="header-controls">
          <button onClick={toggleTheme} className="theme-toggle">
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>
      
      <div className="actions-container">
        <button 
          className="btn btn-primary" 
          onClick={handleSyncStudents} 
          disabled={loading}
        >
          {loading ? 'Syncing...' : 'Sync Students from API'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="filters-container">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="active">Status:</label>
            <select
              id="active"
              name="active"
              value={filters.active}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="course">Course:</label>
            <select
              id="course"
              name="course"
              value={filters.course}
              onChange={handleFilterChange}
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="sortBy">Sort By:</label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
            >
              <option value="name">Name</option>
              <option value="age">Age</option>
              <option value="course">Course</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="sortOrder">Order:</label>
            <select
              id="sortOrder"
              name="sortOrder"
              value={filters.sortOrder}
              onChange={handleFilterChange}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
        
        <div className="filter-actions">
          <button className="btn btn-primary" onClick={applyFilters}>
            Apply Filters
          </button>
          <button className="btn btn-secondary" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <StudentCharts students={students} stats={stats} />
        <StudentTable students={students} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;