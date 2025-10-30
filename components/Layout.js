import Navbar from './Navbar';

export default function Layout({ children, title }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {title && <h1 style={{ marginBottom: '20px', color: '#333' }}>{title}</h1>}
        {children}
      </div>
    </div>
  );
}
