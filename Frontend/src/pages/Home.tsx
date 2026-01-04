import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { explainTerm } from "../services/searchService";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setExplanation("");

    try {
      const response = await explainTerm(searchTerm);
      setExplanation(response.explanation);
    } catch (error) {
      setExplanation("Sorry, an error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div></div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/profile")}
            className="text-xl text-gray-300 hover:text-gray-100 font-semibold px-4 py-2 hover:underline"
          >
            Profile
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
      <main
        className="flex flex-col items-center justify-center px-4"
        style={{ minHeight: "calc(100vh - 140px)" }}
      >
        <div className="w-full max-w-3xl">
          {/* App Title */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-gray-100 mb-2">
              Scientific Terminologies Simplified
            </h1>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-10">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-8 py-6 text-xl bg-gray-900 text-gray-100 border border-gray-700 rounded-full shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-600 transition-colors placeholder-gray-500"
                placeholder="Enter a scientific term to explain..."
                autoFocus
              />
            </div>
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="px-12 py-4 text-lg font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Explaining..." : "Explain"}
              </button>
            </div>
          </form>

          {/* Explanation Output */}
          {explanation && (
            <div className="mt-10 p-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">
                Explanation
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap">
                {explanation}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
