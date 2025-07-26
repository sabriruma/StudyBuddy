import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/firebase';
import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
          setFormData(docSnap.data());
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

  const handleCourseChange = (index, value) => {
    const updatedCourses = [...formData.courses];
    updatedCourses[index] = value;
    setFormData(prev => ({
      ...prev,
      courses: updatedCourses
    }));
  };

  const addCourse = () => {
    setFormData(prev => ({
      ...prev,
      courses: [...(prev.courses || []), '']
    }));
  };

  const removeCourse = (index) => {
    const updatedCourses = [...formData.courses];
    updatedCourses.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      courses: updatedCourses
    }));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, formData, { merge: true });
      setProfile(formData);
      setEditMode(false);
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
              <p><span>First Name:</span> <input name="firstName" value={formData.firstName} onChange={handleChange} /></p>
              <p><span>Last Name:</span> <input name="lastName" value={formData.lastName} onChange={handleChange} /></p>
              <p><span>City:</span> <input name="location" value={formData.location} onChange={handleChange} /></p>
              <p><span>School:</span> <input name="school" value={formData.school} onChange={handleChange} /></p>
              <p><span>Major:</span> <input name="major" value={formData.major} onChange={handleChange} /></p>
              <p><span>Academic Level:</span>
                <select name="academicLevel" value={formData.academicLevel} onChange={handleChange}>
                  {academicLevelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </p>
              <p><span>Study Environment:</span>
                <select name="studyEnvironment" value={formData.studyEnvironment} onChange={handleChange}>
                  {studyEnvironmentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </p>
              <p><span>Importance of Environment:</span>
                <select name="importanceStudyEnvironment" value={formData.importanceStudyEnvironment} onChange={handleChange}>
                  {importanceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </p>
              <p><span>Study Method:</span>
                <select name="studyMethod" value={formData.studyMethod} onChange={handleChange}>
                  {studyMethodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </p>
              <p><span>Importance of Method:</span>
                <select name="importanceStudyMethod" value={formData.importanceStudyMethod} onChange={handleChange}>
                  {importanceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </p>
              <p><span>Study Time:</span>
                <select name="studyTime" value={formData.studyTime} onChange={handleChange}>
                  {studyTimeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </p>
              <p><span>Importance of Time:</span>
                <select name="importanceStudyTime" value={formData.importanceStudyTime} onChange={handleChange}>
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
                {formData.courses?.map((course, i) => (
                  <div key={i}>
                    <input
                      value={course}
                      onChange={(e) => handleCourseChange(i, e.target.value)}
                    />
                    <button type="button" onClick={() => removeCourse(i)}>Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addCourse}>Add Course</button>
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

