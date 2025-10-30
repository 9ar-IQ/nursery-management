import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

// Modal for Create/Edit student
function StudentModal({ visible, onClose, onSave, student }) {
  const [form, setForm] = useState({
    name: '',
    guardian: '',
    mobile: '',
    class: '',
    allergies: '',
    status: 'active'
  });

  useEffect(() => {
    if (student) {
      setForm(student);
    } else {
      setForm({
        name: '',
        guardian: '',
        mobile: '',
        class: '',
        allergies: '',
        status: 'active'
      });
    }
  }, [student]);

  if (!visible) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99
    }}>
      <div style={{ background: 'white', padding: 32, borderRadius: 6, width: 400 }}>
        <h2>{student ? 'Edit Student' : 'Add Student'}</h2>
        <form onSubmit={handleSubmit}>
          {['name','guardian','mobile','class','allergies'].map(field =>
            <div key={field} style={{ marginBottom: 12 }}>
              <input
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={form[field] || ''}
                onChange={handleChange}
                required={['name','guardian','mobile','class'].includes(field)}
                style={{ width: '100%', padding: 8 }}
              />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <select name="status" value={form.status} onChange={handleChange} style={{ width: '100%', padding: 8 }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 20px' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 20px', background: '#1890ff', color: 'white', border: 'none' }}>
              {student ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  // Fetch students from API
  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, [page]);

  const fetchStudents = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/students?search=${search}&limit=10&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data.students);
      setLoading(false);
    } catch (err) {
      setError('Error loading students');
      setLoading(false);
    }
  };

  // Save/create/edit student
  const saveStudent = async (form) => {
    setError('');
    const token = localStorage.getItem('token');
    try {
      if (editingStudent) {
        await axios.put(`/api/students/${editingStudent._id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`/api/students`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setModalVisible(false);
      setEditingStudent(null);
      fetchStudents();
    } catch {
      setError('Error saving student');
    }
  };

  // Delete student
  const deleteStudent = async (id) => {
    const token = localStorage.getItem('token');
    if (window.confirm('Delete this student?')) {
      try {
        await axios.delete(`/api/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchStudents();
      } catch {
        setError('Error deleting student');
      }
    }
  };

  return (
    <Layout title="Students">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyUp={e => { if (e.key === 'Enter') fetchStudents(); }}
          style={{ padding: '8px', width: 200 }}
        />
        <button style={{ background: '#52c41a', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 4 }}
          onClick={() => { setEditingStudent(null); setModalVisible(true); }}>
          Add Student
        </button>
      </div>
      {error && <div style={{ color: '#ff4d4f', marginBottom: 10 }}>{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Guardian</th>
              <th>Mobile</th>
              <th>Class</th>
              <th>Allergies</th>
              <th>Status</th>
              <th style={{ minWidth: 120 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.guardian}</td>
                <td>{s.mobile}</td>
                <td>{s.class}</td>
                <td>{s.allergies}</td>
                <td>{s.status}</td>
                <td>
                  <button style={{ marginRight: 8, color: "#1890ff", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => { setEditingStudent(s); setModalVisible(true); }}>
                    Edit
                  </button>
                  <button style={{ color: "#ff4d4f", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => deleteStudent(s._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>No students found.</td></tr>
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
      <StudentModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingStudent(null); }}
        onSave={saveStudent}
        student={editingStudent}
      />
    </Layout>
  );
}
