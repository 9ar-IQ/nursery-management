import dbConnect from '../../../lib/mongodb';
import Student from '../../../models/Student';
import { authMiddleware } from '../../../lib/auth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { search, status, page = 1, limit = 10 } = req.query;
      
      let query = {};
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { guardian: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (status) {
        query.status = status;
      }

      const students = await Student.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const count = await Student.countDocuments(query);

      res.status(200).json({
        students,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  } else if (req.method === 'POST') {
    try {
      const student = await Student.create(req.body);
      res.status(201).json(student);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create student' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default authMiddleware(handler);
