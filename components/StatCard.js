export default function StatCard({ title, value, color }) {
  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '30px', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}
