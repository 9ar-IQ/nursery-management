import dbConnect from '../../lib/mongodb';
import Transaction from '../../models/Transaction';
import Student from '../../models/Student';
import { authMiddleware } from '../../lib/auth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { startDate, endDate } = req.query;
      
      let dateQuery = {};
      if (startDate || endDate) {
        dateQuery.date = {};
        if (startDate) dateQuery.date.$gte = new Date(startDate);
        if (endDate) dateQuery.date.$lte = new Date(endDate);
      }

      const income = await Transaction.aggregate([
        { $match: { ...dateQuery, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const expenses = await Transaction.aggregate([
        { $match: { ...dateQuery, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const incomeByCategory = await Transaction.aggregate([
        { $match: { ...dateQuery, type: 'income' } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);

      const expensesByCategory = await Transaction.aggregate([
        { $match: { ...dateQuery, type: 'expense' } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);

      const transactions = await Transaction.find(dateQuery).sort({ date: -1 });

      res.status(200).json({
        summary: {
          totalIncome: income[0]?.total || 0,
          totalExpenses: expenses[0]?.total || 0,
          netProfit: (income[0]?.total || 0) - (expenses[0]?.total || 0)
        },
        incomeByCategory,
        expensesByCategory,
        transactions
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate report' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default authMiddleware(handler);
