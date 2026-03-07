import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export default function PortfolioChart({ chartData, portfolios }) {
  if (!chartData.length) return <p>Loading chart...</p>

  // Calculate min/max across all values in the current window
  const allValues = chartData.flatMap(row =>
    Object.entries(row)
      .filter(([key]) => key !== 'date')
      .map(([, val]) => val)
      .filter(v => typeof v === 'number' && !isNaN(v))
  )

  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)
  const padding = (maxVal - minVal) * 0.1 || 0.01

  const yMin = Math.floor((minVal - padding) * 100) / 100
  const yMax = Math.ceil((maxVal + padding) * 100) / 100

  return (
    <ResponsiveContainer width="100%" height={450}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickFormatter={(d) => d.slice(0, 7)}
          interval={Math.floor(chartData.length / 6)}
        />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickFormatter={(v) => (v * 100).toFixed(1)}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
          labelStyle={{ color: '#94a3b8' }}
          formatter={(value, name) => [
            (value * 100).toFixed(1), name
          ]}
        />
        <Legend />

        {/* Benchmark */}
        <Line
          type="monotone"
          dataKey="VT"
          name="World (VT)"
          stroke="#f59e0b"
          dot={false}
          strokeWidth={2}
          strokeDasharray="5 5"
        />

        {/* One line per portfolio */}
        {portfolios.map((p) => (
          <Line
            key={p.id}
            type="monotone"
            dataKey={p.id}
            name={p.name}
            stroke={p.color}
            dot={false}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}