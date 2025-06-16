import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProfilePart } from '../../firebase/saveProfilePart';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import './CreateProfileStep3.css';
import backgroundImage from '../../ComponentsMain/SBBG.png';

export default function CreateProfileStep3() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studyEnvironment: '',
    studyTime: '',
    studyMethod: '',
    importanceStudyEnvironment: 5,
    importanceStudyTime: 5,
    importanceStudyMethod: 5,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = async (e) => {
    e.preventDefault();
    await saveProfilePart(formData);
  
    // Wait until Firebase confirms auth
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');
      } else {
        // fallback if something went wrong
        navigate('/');
      }
    });
  };

  const handleBack = () => {
    navigate('/create-profile-step2');
  };

  return (
<div
  className="step3-container"
  style={{ backgroundImage: `url(${backgroundImage})` }}
>
  <div className="step3-card">
        <h2>Step 3: Study Style Info</h2>
        <form onSubmit={handleNext}>
          {/* Question 1 */}
          <div className="question-block">
            <label>Study Environment</label>
            <select
              name="studyEnvironment"
              value={formData.studyEnvironment}
              onChange={handleChange}
              required
            >
              <option value="">-- Select One --</option>
              <option value="quiet">Quiet (Library or Silent Room)</option>
              <option value="moderate">Moderate Noise (Coffee Shop)</option>
              <option value="collaborative">Collaborative (Group Study Spaces)</option>
            </select>

            <label className="slider-label">How important is this to you?</label>
            <div className="slider-container">
  <div className="slider-labels">
    {Array.from({ length: 10 }, (_, i) => (
      <span key={i}>{i + 1}</span>
    ))}
  </div>
  <div className="slider-wrapper">
    <input
      type="range"
      name="importanceStudyEnvironment"
      min="1"
      max="10"
      value={formData.importanceStudyEnvironment}
      onChange={handleChange}
    />
    <div
      className="slider-value"
      style={{
        left: `${(formData.importanceStudyEnvironment - 1) * 11.11}%`,
      }}
    >
      {formData.importanceStudyEnvironment}
    </div>
  </div>
</div>
          </div>

          {/* Question 2 */}
          <div className="question-block">
            <label>Preferred Study Time</label>
            <select
              name="studyTime"
              value={formData.studyTime}
              onChange={handleChange}
              required
            >
              <option value="">-- Select One --</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="night">Night</option>
            </select>

            <label className="slider-label">How important is this to you?</label>
            <div className="slider-container">
  <div className="slider-labels">
    {Array.from({ length: 10 }, (_, i) => (
      <span key={i}>{i + 1}</span>
    ))}
  </div>
  <div className="slider-wrapper">
    <input
      type="range"
      name="importanceStudyTime"
      min="1"
      max="10"
      value={formData.importanceStudyTime}
      onChange={handleChange}
    />
    <div
      className="slider-value"
      style={{
        left: `${(formData.importanceStudyTime - 1) * 11.11}%`,
      }}
    >
      {formData.importanceStudyTime}
    </div>
  </div>
</div>
          </div>

          {/* Question 3 */}
          <div className="question-block">
            <label>Study Method</label>
            <select
              name="studyMethod"
              value={formData.studyMethod}
              onChange={handleChange}
              required
            >
              <option value="">-- Select One --</option>
              <option value="solo">Solo Study</option>
              <option value="oneOnOne">1-on-1 Partner</option>
              <option value="group">Small Group</option>
            </select>

            <label className="slider-label">How important is this to you?</label>
            <div className="slider-container">
  <div className="slider-labels">
    {Array.from({ length: 10 }, (_, i) => (
      <span key={i}>{i + 1}</span>
    ))}
  </div>
  <div className="slider-wrapper">
    <input
      type="range"
      name="importanceStudyMethod"
      min="1"
      max="10"
      value={formData.importanceStudyMethod}
      onChange={handleChange}
    />
    <div
      className="slider-value"
      style={{
        left: `${(formData.importanceStudyMethod - 1) * 11.11}%`,
      }}
    >
      {formData.importanceStudyMethod}
    </div>
  </div>
</div>
          </div>

          <div className="step3-buttons">
            <button type="button" onClick={handleBack}>Back</button>
            <button type="submit">Next</button>
          </div>
        </form>
      </div>
    </div>

  );
}