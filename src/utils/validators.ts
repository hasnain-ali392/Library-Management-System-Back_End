import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    phone: z.string().optional(),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

// Book Schemas
export const bookCreateSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    author: z.string().min(1, 'Author is required').max(100),
    category: z.enum(['All', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Other']),
    isbn: z.string().regex(/^[0-9]{10}([0-9]{3})?$/, 'Invalid ISBN').optional(),
    publisher: z.string().optional(),
    publishYear: z.coerce.number().min(1000).max(new Date().getFullYear()).optional(),
    description: z.string().max(1000).optional(),
    quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  })
});

export const getBooksQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.enum(['All', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Other']).optional(),
    available: z.literal('true').transform(() => true).or(z.literal('false').transform(() => false)).optional(),
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
    sort: z.enum(['createdAt', 'title', 'author', 'popular']).optional(),
  }),
});

// Issue Schemas
export const issueBookSchema = z.object({
  body: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
    bookId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid book ID'),
    returnDate: z.string().datetime().optional()
  })
});

// User-initiated borrow schema
export const userBorrowSchema = z.object({
  body: z.object({
    bookId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid book ID'),
    returnDate: z.string().datetime().optional()
  })
});

export const returnBookSchema = z.object({
  body: z.object({
    remarks: z.string().optional()
  })
});
