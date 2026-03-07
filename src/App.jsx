import { useEffect, useState } from 'react'
import PortfolioChart from './components/PortfolioChart'
import portfoliosData from '../data/portfolios.json'
import pricesData from '../data/prices.json'

function PortfolioCard({ portfolio: p }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      backgroundColor: '#0f172a',
      border: `1px solid ${p.color}44`,
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '12px', height: '12px', borderRadius: '50%',
            backgroundColor: p.color, flexShrink: 0
          }} />
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>{p.name}</span>
        </div>
        <span style={{ color: '#475569', fontSize: '1rem' }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '0 1.25rem 1.25rem', borderTop: `1px solid ${p.color}22` }}>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '1rem 0' }}>
            {p.description || 'No description yet.'}
          </p>

          {p.fee && (
            <div style={{
              display: 'inline-block',
              backgroundColor: '#1e293b',
              borderRadius: '6px',
              padding: '0.3rem 0.75rem',
              fontSize: '0.8rem',
              color: '#94a3b8',
              marginBottom: '1rem'
            }}>
              {'Blended fee: '}
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{p.fee}</span>
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ color: '#475569', textAlign: 'left' }}>
                <th style={{ paddingBottom: '0.5rem' }}>Ticker</th>
                <th style={{ paddingBottom: '0.5rem' }}>Weight</th>
                <th style={{ paddingBottom: '0.5rem' }}>Allocation</th>
              </tr>
            </thead>
            <tbody>
              {p.holdings.map(h => (
                <tr key={h.ticker}>
                  <td style={{ padding: '0.3rem 0', color: '#e2e8f0', fontWeight: 600 }}>
                    {h.ticker}
                  </td>
                  <td style={{ color: '#94a3b8' }}>
                    {(h.weight * 100).toFixed(0)}%
                  </td>
                  <td style={{ width: '50%' }}>
                    <div style={{
                      height: '6px', borderRadius: '3px',
                      backgroundColor: p.color,
                      width: `${h.weight * 100}%`,
                      opacity: 0.7
                    }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const TIME_PERIODS = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: 'All', months: null },
]

function getStartDateForPeriod(months) {
  if (!months) return null
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d.toISOString().slice(0, 10)
}

function buildChartData(periodStartDate) {
  const vtData = pricesData['VT']
  if (!vtData) return []

  const allDates = Object.keys(vtData).sort()
  if (allDates.length === 0) return []

  const filteredDates = periodStartDate
    ? allDates.filter(d => d >= periodStartDate)
    : allDates

  if (filteredDates.length === 0) return []

  const activePortfolios = portfoliosData.filter(p => p.active)
  const windowStart = filteredDates[0]

  return filteredDates.map((date) => {
    const row = { date }

    const vtStartPrice = vtData[windowStart]
    if (vtData[date] && vtStartPrice) {
      row['VT'] = vtData[date] / vtStartPrice
    }

    for (const portfolio of activePortfolios) {
      let value = 0
      let valid = true

      for (const { ticker, weight } of portfolio.holdings) {
        const tickerData = pricesData[ticker]
        if (!tickerData) { valid = false; break }
        const startPrice = tickerData[windowStart]
        const currentPrice = tickerData[date]
        if (!startPrice || !currentPrice) { valid = false; break }
        value += weight * (currentPrice / startPrice)
      }

      if (valid) row[portfolio.id] = value
    }

    return row
  })
}

export default function App() {
  const [selectedPeriod, setSelectedPeriod] = useState('6M')
  const [chartData, setChartData] = useState(null)
  const activePortfolios = portfoliosData.filter(p => p.active)
  const hasVT = !!pricesData['VT']

  useEffect(() => {
    const period = TIME_PERIODS.find(p => p.label === selectedPeriod)
    const startDate = getStartDateForPeriod(period.months)
    const data = buildChartData(startDate)
    setChartData(data)
  }, [selectedPeriod])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0f1e',
      color: '#e2e8f0',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
        LLM Portfolio Tracker
      </h1>

      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Inspired by the FT article{' '}
        <a
          href="https://www.ft.com/content/000d33c8-efc5-46cc-a213-e153b3f6a250"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#94a3b8', textDecoration: 'underline' }}
        >
          Dear ChatGPT, please construct me an optimal portfolio
        </a>
        {' by Stuart Kirk, this tracks how the top 5 LLM models perform long term against a global benchmark. Portfolios are rebalanced quarterly.'}
      </p>

      <div style={{
        backgroundColor: '#0f172a',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {TIME_PERIODS.map(({ label }) => (
            <button
              key={label}
              onClick={() => setSelectedPeriod(label)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                backgroundColor: selectedPeriod === label ? '#3b82f6' : '#1e293b',
                color: selectedPeriod === label ? '#fff' : '#94a3b8',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {!hasVT && (
          <p style={{ color: '#f59e0b', fontSize: '0.8rem', marginBottom: '1rem' }}>
            VT data not found — run python3 scripts/fetch_prices.py to add it
          </p>
        )}

        {chartData === null ? (
          <p style={{ color: '#64748b' }}>Loading chart...</p>
        ) : chartData.length === 0 ? (
          <p style={{ color: '#ef4444' }}>
            No price data found. Make sure you ran: python3 scripts/fetch_prices.py
          </p>
        ) : (
          <PortfolioChart chartData={chartData} portfolios={activePortfolios} />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
        {activePortfolios.map((p) => (
          <PortfolioCard key={p.id} portfolio={p} />
        ))}
      </div>
    </div>
  )
}