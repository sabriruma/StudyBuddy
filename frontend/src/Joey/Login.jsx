import './Login.css';
import backgroundImg from './assets/SBbackground.png';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    navigate('/tutor'); // Navigate to AI Tutor page
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
          <input type="email" />

          <label>PASSWORD</label>
          <input type="password" />

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