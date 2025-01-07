import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div class="form-wrapper">
        <form action="#">
            <h2>Login</h2>
            <div class="input-field">
                <input type="email" name='email' placeholder='Enter your email' required />
            </div>
            <div class="input-field">
                <input type="password" name='password' placeholder='Enter Your Password' required />
            </div>
            <div class="forget">
                <label for="remember">
                    <input type="checkbox" id="remember" />
                    <p>Remember me</p>
                </label>
                <a href="#">Forgot password?</a>
            </div>
            <button type="submit">Log In</button>
            <div class="register">
                <p>Don't have an account? <Link to="/register">Register Now</Link></p>
            </div>
        </form>
    </div>
  );
};

export default Login;