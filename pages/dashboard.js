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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard title="Total Students" value={stats.students} color="#1890ff" />
        <StatCard title="Total Income" value={`${stats.income.toFixed(3)} KWD`} color="#52c41a" />
        <StatCard title="Total Expenses" value={`${stats.expenses.toFixed(3)} KWD`} color="#ff4d4f" />
        <StatCard title="Total Users" value={stats.users} color="#722ed1" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        <a href="/students" style={{ padding: '20px', background: '#fff', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', color: '#333', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3>Students</h3>
          <p>Manage student records</p>
        </a>
        <a href="/transactions" style={{ padding: '20px', background: '#fff', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', color: '#333', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3>Transactions</h3>
          <p>Track income & expenses</p>
        </a>
        <a href="/reports" style={{ padding: '20px', background: '#fff', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', color: '#333', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3>Reports</h3>
          <p>View financial reports</p>
        </a>
        <a href="/users" style={{ padding: '20px', background: '#fff', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', color: '#333', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3>Users</h3>
          <p>Manage system users</p>
        </a>
        <a href="/settings" style={{ padding: '20px', background: '#fff', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', color: '#333', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3>Settings</h3>
          <p>Configure system</p>
        </a>
      </div>
    </Layout>
  );
}
