import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Students() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const getStudents = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('/api/students?limit=1', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(res.data.students);
        console.log(res.data.students);
      } catch (err) {
        console.error(err);
      }
    };
    getStudents();
  }, []);

  return (
    <Layout title="Students">
      <h2>First student:</h2>
      {students.length ? (
        <pre>{JSON.stringify(students[0], null, 2)}</pre>
      ) : <div>No students found.</div>}
    </Layout>
  );
}
