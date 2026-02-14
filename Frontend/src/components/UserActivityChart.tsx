import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { AdminUser } from "../services/adminService";

interface UserActivityChartProps {
  users: AdminUser[];
}

const UserActivityChart = ({ users }: UserActivityChartProps) => {
  // Filter out admin users
  const regularUsers = users.filter((user) => user.role !== "admin");

  // Count users with and without searches
  const usersWithSearches = regularUsers.filter((user) => {
    return user.search_history && Array.isArray(user.search_history) && user.search_history.length > 0;
  }).length;

  const usersWithoutSearches = regularUsers.length - usersWithSearches;

  const chartData = [
    { name: "Users with Searches", value: usersWithSearches, color: "#3B82F6" },
    { name: "Users without Searches", value: usersWithoutSearches, color: "#6B7280" },
  ];

  // If no users, show empty state
  if (regularUsers.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl shadow-large p-10 border border-gray-800">
        <h3 className="text-2xl font-semibold text-gray-100 mb-6">User Activity Distribution</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-base text-gray-400">No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl shadow-large p-10 border border-gray-800">
      <h3 className="text-2xl font-semibold text-gray-100 mb-6">User Activity Distribution</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#F3F4F6",
            }}
            labelStyle={{ color: "#9CA3AF" }}
          />
          <Legend wrapperStyle={{ color: "#9CA3AF" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserActivityChart;
