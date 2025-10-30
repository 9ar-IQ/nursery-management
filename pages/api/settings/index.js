import dbConnect from '../../../lib/mongodb';
import Settings from '../../../models/Settings';
import { authMiddleware } from '../../../lib/auth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      let settings = await Settings.findOne();
      
      if (!settings) {
        settings = await Settings.create({
          nurseryName: 'My Nursery',
          currency: 'KWD',
          timezone: 'Asia/Kuwait',
          categories: {
            income: ['Tuition Fee', 'Registration Fee', 'Activity Fee'],
            expense: ['Salaries', 'Utilities', 'Supplies', 'Maintenance']
          },
          paymentMethods: ['cash', 'card', 'bank_transfer', 'cheque'],
          classes: ['Nursery 1', 'Nursery 2', 'Pre-KG', 'KG1', 'KG2']
        });
      }
      
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  } else if (req.method === 'PUT') {
    try {
      let settings = await Settings.findOne();
      
      if (!settings) {
        settings = await Settings.create(req.body);
      } else {
        settings = await Settings.findOneAndUpdate({}, req.body, { new: true });
      }
      
      res.status(200).json(settings);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update settings' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default authMiddleware(handler);
