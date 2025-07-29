import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/firebase';
import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import courses from '../../data/courses.json';
import './ProfilePage.css';

const studyEnvironmentOptions = ["quiet", "moderate", "collaborative"];
const studyMethodOptions = ["solo", "oneOnOne", "group"];
const studyTimeOptions = ["morning", "afternoon", "night"];
const academicLevelOptions = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
const importanceOptions = Array.from({ length: 10 }, (_, i) => String(i + 1));
const avatars = ['/SBmascot.png', '/SBmascotG.png', '/SBmascotR.png'];

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [courseSearch, setCourseSearch] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log('Loaded user data:', userData); // Debug log
          setProfile(userData);
          setFormData(userData);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredCourses = courses.filter(course =>
    (course.code && course.code.toLowerCase().includes(courseSearch.toLowerCase())) ||
    (course.name && course.name.toLowerCase().includes(courseSearch.toLowerCase()))
  );

  const toggleCourse = (course) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses?.includes(course)
        ? prev.courses.filter(c => c !== course)
        : [...(prev.courses || []), course]
    }));
  };

  const removeCourse = (course) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses?.filter(c => c !== course) || []
    }));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, formData, { merge: true });
        setProfile(formData);
        setEditMode(false);
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <img src={formData.avatar || "/SBmascot.png"} alt="Profile Avatar" className="profile-avatar" />
        <h2>{profile.firstName} {profile.lastName}</h2>

        <div className="profile-info">
          {editMode ? (
            <>
              <p><span>First Name:</span> <input name="firstName" value={formData.firstName || ''} onChange={handleChange} /></p>
              <p><span>Last Name:</span> <input name="lastName" value={formData.lastName || ''} onChange={handleChange} /></p>
              <p><span>City:</span> <input name="location" value={formData.location || ''} onChange={handleChange} /></p>
              <p><span>School:</span> <input name="school" value={formData.school || ''} onChange={handleChange} /></p>
              <p><span>Major:</span> <input name="major" value={formData.major || ''} onChange={handleChange} /></p>
              <p><span>Academic Level:</span>
                <select name="academicLevel" value={formData.academicLevel || ''} onChange={handleChange}>
                  <option value="">Select level</option>
                  {academicLevelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </p>
              <p><span>Study Environment:</span>
                <select name="studyEnvironment" value={formData.studyEnvironment || ''} onChange={handleChange}>
                  <option value="">Select environment</option>
                  {studyEnvironmentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </p>
              <p><span>Importance of Environment:</span>
                <select name="importanceStudyEnvironment" value={formData.importanceStudyEnvironment || ''} onChange={handleChange}>
                  <option value="">Select importance</option>
                  {importanceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </p>
              <p><span>Study Method:</span>
                <select name="studyMethod" value={formData.studyMethod || ''} onChange={handleChange}>
                  <option value="">Select method</option>
                  {studyMethodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </p>
              <p><span>Importance of Method:</span>
                <select name="importanceStudyMethod" value={formData.importanceStudyMethod || ''} onChange={handleChange}>
                  <option value="">Select importance</option>
                  {importanceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </p>
              <p><span>Study Time:</span>
                <select name="studyTime" value={formData.studyTime || ''} onChange={handleChange}>
                  <option value="">Select time</option>
                  {studyTimeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </p>
              <p><span>Importance of Time:</span>
                <select name="importanceStudyTime" value={formData.importanceStudyTime || ''} onChange={handleChange}>
                  <option value="">Select importance</option>
                  {importanceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </p>
              <p><span>Choose Avatar:</span></p>
<div className="avatar-options">
  {avatars.map((avatar, index) => (
    <img
      key={index}
      src={avatar}
      alt={`Avatar ${index}`}
      className={`avatar-choice ${formData.avatar === avatar ? 'selected' : ''}`}
      onClick={() => setFormData(prev => ({ ...prev, avatar }))}
    />
  ))}
</div>

              <p><span>Courses:</span>
                {/* Selected courses display */}
                {formData.courses?.length > 0 && (
                  <div style={{ marginBottom: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {formData.courses.map((course, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: '#00bfa5',
                          color: '#ffffff',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '999px',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                          transition: 'background-color 0.3s',
                        }}
                        onClick={() => removeCourse(course)}
                        title="Click to remove"
                      >
                        {course} ✕
                      </span>
                    ))}
                  </div>
                )}

                {/* Course search input */}
                <input
                  type="text"
                  placeholder="Start typing to search for a course..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                />

                {/* Course dropdown */}
                {courseSearch && filteredCourses.length > 0 && (
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
                    {filteredCourses.slice(0, 50).map((course, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '0.5rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-color)'
                        }}
                        onClick={() => toggleCourse(course.code || course)}
                      >
                        {course.code}
                      </div>
                    ))}
                  </div>
                )}
              </p>
            </>
          ) : (
            <>
              <p><span>First Name:</span> {profile.firstName}</p>
              <p><span>Last Name:</span> {profile.lastName}</p>
              <p><span>City:</span> {profile.location}</p>
              <p><span>School:</span> {profile.school}</p>
              <p><span>Major:</span> {profile.major}</p>
              <p><span>Academic Level:</span> {profile.academicLevel}</p>
              <p><span>Study Environment:</span> {profile.studyEnvironment}</p>
              <p><span>Importance of Environment:</span> {profile.importanceStudyEnvironment}</p>
              <p><span>Study Method:</span> {profile.studyMethod}</p>
              <p><span>Importance of Method:</span> {profile.importanceStudyMethod}</p>
              <p><span>Study Time:</span> {profile.studyTime}</p>
              <p><span>Importance of Time:</span> {profile.importanceStudyTime}</p>
              <p><span>Courses:</span> {profile.courses?.join(', ')}</p>
            </>
          )}
        </div>

        {editMode ? (
          <button className="edit-btn" onClick={handleSave}>Save</button>
        ) : (
          <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

