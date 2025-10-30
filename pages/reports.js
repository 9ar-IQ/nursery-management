// pages/reports.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line
  }, [startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/reports?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(res.data);
      setLoading(false);
    } catch {
      setError('Error loading reports');
      setLoading(false);
    }
  };

  const exportExcel = () => {
    // For MVP, quickly export JSON as text file
    const blob = new Blob([JSON.stringify(summary.transactions, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transactions.json';
    link.click();
  };

  return (
    <Layout title="Reports">
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <button style={{ background: '#1890ff', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 4 }}
          onClick={fetchReport}>Filter</button>
        <button style={{ background: '#52c41a', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 4 }}
          onClick={exportExcel}>Export</button>
      </div>
      {error && <div style={{ color: '#ff4d4f', marginBottom: 10 }}>{error}</div>}
      {loading ? <p>Loading...</p> : summary && (
        <>
          <h3>Summary</h3>
          <div>
            Total Income: <strong>{summary.summary.totalIncome} KWD</strong><br/>
            Total Expenses: <strong>{summary.summary.totalExpenses} KWD</strong><br/>
            Net Profit: <strong>{summary.summary.netProfit} KWD</strong>
          </div>
          <h4>Income by Category</h4>
          <ul>
            {summary.incomeByCategory.map(c => (
              <li key={c._id}>{c._id}: {c.total} ({c.count} txns)</li>
            ))}
          </ul>
          <h4>Expenses by Category</h4>
          <ul>
            {summary.expensesByCategory.map(c => (
              <li key={c._id}>{c._id}: {c.total} ({c.count} txns)</li>
            ))}
          </ul>
          <h4>Transactions</h4>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Payment</th>
                <th>Source</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {summary.transactions.map(t => (
                <tr key={t._id}>
                  <td>{(new Date(t.date)).toLocaleDateString()}</td>
                  <td>{t.type}</td>
                  <td>{t.amount}</td>
                  <td>{t.category}</td>
                  <td>{t.paymentMethod}</td>
                  <td>{t.source}</td>
                  <td>{t.description}</td>
                </tr>
              ))}
              {summary.transactions.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center' }}>No transactions found.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </Layout>
  );
}
