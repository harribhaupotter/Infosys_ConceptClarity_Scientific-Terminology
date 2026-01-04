import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from "../services/authService";


const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signup(name, email, password);
      navigate("/login"); // redirect after successful signup
    } catch (err: any) {
      setError(err.message || "Signup failed");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-gray-900 rounded-2xl shadow-xl p-10 space-y-8 border border-gray-800">
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-gray-100 mb-3">
              Scientific Terminologies
            </h1>
            <p className="text-base text-gray-400">Create your account</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-base font-medium text-gray-200 mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 text-lg bg-gray-800 text-gray-100 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-base font-medium text-gray-200 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 text-lg bg-gray-800 text-gray-100 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 text-lg bg-gray-800 text-gray-100 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="text-base text-red-400 text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 text-lg font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
            >
              Sign Up
            </button>
          </form>

          <div className="text-center text-base">
            <span className="text-gray-400">Already have an account? </span>
            <Link to="/login" className="text-blue-400 font-medium hover:text-blue-300 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

