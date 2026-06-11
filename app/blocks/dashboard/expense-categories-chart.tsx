import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

interface ExpenseCategoriesChartProps {
  groupedExpenses: { [key: string]: number };
}

const ExpenseCategoriesChart: React.FC<ExpenseCategoriesChartProps> = ({ groupedExpenses }) => {
  const data = Object.keys(groupedExpenses).map(key => ({
    name: key,
    value: groupedExpenses[key],
  }));

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseCategoriesChart;