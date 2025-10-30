import dbConnect from '../../lib/mongodb';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    const admin = await User.create({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      permissions: {
        students: { view: true, create: true, edit: true, delete: true },
        transactions: { view: true, create: true, edit: true, delete: true },
        reports: { view: true, export: true },
        users: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, edit: true }
      }
    });

    res.status(201).json({ message: 'Admin created successfully', username: 'admin' });
  } catch (error) {
    res.status(500).json({ error: 'Setup failed' });
  }
}
