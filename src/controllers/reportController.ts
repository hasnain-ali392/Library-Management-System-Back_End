import { Request, Response } from 'express';
import { Book } from '../models/Book';
import { Issue } from '../models/Issue';
import { User } from '../models/User';
import { Fine } from '../models/Fine';

export const getDashboardStats = async (req: Request, res: Response) => {
  const totalBooks = await Book.countDocuments();
  const totalUsers = await User.countDocuments({ role: 'user' });
  const activeIssues = await Issue.countDocuments({ status: 'issued' });
  
  const finesResult = await Fine.aggregate([
    { $match: { status: 'pending' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const pendingFines = finesResult.length > 0 ? finesResult[0].total : 0;

  res.json({
    success: true,
    data: {
      totalBooks,
      totalUsers,
      activeIssues,
      pendingFines
    }
  });
};
