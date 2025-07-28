import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileLayout from "./ProfileLayout";
import courses from "../../data/courses.json";
import majors from "../../data/majors.json";
import { saveProfilePart } from "../../firebase/saveProfilePart";

const majorsBySchool = {
  "Florida International University": [
    "Computer Science",
    "Electrical Engineering",
    "Biology",
    "Psychology",
    "Business Administration",
  ],
};

export default function CreateProfileStep2({
  handleGoNextStep,
  handleGoBackStep,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const prevData = location.state || {};

  const [academicInfo, setAcademicInfo] = useState({
    academicLevel: "",
    school: "",
    major: "",
    courses: [],
  });

  const [availableMajors, setAvailableMajors] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");

  const filteredCourses = courses.filter(
    (course) =>
      (course.code &&
        course.code.toLowerCase().includes(courseSearch.toLowerCase())) ||
      (course.name &&
        course.name.toLowerCase().includes(courseSearch.toLowerCase()))
  );

  const [majorSearch, setMajorSearch] = useState(academicInfo.major || "");
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);

  const filteredMajors = majors.filter((major) =>
    major.toLowerCase().includes(majorSearch.toLowerCase())
  );

  const handleMajorSearchChange = (e) => {
    const value = e.target.value;
    setMajorSearch(value);
    setShowMajorDropdown(value.trim().length > 0);

    // Update form state while typing
    setAcademicInfo((prev) => ({ ...prev, major: value }));
  };

  const handleMajorSelect = (major) => {
    setMajorSearch(major);
    setShowMajorDropdown(false);
    setAcademicInfo((prev) => ({ ...prev, major }));
  };

  useEffect(() => {
    if (academicInfo.school) {
      setAvailableMajors(majorsBySchool[academicInfo.school] || []);
    }
  }, [academicInfo.school]);

  const handleChange = (e) => {
    setAcademicInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleCourse = (course) => {
    setAcademicInfo((prev) => ({
      ...prev,
      courses: prev.courses.includes(course)
        ? prev.courses.filter((c) => c !== course)
        : [...prev.courses, course],
    }));
  };

  const handleNext = async (e) => {
    e.preventDefault();
    await saveProfilePart(academicInfo);
    const combinedData = { ...prevData, ...academicInfo };
    handleGoNextStep();
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
  </style>;

  return (
    <div className="profile-card dark:bg-gray-800">
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
          <option value="Florida International University">
            Florida International University
          </option>
        </select>

        {academicInfo.school && (
          <>
            <label>Major</label>
            <input
              type="text"
              placeholder="Start typing to search for your major..."
              value={majorSearch}
              onChange={handleMajorSearchChange}
              autoComplete="off"
              style={{ width: "100%" }}
              required
            />

            {showMajorDropdown && filteredMajors.length > 0 && (
              <div
                style={{
                  position: "relative",
                  maxHeight: "200px",
                  overflowY: "auto",
                  background: "var(--bg-color)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-color)",
                  marginTop: "2px",
                  borderRadius: "4px",
                  zIndex: 1000,
                }}
              >
                {filteredMajors.slice(0, 50).map((major, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "0.5rem",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                    onClick={() => handleMajorSelect(major)}
                  >
                    {major}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {academicInfo.major && majors.includes(academicInfo.major) && (
          <>
            <label>Courses</label>

            {/* Selected tags go above input */}
            {academicInfo.courses.length > 0 && (
              <div
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                {academicInfo.courses.map((course, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: "#00bfa5", // Teal primary
                      color: "#ffffff",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "999px",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                      transition: "background-color 0.3s",
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
            {courseSearch && filteredCourses.length > 0 && (
              <div
                style={{
                  position: "relative",
                  maxHeight: "200px",
                  overflowY: "auto",
                  background: "var(--bg-color)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-color)",
                  marginTop: "2px",
                  borderRadius: "4px",
                  zIndex: 1000,
                }}
              >
                {filteredCourses.slice(0, 50).map((course, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "0.5rem",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                    onClick={() => toggleCourse(course.code)}
                  >
                    {course.code}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="step3-buttons gap-10">
          <button type="button" onClick={handleGoBackStep}>
            Back
          </button>
          <button type="submit" onClick={handleGoNextStep}>
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
