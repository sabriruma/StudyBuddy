import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import floridaCities from '../../data/cities.json';
import subjects from '../../data/subject.json';

const avatars = [
  '/sb_fishing.png',
  '/sb_boba.png',
  '/sb_gamer.png',
];

const majorsBySchool = {
  "Florida International University": [
    "Computer Science",
    "Electrical Engineering",
    "Biology",
    "Psychology",
    "Business Administration"
  ]
};

export default function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    avatar: '',
    location: '',
    school: '',
    academicLevel: '',
    major: '',
    courses: [],
    subjects: [],
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    learningStyle: '',
    bio: '',
    studyEnvironment: '',
    importanceStudyEnvironment: 5,
    studyTime: '',
    importanceStudyTime: 5,
    studyMethod: '',
    importanceStudyMethod: 5,
  });

  const [courseSearch, setCourseSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [availableMajors, setAvailableMajors] = useState([]);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (formData.school) {
      setAvailableMajors(majorsBySchool[formData.school] || []);
    }
  }, [formData.school]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleCourse = (course) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(course)
        ? prev.courses.filter(c => c !== course)
        : [...prev.courses, course]
    }));
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCitySearch(value);
    setShowDropdown(value.trim().length > 0);
  };

  const handleCitySelect = (city) => {
    setCitySearch(city);
    setShowDropdown(false);
    setFormData(prev => ({ ...prev, location: city }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile data:', formData);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-100 to-teal-700 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-lg w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Step {step} of 3
          </h1>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                  <div className="relative">
                    <input type="text" value={citySearch} onChange={handleCityChange} placeholder="Search for your city..." autoComplete="off" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:text-white" />
                    {showDropdown && (
                      <ul className="absolute w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 mt-1 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                        {floridaCities.filter(city => city.toLowerCase().includes(citySearch.toLowerCase())).map((city, index) => (
                          <li key={index} onClick={() => handleCitySelect(city)} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                            {city}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select an Avatar</label>
                  <div className="flex justify-center gap-10 mt-6">
                    {avatars.map((avatar, index) => (
                      <img key={index} src={avatar} alt={`Avatar ${index + 1}`} onClick={() => setFormData(prev => ({ ...prev, avatar }))} className={`w-20 h-20 rounded-full cursor-pointer border-2 ${formData.avatar === avatar ? 'border-cyan-400 scale-105' : 'border-transparent'} transition-transform`} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Academic Level</label>
                  <select name="academicLevel" value={formData.academicLevel} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:text-white">
                    <option value="">Select your level</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">School</label>
                  <select name="school" value={formData.school} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:text-white">
                    <option value="">Select your school</option>
                    <option value="Florida International University">Florida International University</option>
                  </select>
                </div>
                {formData.school && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Major</label>
                    <select name="major" value={formData.major} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:text-white">
                      <option value="">Select your major</option>
                      {availableMajors.map((major, index) => (
                        <option key={index} value={major}>{major}</option>
                      ))}
                    </select>
                  </div>
                )}
                {formData.major && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Courses</label>
                    {formData.courses.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.courses.map((course, index) => (
                          <span key={index} className="bg-emerald-600 text-black px-3 py-1 rounded-full text-sm font-medium cursor-pointer shadow" onClick={() => toggleCourse(course)} title="Click to remove">
                            {course} ✕
                          </span>
                        ))}
                      </div>
                    )}
                    <input type="text" placeholder="Start typing to search for a course..." value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} className="mt-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-black dark:text-white dark:bg-gray-700" />
                    {courseSearch && subjects.filter(subject => subject.code.toLowerCase().includes(courseSearch.toLowerCase()) || subject.name.toLowerCase().includes(courseSearch.toLowerCase())).length > 0 && (
                      <div className="relative max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 mt-1 rounded-md z-10">
                        {subjects.filter(subject => subject.code.toLowerCase().includes(courseSearch.toLowerCase()) || subject.name.toLowerCase().includes(courseSearch.toLowerCase())).slice(0, 50).map((subject, index) => (
                          <div key={index} className="px-4 py-2 text-black dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700" onClick={() => toggleCourse(subject.code)}>
                            {subject.code} — {subject.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
  <div className="space-y-8 animate-fade-in">
    {/* Study Environment */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Study Environment</label>
      <select
        name="studyEnvironment"
        value={formData.studyEnvironment}
        onChange={handleChange}
        required
        className="block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 dark:bg-gray-700 dark:text-white"
      >
        <option value="">-- Select One --</option>
        <option value="quiet">Quiet (Library or Silent Room)</option>
        <option value="moderate">Moderate Noise (Coffee Shop)</option>
        <option value="collaborative">Collaborative (Group Study Spaces)</option>
      </select>

      <label className="mt-3 block text-sm text-gray-500 dark:text-gray-400">How important is this?</label>
      <div className="relative pt-2">
        <input
          type="range"
          name="importanceStudyEnvironment"
          min="1"
          max="10"
          value={formData.importanceStudyEnvironment}
          onChange={handleChange}
          className="w-full accent-green-500"
        />
        <div
          className="absolute top-0 text-xs text-white bg-gray-500 px-2 py-0.5 rounded-full shadow left-1/2 transform -translate-x-1/2 -translate-y-5 transition-all duration-200"
          style={{ left: `${(formData.importanceStudyEnvironment - 1) * 11.11}%` }}
        >
          {formData.importanceStudyEnvironment}
        </div>
      </div>
    </div>

    {/* Study Time */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Study Time</label>
      <select
        name="studyTime"
        value={formData.studyTime}
        onChange={handleChange}
        required
        className="block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 dark:bg-gray-700 dark:text-white"
      >
        <option value="">-- Select One --</option>
        <option value="morning">Morning</option>
        <option value="afternoon">Afternoon</option>
        <option value="night">Night</option>
      </select>

      <label className="mt-3 block text-sm text-gray-500 dark:text-gray-400">How important is this?</label>
      <div className="relative pt-2">
        <input
          type="range"
          name="importanceStudyTime"
          min="1"
          max="10"
          value={formData.importanceStudyTime}
          onChange={handleChange}
          className="w-full accent-green-500"
        />
        <div
          className="absolute top-0 text-xs text-white bg-gray-500 px-2 py-0.5 rounded-full shadow left-1/2 transform -translate-x-1/2 -translate-y-5 transition-all duration-200"
          style={{ left: `${(formData.importanceStudyTime - 1) * 11.11}%` }}
        >
          {formData.importanceStudyTime}
        </div>
      </div>
    </div>

    {/* Study Method */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Study Method</label>
      <select
        name="studyMethod"
        value={formData.studyMethod}
        onChange={handleChange}
        required
        className="block w-full border border-gray-300 dark:border-gray-500 rounded-md py-2 px-3 dark:bg-gray-700 dark:text-white"
      >
        <option value="">-- Select One --</option>
        <option value="solo">Solo Study</option>
        <option value="oneOnOne">1-on-1 Partner</option>
        <option value="group">Small Group</option>
      </select>

      <label className="mt-3 block text-sm text-gray-500 dark:text-gray-400">How important is this?</label>
      <div className="relative pt-2">
        <input
          type="range"
          name="importanceStudyMethod"
          min="1"
          max="10"
          value={formData.importanceStudyMethod}
          onChange={handleChange}
          className="w-full accent-green-500"
        />
        <div
          className="absolute top-0 text-xs text-white bg-gray-500 px-2 py-0.5 rounded-full shadow left-1/2 transform -translate-x-1/2 -translate-y-5 transition-all duration-200"
          style={{ left: `${(formData.importanceStudyMethod - 1) * 11.11}%` }}
        >
          {formData.importanceStudyMethod}
        </div>
      </div>
    </div>
  </div>
)}


            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Back
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={() => setStep(step + 1)} className="px-4 py-2 bg-teal-600 hover:bg-green-700 rounded-md text-sm font-medium text-white">
                  Continue
                </button>
              ) : (
                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium text-white">
                  Complete Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
