import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileLayout from './ProfileLayout';
import { saveProfilePart } from '../../firebase/saveProfilePart';
import floridaCities from '../../data/cities.json';

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

     await saveProfilePart(formData);
     navigate('/create-profile-step2');
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
    setFormData(prev => ({ ...prev, city }));
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
    <ul
      style={{
        position: 'absolute',
        background: '#fff',
        border: '1px solid #ccc',
        width: '100%',
        maxHeight: '150px',
        overflowY: 'auto',
        zIndex: 1000,
        marginTop: '2px',
        listStyleType: 'none',
        padding: 0,
      }}
    >
      {filteredCities.map((city, index) => (
        <li
          key={index}
          style={{
            padding: '0.5rem',
            cursor: 'pointer',
            borderBottom: '1px solid #eee',
          }}
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