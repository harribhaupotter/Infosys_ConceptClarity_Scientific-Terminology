import type { AdminUser, FeedbackItem } from "../services/adminService";

interface SummaryCardsProps {
  users: AdminUser[];
  allFeedback: FeedbackItem[];
}

const SummaryCards = ({ users, allFeedback }: SummaryCardsProps) => {
  // Calculate total searches from all users' search_history
  const totalSearches = users.reduce((total, user) => {
    if (user.search_history && Array.isArray(user.search_history)) {
      return total + user.search_history.length;
    }
    return total;
  }, 0);

  // Calculate total saved items
  const totalSavedItems = users.reduce((total, user) => {
    if (user.saved_items && Array.isArray(user.saved_items)) {
      return total + user.saved_items.length;
    }
    return total;
  }, 0);

  // Filter out admin users for user count
  const regularUsers = users.filter((user) => user.role !== "admin");

  const stats = [
    {
      label: "Total Users",
      value: regularUsers.length,
      icon: "👥",
      color: "bg-blue-600",
    },
    {
      label: "Total Searches",
      value: totalSearches,
      icon: "🔍",
      color: "bg-purple-600",
    },
    {
      label: "Total Feedback",
      value: allFeedback.length,
      icon: "💬",
      color: "bg-green-600",
    },
    {
      label: "Total Saved Items",
      value: totalSavedItems,
      icon: "⭐",
      color: "bg-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-gray-900 rounded-2xl shadow-large p-6 border border-gray-800 hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-100 mb-1">{stat.value}</p>
            <p className="text-base text-gray-400 font-medium">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
