import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile } from "../services/userService";

interface User {
  name: string;
  email: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setUser(response); // ✅ FIXED
      } catch (error) {
        console.error("Failed to fetch profile", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);


  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-300">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-gray-900 rounded-2xl shadow-xl p-10 border border-gray-800">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-5 flex justify-between items-center">
          <button
            onClick={() => navigate("/home")}
            className="text-xl text-gray-300 hover:text-gray-100 font-semibold px-4 py-2 hover:underline"
          >
            ← Back to Home
          </button>
          <button
            onClick={handleLogout}
            className="text-xl text-gray-300 hover:text-gray-100 font-semibold px-4 py-2 hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-gray-900 rounded-2xl shadow-xl p-10 border border-gray-800">
          <h1 className="text-4xl font-semibold text-gray-100 mb-10">
            Profile
          </h1>

          <div className="space-y-6 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-100 mb-2">
                {user.name}
              </h2>
              <p className="text-lg text-gray-400">{user.email}</p>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full bg-blue-600 text-white py-4 text-lg font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
