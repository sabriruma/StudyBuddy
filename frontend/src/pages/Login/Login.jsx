import './Login.css';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { auth } from '../../firebase/firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password.');
    }

  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome back!</h2>
        <p className="subheader">SSSS</p>
        <form onSubmit={handleLogin}>
          {error && <p className="error-message">{error}</p>}
          <label>Email or Phone Number</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Log In</button>
          <p className="footer-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;