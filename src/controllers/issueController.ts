import { Request, Response } from 'express';
import { Issue } from '../models/Issue';
import { Book } from '../models/Book';
import { User } from '../models/User';
import { Fine } from '../models/Fine';
import { AuthRequest } from '../middleware/authenticate';

// User-initiated book borrowing (without admin authorization)
export const userBorrowBook = async (req: AuthRequest, res: Response) => {
  const { bookId, returnDate } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    res.status(401);
    throw new Error('User authentication required');
  }

  // Pre-flight: validate the target book + user exist (read-only checks)
  const book = await Book.findById(bookId);
  if (!book || !book.isActive) {
    res.status(404);
    throw new Error('Book not found or inactive');
  }

  const user = await User.findById(userId);
  if (!user || !user.isActive || user.isSuspended) {
    res.status(400);
    throw new Error('User account is not valid for borrowing books');
  }

  // Guardrail: cap simultaneous active loans to prevent abuse
  const MAX_ACTIVE_LOANS = 5;
  const activeLoanCount = await Issue.countDocuments({ userId, status: 'issued' });
  if (activeLoanCount >= MAX_ACTIVE_LOANS) {
    res.status(400);
    throw new Error(`You have reached the maximum active loan limit (${MAX_ACTIVE_LOANS}). Return a book to borrow more.`);
  }

  // Guardrail: prevent the same user from holding the same book twice
  const existingIssue = await Issue.findOne({ userId, bookId, status: 'issued' });
  if (existingIssue) {
    res.status(400);
    throw new Error('You already have this book borrowed');
  }

  // Calculate return date (default 14 days from now)
  const calculatedReturnDate = returnDate ? new Date(returnDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(calculatedReturnDate.getTime())) {
    res.status(400);
    throw new Error('Invalid return date');
  }

  if (calculatedReturnDate.getTime() <= Date.now()) {
    res.status(400);
    throw new Error('Return date must be in the future');
  }

  // Atomic stock decrement: only succeeds if the book is still in stock
  // This prevents the classic race condition where two concurrent borrows both
  // pass the `available < 1` check and then both succeed in over-issuing the book.
  const decrementedBook = await Book.findOneAndUpdate(
    { _id: bookId, isActive: true, available: { $gt: 0 } },
    { $inc: { available: -1, currentlyIssued: 1, totalIssued: 1 } },
    { new: true }
  );

  if (!decrementedBook) {
    res.status(400);
    throw new Error('Book is currently out of stock');
  }

  let createdIssue;
  try {
    createdIssue = await Issue.create({
      userId,
      bookId,
      returnDate: calculatedReturnDate,
    });

    await User.findByIdAndUpdate(userId, { $inc: { totalBooksIssued: 1 } });
  } catch (err) {
    // Compensating action: roll back the stock decrement if the issue creation failed
    await Book.findByIdAndUpdate(bookId, { $inc: { available: 1, currentlyIssued: -1, totalIssued: -1 } });
    throw err;
  }

  // Return the issue with book and user populated for immediate client use
  const populatedIssue = await Issue.findById(createdIssue._id)
    .populate('bookId', 'title author isbn bookImage')
    .populate('userId', 'name email');

  res.status(201).json({
    success: true,
    message: 'Book borrowed successfully',
    data: populatedIssue
  });
};

export const issueBook = async (req: AuthRequest, res: Response) => {
  const { userId, bookId, returnDate } = req.body;

  const book = await Book.findById(bookId);
  if (!book || !book.isActive) {
    res.status(404);
    throw new Error('Book not found or inactive');
  }

  if (book.available < 1) {
    res.status(400);
    throw new Error('Book is currently out of stock');
  }

  const user = await User.findById(userId);
  if (!user || !user.isActive || user.isSuspended) {
    res.status(400);
    throw new Error('User not valid for issuing books');
  }

  // Check if user already has this book issued and not returned
  const existingIssue = await Issue.findOne({ userId, bookId, status: 'issued' });
  if (existingIssue) {
    res.status(400);
    throw new Error('User already has this book issued');
  }

  const calculatedReturnDate = returnDate ? new Date(returnDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days default

  const issue = await Issue.create({
    userId,
    bookId,
    returnDate: calculatedReturnDate,
  });

  // Update book stats
  book.available -= 1;
  book.currentlyIssued += 1;
  book.totalIssued += 1;
  await book.save();

  // Update user stats
  user.totalBooksIssued += 1;
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Book issued successfully',
    data: issue
  });
};

export const returnBook = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const adminId = req.user?._id;

  const issue = await Issue.findById(id).populate('bookId');
  if (!issue) {
    res.status(404);
    throw new Error('Issue record not found');
  }

  if (issue.status !== 'issued') {
    res.status(400);
    throw new Error('Book already returned or marked otherwise');
  }

  const returnDate = new Date();
  issue.actualReturnDate = returnDate;
  issue.status = 'returned';
  issue.remarks = remarks;
  issue.returnedBy = adminId as any;
  issue.returnedAt = returnDate;

  // Calculate fine if overdue
  let fineAmount = 0;
  if (returnDate > issue.returnDate) {
    const diffTime = Math.abs(returnDate.getTime() - issue.returnDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    issue.isOverdue = true;
    issue.daysOverdue = diffDays;
    fineAmount = diffDays * 20; // Rs. 20 per day
    issue.fine = fineAmount;
    issue.fineCalculated = true;

    // Create Fine record
    await Fine.create({
      userId: issue.userId,
      issueId: issue._id,
      bookId: issue.bookId,
      amount: fineAmount,
      daysOverdue: diffDays,
      finePerDay: 20
    });

    // Update user fine stats
    await User.findByIdAndUpdate(issue.userId, {
      $inc: { totalFinesGenerated: fineAmount }
    });
  }

  await issue.save();

  // Update book stats
  const book = await Book.findById(issue.bookId);
  if (book) {
    book.available += 1;
    book.currentlyIssued -= 1;
    await book.save();
  }

  // Update user stats
  await User.findByIdAndUpdate(issue.userId, {
    $inc: { totalBooksReturned: 1 }
  });

  res.json({
    success: true,
    message: 'Book returned successfully',
    data: issue,
    fine: fineAmount > 0 ? { amount: fineAmount, daysOverdue: issue.daysOverdue } : null
  });
};

export const getUserHistory = async (req: AuthRequest, res: Response) => {
  const issues = await Issue.find({ userId: req.user?._id })
    .populate('bookId', 'title author coverImage')
    .sort({ issueDate: -1 });

  res.json({
    success: true,
    data: issues
  });
};

export const getAllIssues = async (req: Request, res: Response) => {
  const issues = await Issue.find({})
    .populate('bookId', 'title author')
    .populate('userId', 'name email')
    .sort({ issueDate: -1 });

  res.json({
    success: true,
    data: issues
  });
};

export const payFine = async (req: Request, res: Response) => {
  const { id } = req.params;

  const issue = await Issue.findById(id);
  if (!issue) {
    res.status(404);
    throw new Error('Issue record not found');
  }

  if (issue.fine === 0 || issue.finePaid) {
    res.status(400);
    throw new Error('No pending fine for this issue');
  }

  issue.finePaid = true;
  await issue.save();

  // Also update associated Fine record if it exists
  await Fine.findOneAndUpdate({ issueId: issue._id }, { status: 'paid', paymentDate: new Date() });

  res.json({
    success: true,
    message: 'Fine cleared successfully',
    data: issue
  });
};
