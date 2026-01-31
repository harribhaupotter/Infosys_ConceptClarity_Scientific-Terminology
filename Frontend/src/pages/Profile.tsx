import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile } from "../services/userService";
import { getSavedExplanations, deleteSavedExplanation, type SavedExplanation } from "../services/saveService";

interface User {
  name: string;
  email: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedExplanations, setSavedExplanations] = useState<SavedExplanation[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

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

    const fetchSavedExplanations = async () => {
      try {
        const data = await getSavedExplanations();
        setSavedExplanations(data);
      } catch (error) {
        console.error("Failed to fetch saved explanations", error);
      } finally {
        setLoadingSaved(false);
      }
    };

    fetchProfile();
    fetchSavedExplanations();
  }, [navigate]);


  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDelete = async (term: string) => {
    if (!window.confirm(`Are you sure you want to delete the saved explanation for "${term}"?`)) {
      return;
    }

    try {
      await deleteSavedExplanation(term);
      // Refresh saved explanations
      const data = await getSavedExplanations();
      setSavedExplanations(data);
    } catch (error: any) {
      console.error("Failed to delete saved explanation:", error);
      alert(`Failed to delete saved explanation: ${error.message || "Please try again."}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-300 text-lg">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-gray-900 rounded-2xl shadow-large p-10 border border-gray-800">
          <p className="text-lg text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800/50">
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <button
            onClick={() => navigate("/home")}
            className="text-base text-gray-300 hover:text-gray-100 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
          >
            ← Back to Home
          </button>
          <button
            onClick={handleLogout}
            className="text-base text-gray-300 hover:text-gray-100 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-gray-900 rounded-2xl shadow-large p-12 border border-gray-800">
          <h1 className="text-4xl font-semibold text-gray-100 mb-12">
            Profile
          </h1>

          <div className="space-y-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-100 mb-3">
                {user.name}
              </h2>
              <p className="text-lg text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Saved Explanations Section */}
          <div className="pt-10 border-t border-gray-800 mb-12">
            <h2 className="text-2xl font-semibold text-gray-100 mb-8">
              Saved Explanations
            </h2>
            {loadingSaved ? (
              <p className="text-base text-gray-400">Loading saved explanations...</p>
            ) : savedExplanations.length === 0 ? (
              <p className="text-base text-gray-400">No saved explanations yet.</p>
            ) : (
              <div className="space-y-5">
                {savedExplanations.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-xl p-7 border border-gray-700 hover:border-gray-600 transition-all shadow-soft hover:shadow-medium"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-100 flex-1">
                        {item.term}
                      </h3>
                      <div className="flex items-center gap-4">
                        {item.saved_at && (
                          <span className="text-sm text-gray-400 font-medium">
                            {new Date(item.saved_at).toLocaleDateString()}
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(item.term)}
                          className="p-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 active:bg-red-900/30 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                          aria-label={`Delete saved explanation for ${item.term}`}
                          title="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-10 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full bg-blue-600 text-white py-4 text-lg font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all shadow-medium hover:shadow-large"
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
