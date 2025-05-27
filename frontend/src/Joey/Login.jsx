import './Login.css';
import backgroundImg from './assets/SBbackground.png';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { auth } from '../firebase/firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
     try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login success:', userCredential.user);
    navigate('/tutor'); // Navigate to AI Tutor page
    } catch (err) {
      console.error('Login error:', err.message);
      setError('Invalid email or password.');
    }
  };

  return (
    <div
      className="login-simple-bg"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="login-simple-card">
        <h2>Welcome back!</h2>
        <p className="subheader">We're so excited to see you again!</p>
        <form onSubmit={handleLogin}>
          <label>EMAIL OR PHONE NUMBER</label>
           <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>PASSWORD</label>
         <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Log In</button>

          <p className="footer-link">
            Don't have an account? <a href="#">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;