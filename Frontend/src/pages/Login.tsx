import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from "../services/authService";
import { decodeJWT } from "../utils/jwt";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');


    try {
      await login(email, password);
      // Decode token to check role and redirect accordingly
      const token = localStorage.getItem("token");
      if (token) {
        const payload = decodeJWT(token);
        if (payload?.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        navigate("/home");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-gray-900 rounded-2xl shadow-large p-12 space-y-10 border border-gray-800">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-100 mb-4 leading-tight">
              Scientific Terminologies
            </h1>
            <p className="text-lg text-gray-400">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-7">
            <div>
              <label htmlFor="email" className="block text-base font-semibold text-gray-200 mb-3">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 text-base bg-gray-800 text-gray-100 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 hover:border-gray-600 transition-all shadow-soft"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-semibold text-gray-200 mb-3">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 text-base bg-gray-800 text-gray-100 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 hover:border-gray-600 transition-all shadow-soft"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="text-base text-red-400 text-center font-semibold py-3 px-4 bg-red-900/20 rounded-xl border border-red-800/50">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 text-lg font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all shadow-medium hover:shadow-large"
            >
              Sign In
            </button>
          </form>

          <div className="text-center text-base">
            <span className="text-gray-400">Don't have an account? </span>
            <Link to="/signup" className="text-blue-400 font-semibold hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

