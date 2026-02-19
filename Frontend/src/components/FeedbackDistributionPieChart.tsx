import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { FeedbackItem } from "../services/adminService";

interface FeedbackDistributionPieChartProps {
  allFeedback: FeedbackItem[];
}

const FeedbackDistributionPieChart = ({ allFeedback }: FeedbackDistributionPieChartProps) => {
  // Count positive and negative feedback
  const positiveCount = allFeedback.filter((item) => item.rating === "positive").length;
  const negativeCount = allFeedback.filter((item) => item.rating === "negative").length;

  const chartData = [
    { name: "Positive", value: positiveCount, color: "#10B981" },
    { name: "Negative", value: negativeCount, color: "#EF4444" },
  ];

  // If no feedback, show empty state
  if (allFeedback.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl shadow-large p-10 border border-gray-800">
        <h3 className="text-2xl font-semibold text-gray-100 mb-6">Feedback Distribution</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-base text-gray-400">No feedback data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl shadow-large p-10 border border-gray-800">
      <h3 className="text-2xl font-semibold text-gray-100 mb-6">Feedback Distribution</h3>
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

export default FeedbackDistributionPieChart;
