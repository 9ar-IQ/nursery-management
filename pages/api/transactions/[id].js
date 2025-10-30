import dbConnect from '../../../lib/mongodb';
import Transaction from '../../../models/Transaction';
import { authMiddleware } from '../../../lib/auth';

async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const transaction = await Transaction.findById(id).populate('createdBy', 'username');
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.status(200).json(transaction);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  } else if (req.method === 'PUT') {
    try {
      const transaction = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.status(200).json(transaction);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update transaction' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const transaction = await Transaction.findByIdAndDelete(id);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default authMiddleware(handler);
