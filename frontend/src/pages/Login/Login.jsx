import './Login.css';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { auth } from '../../firebase/firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import backgroundImage from '../../ComponentsMain/SBBG.png';

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
    <div className="login-wrapper">
    <div
      className="login-simple-bg"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="login-simple-card">
        <h2>Welcome back!</h2>
        <p className="subheader">We're so excited to see you again</p>
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
    </div> 
  );
}

export default Login;