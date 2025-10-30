import dbConnect from '../../../lib/mongodb';
import Transaction from '../../../models/Transaction';
import { authMiddleware } from '../../../lib/auth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { type, startDate, endDate, page = 1, limit = 10 } = req.query;
      
      let query = {};
      
      if (type) {
        query.type = type;
      }
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const transactions = await Transaction.find(query)
        .sort({ date: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('createdBy', 'username');

      const count = await Transaction.countDocuments(query);

      res.status(200).json({
        transactions,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  } else if (req.method === 'POST') {
    try {
      const transaction = await Transaction.create({
        ...req.body,
        createdBy: req.user.id
      });
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create transaction' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default authMiddleware(handler);
