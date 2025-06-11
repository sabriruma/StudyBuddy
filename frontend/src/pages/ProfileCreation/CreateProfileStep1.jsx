import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileLayout from './ProfileLayout';

const avatars = [
  '/SBmascot.png',
  '/SBmascotG.png',
  '/SBmascotR.png',
];

export default function CreateProfileStep1() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    avatar: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectAvatar = (avatar) => {
    setFormData(prev => ({ ...prev, avatar }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    navigate('/create-profile-step2', { state: formData });
  };

  return (
    <ProfileLayout>
      <h2>Step 1: Your Info</h2>
      <form onSubmit={handleNext}>
        <label>First Name</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <label>Last Name</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <label>Select an Avatar</label>
        <div className="avatar-selection">
          {avatars.map((avatar, index) => (
            <img
              key={index}
              src={avatar}
              alt={`Avatar ${index + 1}`}
              className={`avatar-img ${formData.avatar === avatar ? 'selected' : ''}`}
              onClick={() => selectAvatar(avatar)}
            />
          ))}
        </div>

        <button type="submit" style={{ marginTop: '1rem' }}>Next</button>
      </form>
    </ProfileLayout>
  );
}