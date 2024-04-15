import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../firebaseAuthServices';
import { getFirestore, doc, collection, setDoc } from "firebase/firestore";
import MobileNavbar
 from '../components/MobileNavbar';
const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const firestore = getFirestore();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const userCredential = await register(email, password);
            console.log('User created');

            const userId = userCredential.user.uid;
            const userDocRef = doc(firestore, `users/${userId}`);
            const workoutsCollectionRef = collection(userDocRef, 'workouts');
            const initialWorkoutDocRef = doc(workoutsCollectionRef);
            await setDoc(initialWorkoutDocRef, { initialized: true });

            navigate('/');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="container mx-auto px-4">
            <h2 className="text-center text-2xl font-bold my-6">Create Account</h2>
            {error && <p className="text-center text-red-500">{error}</p>}
            <form onSubmit={handleRegister} className="max-w-md mx-auto">
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Register
                    </button>
                </div>
            </form>
            <MobileNavbar />
        </div>
    );
};

export default RegisterPage;