import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfileLayout from './ProfileLayout';
import subjects from '../../data/subjects.json'; // Adjust path as needed

const majorsBySchool = {
  "Florida International University": [
    "Computer Science",
    "Electrical Engineering",
    "Biology",
    "Psychology",
    "Business Administration"
  ]
};

export default function CreateProfileStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevData = location.state || {};

  const [academicInfo, setAcademicInfo] = useState({
    academicLevel: '',
    school: '',
    major: '',
    courses: [],
  });

  const [availableMajors, setAvailableMajors] = useState([]);

  const [courseSearch, setCourseSearch] = useState('');

  const filteredSubjects = subjects.filter(subject =>
    subject.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
    subject.name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  useEffect(() => {
    if (academicInfo.school) {
      setAvailableMajors(majorsBySchool[academicInfo.school] || []);
    }
  }, [academicInfo.school]);

  const handleChange = (e) => {
    setAcademicInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleCourse = (course) => {
    setAcademicInfo(prev => ({
      ...prev,
      courses: prev.courses.includes(course)
        ? prev.courses.filter(c => c !== course)
        : [...prev.courses, course]
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    const combinedData = { ...prevData, ...academicInfo };
    navigate('/create-profile-step3', { state: combinedData });
  };

  return (
    <ProfileLayout>
      <h2>Step 2: Academic Info</h2>
      <form onSubmit={handleNext}>
        <label>Academic Level</label>
        <select
          name="academicLevel"
          value={academicInfo.academicLevel}
          onChange={handleChange}
          required
        >
          <option value="">Select your level</option>
          <option value="Freshman">Freshman</option>
          <option value="Sophomore">Sophomore</option>
          <option value="Junior">Junior</option>
          <option value="Senior">Senior</option>
          <option value="Graduate">Graduate</option>
        </select>

        <label>School</label>
        <select
          name="school"
          value={academicInfo.school}
          onChange={handleChange}
          required
        >
          <option value="">Select your school</option>
          <option value="Florida International University">Florida International University</option>
        </select>

        {academicInfo.school && (
          <>
            <label>Major</label>
            <select
              name="major"
              value={academicInfo.major}
              onChange={handleChange}
              required
            >
              <option value="">Select your major</option>
              {availableMajors.map((major, index) => (
                <option key={index} value={major}>{major}</option>
              ))}
            </select>
          </>
        )}

{academicInfo.major && (
  <>
    <label>Courses</label>
    <input
      type="text"
      placeholder="Start typing to search for a course..."
      value={courseSearch}
      onChange={(e) => setCourseSearch(e.target.value)}
    />

    {/* Show dropdown only if user has typed something */}
    {courseSearch && filteredSubjects.length > 0 && (
      <div className="dropdown-list">
        {filteredSubjects.slice(0, 50).map((subject, index) => (
          <div
            key={index}
            className="dropdown-item"
            onClick={() => toggleCourse(subject.code)}
          >
            {subject.code} — {subject.name}
          </div>
        ))}
      </div>
    )}

    {/* Show selected course tags */}
    {academicInfo.courses.length > 0 && (
      <div className="selected-tags">
        {academicInfo.courses.map((course, index) => (
          <span
            key={index}
            className="tag selected"
            onClick={() => toggleCourse(course)}
          >
            {course} ✕
          </span>
        ))}
      </div>
    )}
  </>
)}

        <button type="submit" style={{ marginTop: '1rem' }}>Next</button>
      </form>
    </ProfileLayout>
  );
}