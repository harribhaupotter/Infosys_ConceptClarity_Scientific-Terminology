import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { AdminUser } from "../services/adminService";

interface TopSearchedTermsBarChartProps {
  users: AdminUser[];
}

const TopSearchedTermsBarChart = ({ users }: TopSearchedTermsBarChartProps) => {
  // Extract all search terms from users' search_history
  const termCounts: Record<string, number> = {};

  users.forEach((user) => {
    if (user.search_history && Array.isArray(user.search_history)) {
      user.search_history.forEach((item) => {
        let term: string;
        if (typeof item === "string") {
          term = item;
        } else if (item && typeof item === "object" && "term" in item) {
          term = item.term;
        } else {
          return;
        }

        if (term) {
          termCounts[term] = (termCounts[term] || 0) + 1;
        }
      });
    }
  });

  // Convert to array and sort by count, take top 10
  const chartData = Object.entries(termCounts)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl shadow-large p-10 border border-gray-800">
        <h3 className="text-2xl font-semibold text-gray-100 mb-6">Top Searched Terms</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-base text-gray-400">No search data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl shadow-large p-10 border border-gray-800">
      <h3 className="text-2xl font-semibold text-gray-100 mb-6">Top Searched Terms</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="term"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            interval={0}
          />
          <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
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
          <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Search Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopSearchedTermsBarChart;
