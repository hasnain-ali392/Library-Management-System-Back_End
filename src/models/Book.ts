import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  category: 'Fiction' | 'Non-Fiction' | 'Science' | 'History' | 'Technology' | 'Other';
  isbn?: string;
  publisher?: string;
  publishYear?: number;
  description?: string;
  quantity: number;
  available: number;
  bookImage?: {
    url: string;
    uploadedAt: Date;
    path: string;
  };
  isActive: boolean;
  totalIssued: number;
  currentlyIssued: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  author: { type: String, required: true, trim: true, maxlength: 100 },
  category: {
    type: String,
    required: true,
    enum: ['Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Other']
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    match: /^[0-9]{10}([0-9]{3})?$/
  },
  publisher: { type: String, trim: true },
  publishYear: {
    type: Number,
    min: 1000,
    max: new Date().getFullYear()
  },
  description: { type: String, maxlength: 1000 },
  quantity: { type: Number, required: true, min: 0, default: 1 },
  available: { type: Number, required: true, min: 0 },
  bookImage: {
    url: { type: String },
    uploadedAt: { type: Date },
    path: { type: String }
  },
  isActive: { type: Boolean, default: true },
  totalIssued: { type: Number, default: 0 },
  currentlyIssued: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 }
}, {
  timestamps: true
});

export const Book = mongoose.model<IBook>('Book', bookSchema);
