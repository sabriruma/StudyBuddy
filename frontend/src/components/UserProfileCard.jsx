// src/components/UserProfileCard.jsx
import { useNavigate } from 'react-router-dom';

export default function UserProfileCard({ profile }) {
  const navigate = useNavigate();

  if (!profile) return null;

  return (
    <div className="bg-[#1e293b] border border-green-500 rounded-xl p-6 mb-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between shadow-md">
      <div className="flex items-center space-x-4">
        <img
          src={profile.avatar || '/default-avatar.png'}
          alt="User Avatar"
          className="h-20 w-20 rounded-full border-2 border-green-400 object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
          <p className="text-sm text-gray-300 mb-1">📚 Major: {profile.major}</p>
          <p className="text-sm text-gray-300 mb-1">🎓 Year: {profile.year}</p>
          <p className="text-sm text-gray-300">🧠 Learning Style: {profile.learningStyle}</p>
        </div>
      </div>
      <div className="mt-4 md:mt-0 md:ml-6">
        <button
          onClick={() => navigate('/profile/edit')}
          className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 rounded-md shadow"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
