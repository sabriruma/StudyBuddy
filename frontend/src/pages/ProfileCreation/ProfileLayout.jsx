import backgroundImage from '../../ComponentsMain/SBBG.png';
import './ProfileCreation.css';

export default function ProfileLayout({ children }) {
  return (
    <div
      className="profile-bg"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="profile-card">
        {children}
      </div>
    </div>
  );
}