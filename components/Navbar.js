import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav style={{ background: '#001529', color: 'white', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Nursery Management</div>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <a href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</a>
        <a href="/students" style={{ color: 'white', textDecoration: 'none' }}>Students</a>
        <a href="/transactions" style={{ color: 'white', textDecoration: 'none' }}>Transactions</a>
        <a href="/reports" style={{ color: 'white', textDecoration: 'none' }}>Reports</a>
        <a href="/users" style={{ color: 'white', textDecoration: 'none' }}>Users</a>
        <a href="/settings" style={{ color: 'white', textDecoration: 'none' }}>Settings</a>
        <button onClick={handleLogout} style={{ padding: '6px 16px', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
