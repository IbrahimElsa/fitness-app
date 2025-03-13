// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, loginWithGoogle } from '../firebaseAuthServices';
import MobileNavbar from '../components/MobileNavbar';
import { Lock, Mail, User } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useTheme } from '../components/ThemeContext';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme, themeCss } = useTheme();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await register(email, password);
      console.log('User created:', user);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    try {
      const user = await loginWithGoogle();
      console.log('Signed up with Google:', user);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-indigo-950 flex flex-col items-center pt-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
            Create Account
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Join our fitness community and start tracking your workouts
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-lg text-center">
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          </div>
        )}

        <div className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} py-8 px-4 shadow-xl rounded-xl sm:px-10`}>
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${theme === 'light' ? themeCss.formLabelLight : themeCss.formLabelDark} mb-1`}>
                Email address
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full pl-10 px-3 py-3 border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${theme === 'light' ? themeCss.inputLight : themeCss.inputDark} sm:text-sm`}
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${theme === 'light' ? themeCss.formLabelLight : themeCss.formLabelDark} mb-1`}>
                Password
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full pl-10 px-3 py-3 border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${theme === 'light' ? themeCss.inputLight : themeCss.inputDark} sm:text-sm`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <button
                type="submit"
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${themeCss.primaryButton}`}
              >
                Create Account
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === 'light' ? themeCss.dividerLight : themeCss.dividerDark}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} text-slate-500 dark:text-slate-400`}>
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignUp}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition duration-150 ease-in-out"
              >
                <FontAwesomeIcon icon={faGoogle} className="h-5 w-5 text-white mr-2" />
                Sign up with Google
              </button>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-slate-600 dark:text-slate-400">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <MobileNavbar />
    </div>
  );
};

export default RegisterPage;