import { Request, Response } from 'express';
import { Book } from '../models/Book.js';

export const getBooks = async (req: Request, res: Response) => {
  const { search, category, available, page, limit, sort } = res.locals.validated.query as {
    search?: string;
    category?: 'Fiction' | 'Non-Fiction' | 'Science' | 'History' | 'Technology' | 'Other';
    available?: boolean;
    page?: number;
    limit?: number;
    sort?: 'createdAt' | 'title' | 'author' | 'popular';
  };

  const skip = ((page || 1) - 1) * (limit || 10);

  const query: any = { isActive: true };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { isbn: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (available !== undefined) {
    query.available = available ? { $gt: 0 } : 0;
  }

  let sortCriteria: any = {};
  if (sort === 'title') {
    sortCriteria = { title: 1 };
  } else if (sort === 'author') {
    sortCriteria = { author: 1 };
  } else if (sort === 'popular') {
    sortCriteria = { totalIssued: -1 };
  } else {
    sortCriteria = { createdAt: -1 };
  }

  const books = await Book.find(query)
    .sort(sortCriteria)
    .skip(skip)
    .limit(Number(limit || 10));

  const total = await Book.countDocuments(query);

  res.json({
    success: true,
    data: {
      books,
      pagination: {
        currentPage: Number(page || 1),
        totalPages: Math.ceil(total / Number(limit || 10)),
        totalBooks: total,
        limit: Number(limit || 10)
      }
    }
  });
};

export const getBookById = async (req: Request, res: Response) => {
  const book = await Book.findById(req.params.id);
  
  if (book) {
    res.json({
      success: true,
      data: book
    });
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
};

export const addBook = async (req: Request, res: Response) => {
  const { title, author, category, isbn, publisher, publishYear, description, quantity } = req.body;
  
  let bookImageUrl = undefined;
  if ((req as any).file) {
    bookImageUrl = {
      url: `/uploads/${(req as any).file.filename}`,
      uploadedAt: new Date(),
      path: (req as any).file.path
    };
  }

  const book = await Book.create({
    title,
    author,
    category,
    isbn,
    publisher,
    publishYear,
    description,
    quantity,
    available: quantity,
    bookImage: bookImageUrl
  });

  res.status(201).json({
    success: true,
    message: 'Book added successfully',
    data: book
  });
};

export const updateBook = async (req: Request, res: Response) => {
  const { title, author, category, isbn, publisher, publishYear, description, quantity } = req.body;

  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Update quantity logic
  if (quantity !== undefined) {
    const diff = quantity - book.quantity;
    book.quantity = quantity;
    book.available += diff;
    if (book.available < 0) {
      res.status(400);
      throw new Error('Cannot reduce quantity below currently issued books');
    }
  }

  book.title = title || book.title;
  book.author = author || book.author;
  book.category = category || book.category;
  book.isbn = isbn || book.isbn;
  book.publisher = publisher || book.publisher;
  book.publishYear = publishYear || book.publishYear;
  book.description = description || book.description;

  if ((req as any).file) {
    book.bookImage = {
      url: `/uploads/${(req as any).file.filename}`,
      uploadedAt: new Date(),
      path: (req as any).file.path
    };
  }

  const updatedBook = await book.save();
  res.json({
    success: true,
    message: 'Book updated successfully',
    data: updatedBook
  });
};

export const deleteBook = async (req: Request, res: Response) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Check if book is currently issued
  if (book.currentlyIssued > 0) {
    res.status(400);
    throw new Error('Cannot delete book with active issues');
  }

  book.isActive = false;
  await book.save();

  res.json({
    success: true,
    message: 'Book removed successfully'
  });
};
