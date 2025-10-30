// pages/users.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

function UserModal({ visible, onClose, onSave, user }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'staff',
    status: 'active'
  });

  useEffect(() => {
    setForm(user || {
      username: '',
      password: '',
      role: 'staff',
      status: 'active'
    });
  }, [user]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99
    }}>
      <div style={{ background: 'white', padding: 32, borderRadius: 6, width: 400 }}>
        <h2>{user ? 'Edit' : 'Add'} User</h2>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <input name="username" placeholder="Username"
            value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
            required style={{ width: '100%', marginBottom: 12 }} />
          <input type="password" name="password" placeholder="Password"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            required={!user} style={{ width: '100%', marginBottom: 12 }} />
          <select name="role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
            style={{ width: '100%', marginBottom: 12 }}>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="viewer">Viewer</option>
          </select>
          <select name="status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
            style={{ width: '100%', marginBottom: 12 }}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 20px' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 20px', background: '#1890ff', color: 'white', border: 'none' }}>
              {user ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/users?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      setError('Error loading users (admin access required)');
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const saveUser = async (form) => {
    setError('');
    const token = localStorage.getItem('token');
    try {
      if (editingUser) {
        await axios.put(`/api/users/${editingUser._id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`/api/users`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setModalVisible(false);
      setEditingUser(null);
      fetchUsers();
    } catch {
      setError('Error saving user');
    }
  };

  const deleteUser = async (id) => {
    const token = localStorage.getItem('token');
    if (window.confirm('Delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
      } catch {
        setError('Error deleting user');
      }
    }
  };

  return (
    <Layout title="Users">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={{ background: '#52c41a', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 4 }}
          onClick={() => { setEditingUser(null); setModalVisible(true); }}>
          Add User
        </button>
      </div>
      {error && <div style={{ color: '#ff4d4f', marginBottom: 10 }}>{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th style={{ minWidth: 120 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>{u.status}</td>
                <td>
                  <button style={{ marginRight: 8, color: "#1890ff", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => { setEditingUser(u); setModalVisible(true); }}>
                    Edit
                  </button>
                  <button style={{ color: "#ff4d4f", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => deleteUser(u._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {/* Modal */}
      <UserModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingUser(null); }}
        onSave={saveUser}
        user={editingUser}
      />
    </Layout>
  );
}
