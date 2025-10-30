import dbConnect from '../../../lib/mongodb';
import Student from '../../../models/Student';
import { authMiddleware } from '../../../lib/auth';

async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.status(200).json(student);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch student' });
    }
  } else if (req.method === 'PUT') {
    try {
      const student = await Student.findByIdAndUpdate(id, req.body, { new: true });
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.status(200).json(student);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update student' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const student = await Student.findByIdAndDelete(id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete student' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default authMiddleware(handler);
