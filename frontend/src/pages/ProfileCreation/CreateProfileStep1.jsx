import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileLayout from './ProfileLayout';
import { saveProfilePart } from '../../firebase/saveProfilePart';
import floridaCities from '../../data/cities.json';

const avatars = [
  '/SBmascot.png',
  '/SBmascotG.png',
  '/SBmascotR.png',
  '/sb_boba.png',
  '/sb_fishing.png',
  '/sb_gamer.png',
  '/studybuddy-mad-gamer.png',
  '/sb-study.png',
  '/SBMascotTeach.png',
];

const styles = {
  avatarImg: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    margin: '0.5rem',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '2px solid transparent',
  },
  selected: {
    border: '3px solid #00a78f',
    transform: 'scale(1.05)',
    boxShadow: '0 0 8px rgba(0, 0, 0, 0.2)',
  },
};

export default function CreateProfileStep1({handleGoNextStep}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    avatar: '',
    location: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectAvatar = (avatar) => {
    setFormData(prev => ({ ...prev, avatar }));
  };

  const handleNext = async (e) => {
    e.preventDefault();

    // Add reputationScore to the initial user data
    const dataToSave = {
      ...formData,
      reputationScore: 1000
    };

    await saveProfilePart(dataToSave);
    handleGoNextStep()
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCitySearch(value);
    setShowDropdown(value.trim().length > 0);
  };

  const [citySearch, setCitySearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

const filteredCities = floridaCities.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleCitySelect = (city) => {
    setCitySearch(city);
    setShowDropdown(false);
setFormData(prev => ({ ...prev, location: city }));
  };

  return (
    <div className='profile-card'>
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

<label>City</label>
<div className="city-dropdown" style={{ position: 'relative' }}>
<input
  type="text"
  value={citySearch}
  onChange={handleCityChange}  // <-- Now defined
  placeholder="Search for your city..."
  autoComplete="off"
/>
  {showDropdown && filteredCities.length > 0 && (
    <ul>
  {filteredCities.map((city, index) => (
    <li
      key={index}
      onClick={() => handleCitySelect(city)}
    >
      {city}
    </li>
  ))}
</ul>
  )}
  </div>

        <label>Select an Avatar</label>
        <div className="avatar-selection">
          {avatars.map((avatar, index) => (
            <img
  key={index}
  src={avatar}
  alt={`Avatar ${index + 1}`}
  style={{
    ...styles.avatarImg,
    ...(formData.avatar === avatar ? styles.selected : {}),
  }}
  onClick={() => selectAvatar(avatar)}
/>
          ))}
        </div>

        <style>{`
  .city-dropdown ul {
    position: absolute;
    width: 100%;
    max-height: 150px;
    overflow-y: auto;
    margin-top: 2px;
    list-style-type: none;
    padding: 0;
    background-color: var(--bg-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    z-index: 1000;
  }

  .city-dropdown ul li {
    padding: 0.5rem;
    cursor: pointer;
    border-bottom: 1px solid var(--border-color);
  }

  .city-dropdown ul li:hover {
    background-color: var(--sidebar-bg);
  }
`}</style>

        <button type="submit" style={{ marginTop: '1rem' }}>Next</button>
      </form>
    </div>
  );
}