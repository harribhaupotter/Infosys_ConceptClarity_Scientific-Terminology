import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, getAllFeedback, type AdminUser, type FeedbackItem } from "../services/adminService";
import { isAdmin } from "../utils/jwt";
import SummaryCards from "../components/SummaryCards";
import TopSearchedTermsBarChart from "../components/TopSearchedTermsBarChart";
import FeedbackDistributionPieChart from "../components/FeedbackDistributionPieChart";
import UserActivityChart from "../components/UserActivityChart";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<{
    user: AdminUser;
    feedback: FeedbackItem[];
  } | null>(null);
  const [showAllFeedback, setShowAllFeedback] = useState(false);

  useEffect(() => {
    // Check if user is admin, redirect if not
    if (!isAdmin()) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, feedbackData] = await Promise.all([
          getAllUsers(),
          getAllFeedback()
        ]);
        setUsers(usersData);
        setAllFeedback(feedbackData);
      } catch (err: any) {
        console.error("Failed to fetch data", err);
        setError(err.message || "Failed to load data");
        // If unauthorized, redirect to login
        if (err.message?.includes("403") || err.message?.includes("Admin")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatSearchHistory = (history: AdminUser["search_history"]): string => {
    if (!history || !Array.isArray(history) || history.length === 0) {
      return "None";
    }
    // Check if first item is a string (legacy format)
    if (typeof history[0] === "string") {
      return history.join(", ");
    }
    // Otherwise, assume it's an array of objects with term property
    return history.map((item: any) => item?.term || JSON.stringify(item)).join(", ");
  };

  const formatArray = (arr: any[] | undefined): string => {
    if (!arr || arr.length === 0) {
      return "None";
    }
    return arr.length.toString();
  };

  const handleFeedbackClick = (user: AdminUser) => {
    if (user.feedback && user.feedback.length > 0) {
      setSelectedFeedback({ user, feedback: user.feedback as FeedbackItem[] });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-300 text-lg">
        Loading users...
      </div>
    );
  }

  if (error && !error.includes("403") && !error.includes("Admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="bg-gray-900 rounded-2xl shadow-large p-10 border border-gray-800">
          <p className="text-red-400 text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/home")}
              className="text-base text-gray-300 hover:text-gray-100 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
            >
              ← Back to Home
            </button>
            <h1 className="text-2xl font-bold text-gray-100">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-base text-gray-300 hover:text-gray-100 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Summary Statistics Cards */}
        <SummaryCards users={users} allFeedback={allFeedback} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <TopSearchedTermsBarChart users={users} />
          <FeedbackDistributionPieChart allFeedback={allFeedback} />
        </div>

        <div className="mb-10">
          <UserActivityChart users={users} />
        </div>

        {/* All Feedback Section */}
        <div className="bg-gray-900 rounded-2xl shadow-large p-10 border border-gray-800 mb-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-100">
              All Feedback
            </h2>
            <button
              onClick={() => setShowAllFeedback(!showAllFeedback)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 font-semibold shadow-medium hover:shadow-large"
            >
              {showAllFeedback ? "Hide" : "Show"} All Feedback ({allFeedback.length})
            </button>
          </div>
          
          {showAllFeedback && (
            <div className="mt-6">
              {allFeedback.length === 0 ? (
                <p className="text-base text-gray-400">No feedback found.</p>
              ) : (
                <div className="space-y-5 max-h-96 overflow-y-auto">
                  {allFeedback.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="bg-gray-800 rounded-xl p-7 border border-gray-700 shadow-soft hover:shadow-medium transition-all"
                    >
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-lg font-semibold text-gray-100">
                              Term: <span className="text-blue-400">{item.term}</span>
                            </h4>
                            <span
                              className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                                item.rating === "positive"
                                  ? "bg-green-600 text-white"
                                  : "bg-red-600 text-white"
                              }`}
                            >
                              {item.rating}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-base text-gray-400">
                            <span>User:</span>
                            <span className={`font-medium ${
                              item.user_email === "guest" 
                                ? "text-yellow-400" 
                                : "text-gray-300"
                            }`}>
                              {item.user_email === "guest" 
                                ? "Anonymous Guest" 
                                : `${item.user_name} (${item.user_email})`}
                            </span>
                          </div>
                        </div>
                        {item.created_at && (
                          <span className="text-sm text-gray-500 font-medium">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {item.reason && (
                        <div className="mb-5">
                          <p className="text-base text-gray-400 mb-2 font-medium">Reason:</p>
                          <p className="text-base text-gray-300 bg-gray-950 p-4 rounded-xl leading-relaxed border border-gray-700">
                            {item.reason}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-base text-gray-400 mb-2 font-medium">Explanation:</p>
                        <div className="bg-gray-950 p-4 rounded-xl border border-gray-700">
                          <p className="text-base text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-large p-10 border border-gray-800">
          <h2 className="text-3xl font-semibold text-gray-100 mb-8">
            All Users
          </h2>

          {users.length === 0 ? (
            <p className="text-base text-gray-400">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-5 text-base text-gray-300 font-semibold">
                      Name
                    </th>
                    <th className="text-left py-4 px-5 text-base text-gray-300 font-semibold">
                      Email
                    </th>
                    <th className="text-left py-4 px-5 text-base text-gray-300 font-semibold">
                      Role
                    </th>
                    <th className="text-left py-4 px-5 text-base text-gray-300 font-semibold">
                      Search History
                    </th>
                    <th className="text-left py-4 px-5 text-base text-gray-300 font-semibold">
                      Saved Items
                    </th>
                    <th className="text-left py-4 px-5 text-base text-gray-300 font-semibold">
                      Feedback
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-5 px-5 text-base text-gray-200">
                        {user.name || "N/A"}
                      </td>
                      <td className="py-5 px-5 text-base text-gray-200">{user.email}</td>
                      <td className="py-5 px-5">
                        <span
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                            user.role === "admin"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-200"
                          }`}
                        >
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className="py-5 px-5 text-base text-gray-300 max-w-xs">
                        <div className="truncate" title={formatSearchHistory(user.search_history)}>
                          {formatSearchHistory(user.search_history)}
                        </div>
                      </td>
                      <td className="py-5 px-5 text-base text-gray-300">
                        {user.role === "admin" ? "N/A" : formatArray(user.saved_items)}
                      </td>
                      <td className="py-5 px-5 text-base text-gray-300">
                        {user.role === "admin" ? (
                          "N/A"
                        ) : user.feedback && user.feedback.length > 0 ? (
                          <button
                            onClick={() => handleFeedbackClick(user)}
                            className="text-blue-400 hover:text-blue-300 underline cursor-pointer font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded transition-all"
                          >
                            {user.feedback.length}
                          </button>
                        ) : (
                          "None"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Feedback Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl shadow-large border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-gray-100">
                Feedback for {selectedFeedback.user.name} ({selectedFeedback.user.email})
              </h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-400 hover:text-gray-200 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto p-8 flex-1">
              {selectedFeedback.feedback.length === 0 ? (
                <p className="text-base text-gray-400 text-center py-8">No feedback available</p>
              ) : (
                <div className="space-y-5">
                  {selectedFeedback.feedback.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="bg-gray-800 rounded-xl p-7 border border-gray-700 shadow-soft hover:shadow-medium transition-all"
                    >
                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-100 mb-3">
                            Term: <span className="text-blue-400">{item.term}</span>
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-base text-gray-400 font-medium">Rating:</span>
                            <span
                              className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                                item.rating === "positive"
                                  ? "bg-green-600 text-white"
                                  : "bg-red-600 text-white"
                              }`}
                            >
                              {item.rating}
                            </span>
                          </div>
                        </div>
                        {item.created_at && (
                          <span className="text-sm text-gray-500 font-medium">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {item.reason && (
                        <div className="mb-5">
                          <p className="text-base text-gray-400 mb-2 font-medium">Reason:</p>
                          <p className="text-base text-gray-300 bg-gray-950 p-4 rounded-xl leading-relaxed border border-gray-700">
                            {item.reason}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-base text-gray-400 mb-2 font-medium">Explanation:</p>
                        <div className="bg-gray-950 p-4 rounded-xl border border-gray-700">
                          <p className="text-base text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
