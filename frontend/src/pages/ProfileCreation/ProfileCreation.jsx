import './ProfileCreation.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import backgroundImage from '../../ComponentsMain/SBBG.png';
import subjects from '../../data/subjects.json';


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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "profiles"), formData);
      console.log("Profile successfully stored in Firestore:", formData);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving profile:", error);
    }
};


  return (
    <div
      className="profile-bg"
      style={{
           backgroundImage: `url(${backgroundImage})`,
        }}
    >
      <div className="profile-card">
        <h2>Create Your Profile</h2>
        <form onSubmit={handleSubmit}>

          <label>Subject</label>
<input
  list="subject-options"
  name="subject"
  value={formData.subject}
  onChange={handleChange}
  placeholder="Select a subject"
  required
/>
<datalist id="subject-options">
  {subjects.map((course, idx) => (
    <option key={idx} value={`${course.code} – ${course.name}`} />
  ))}
</datalist>
        
          <label>Study Style</label>
          <select name="studyStyle" value={formData.studyStyle} onChange={handleChange} required>
            <option value="">Select a style</option>
            <option value="Solo">Solo</option>
            <option value="Group">Group</option>
            <option value="Pomodoro">Pomodoro</option>
            <option value="Visual">Visual</option>
            <option value="Auditory">Auditory</option>
          </select>

          <label>Availability</label>
          <select name="availability" value={formData.availability} onChange={handleChange} required>
            <option value="">Select availability</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Weekends">Weekends</option>
            <option value="Evenings">Evenings</option>
            <option value="Mornings">Mornings</option>
            <option value="Anytime">Anytime</option>
          </select>     

          <label>Academic Level</label>
          <select name="academicLevel" value={formData.academicLevel} onChange={handleChange} required>
            <option value="">Select level</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Graduate">Graduate</option>
          </select>

          <label>Goals</label>
          <textarea name="goals" value={formData.goals} onChange={handleChange} rows="3" required />

          <button type="submit">Save Profile</button>
        </form>
      </div>
    </div>
  );
}

export default CreateProfile;