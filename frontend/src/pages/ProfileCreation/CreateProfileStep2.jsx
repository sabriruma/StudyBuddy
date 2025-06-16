import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfileLayout from './ProfileLayout';
import subjects from '../../data/subjects.json';
import { saveProfilePart } from '../../firebase/saveProfilePart';

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

  const handleNext = async (e) => {
    e.preventDefault();
    await saveProfilePart(academicInfo);
    const combinedData = { ...prevData, ...academicInfo };
    navigate('/create-profile-step3', { state: combinedData });
  };

  <style>
  {`
    .selected-course-tag {
      background-color: var(--highlight-color);
      color: white;
      padding: 0.3rem 0.6rem;
      border-radius: 999px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
      display: inline-block;
    }

    .selected-course-tag:hover {
      background-color: #00a38f;
    }
  `}
</style>

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

            {/* Selected tags go above input */}
            {academicInfo.courses.length > 0 && (
  <div style={{ marginBottom: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
    {academicInfo.courses.map((course, index) => (
      <span
        key={index}
        style={{
          backgroundColor: '#00bfa5', // Teal primary
          color: '#ffffff',
          padding: '0.4rem 0.8rem',
          borderRadius: '999px',
          fontSize: '0.9rem',
          fontWeight: '500',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
          transition: 'background-color 0.3s',
        }}
        onClick={() => toggleCourse(course)}
        title="Click to remove"
      >
        {course} ✕
      </span>
    ))}
  </div>
)}

            <input
              type="text"
              placeholder="Start typing to search for a course..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
            />

            {/* Dropdown menu */}
            {courseSearch && filteredSubjects.length > 0 && (
              <div
                style={{
                  position: 'relative',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  background: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)',
                  marginTop: '2px',
                  borderRadius: '4px',
                  zIndex: 1000
                }}
              >
                {filteredSubjects.slice(0, 50).map((subject, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.5rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-color)'
                    }}
                    onClick={() => toggleCourse(subject.code)}
                  >
                    {subject.code} — {subject.name}
                  </div>
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
