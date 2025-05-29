import './ProfileCreation.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateProfile() {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    subject: '',
    studyStyle: '',
    availability: '',
    academicLevel: '',
    goals: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile data submitted:', formData);
    navigate('/dashboard');// You can add navigation or Firebase logic here
  };

  return (
    <div
      className="profile-bg"
      style={{
        backgroundImage: `url("/SBbackground.png")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="profile-card">
        <h2>Create Your Profile</h2>
        <form onSubmit={handleSubmit}>
          <label>First Name</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />

          <label>Last Name</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />

          <label>Subject</label>
          <input type="text" name="subject" value={formData.subject} onChange={handleChange} required />

          <label>Study Styles</label>
          <input type="text" name="studyStyle" value={formData.studyStyle} onChange={handleChange} required />

          <label>Availability</label>
          <input type="text" name="availability" value={formData.availability} onChange={handleChange} required />

          <label>Academic Level</label>
          <input type="text" name="academicLevel" value={formData.academicLevel} onChange={handleChange} required />

          <label>Goals</label>
          <textarea name="goals" value={formData.goals} onChange={handleChange} rows="3" required />

          <button type="submit">Save Profile</button>
        </form>
      </div>
    </div>
  );
}

export default CreateProfile;