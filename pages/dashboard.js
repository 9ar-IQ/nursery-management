import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    income: 0,
    expenses: 0,
    users: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [studentsRes, transactionsRes, usersRes] = await Promise.all([
        axios.get('/api/students?limit=1000', { headers }),
        axios.get('/api/transactions?limit=1000', { headers }),
        axios.get('/api/users', { headers })
      ]);

      const income = transactionsRes.data.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactionsRes.data.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      setStats({
        students: studentsRes.data.total,
        income,
        expenses,
        users: usersRes.data.length
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <Layout title="Dashboard">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <StatCard title="Total Students" value={stats.students} color="#1890ff" />
        <StatCard title="Total Income" value={`${stats.income.toFixed(3)} KWD`} color="#52c41a" />
        <StatCard title="Total Expenses" value={`${stats.expenses.toFixed(3)} KWD`} color="#ff4d4f" />
        <StatCard title="Total Users" value={stats.users} color="#722ed1" />
      </div>
      {/* Shortcut navigation or links to other pages here */}
    </Layout>
  );
}
