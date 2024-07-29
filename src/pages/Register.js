import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../firebaseAuthServices';
import MobileNavbar from '../components/MobileNavbar';
import { Lock, Mail } from 'lucide-react';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-col items-center pt-36 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <h2 className="text-center text-4xl font-extrabold text-gray-900 mb-8">
                    Create Account
                </h2>
                {error && <p className="mb-4 text-center text-sm text-red-600">{error}</p>}

                <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleRegister}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                            >
                                Register
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <MobileNavbar />
        </div>
    );
};

export default RegisterPage;