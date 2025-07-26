import React from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
  // Mock profile data
  const profile = {
    firstName: 'Sabrina',
    lastName: 'Rumayor',
    city: 'Miami',
    school: 'FIU',
    major: 'Computer Engineering',
    studyEnvironment: 'Quiet Library',
    studyStyle: 'Visual Learning',
    preferredTime: 'Evenings',
    courses: ['Data Structures', 'Circuits I', 'Signals & Systems', 'Software Engineering']
  };

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <img src="/SBmascot.png" alt="Profile Avatar" className="profile-avatar" />
        <h2>{profile.firstName} {profile.lastName}</h2>

        <div className="profile-info">
          <p><span>First Name:</span> {profile.firstName}</p>
          <p><span>Last Name:</span> {profile.lastName}</p>
          <p><span>City:</span> {profile.city}</p>
          <p><span>School:</span> {profile.school}</p>
          <p><span>Major:</span> {profile.major}</p>
          <p><span>Study Environment:</span> {profile.studyEnvironment}</p>
          <p><span>Study Style:</span> {profile.studyStyle}</p>
          <p><span>Preferred Study Time:</span> {profile.preferredTime}</p>
        </div>

        <button className="edit-btn">Edit Profile</button>
      </div>
    </div>
  );
};

export default ProfilePage;
