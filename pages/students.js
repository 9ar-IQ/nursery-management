import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch students on load
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/students?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data.students);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      alert('Error loading students');
    }
  };

  return (
    <Layout title="Students">
      <h2>Students</h2>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Add buttons and modals for CRUD here */}
    </Layout>
  );
}
