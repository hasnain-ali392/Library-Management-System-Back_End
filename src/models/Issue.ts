import mongoose, { Document, Schema } from 'mongoose';

export interface IIssue extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  issueDate: Date;
  returnDate: Date;
  actualReturnDate?: Date | null;
  fine: number;
  fineCalculated: boolean;
  finePaid: boolean;
  status: 'issued' | 'returned' | 'lost' | 'damaged';
  remarks?: string;
  isOverdue: boolean;
  daysOverdue: number;
  returnedBy?: mongoose.Types.ObjectId;
  returnedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new Schema<IIssue>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  issueDate: { type: Date, default: Date.now, required: true },
  returnDate: { type: Date, required: true },
  actualReturnDate: { type: Date, default: null },
  fine: { type: Number, default: 0 },
  fineCalculated: { type: Boolean, default: false },
  finePaid: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['issued', 'returned', 'lost', 'damaged'], 
    default: 'issued', 
    index: true 
  },
  remarks: { type: String },
  isOverdue: { type: Boolean, default: false, index: true },
  daysOverdue: { type: Number, default: 0 },
  returnedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  returnedAt: { type: Date }
}, {
  timestamps: true
});

// Create compound indices
issueSchema.index({ userId: 1, status: 1 });
issueSchema.index({ bookId: 1, status: 1 });
issueSchema.index({ returnDate: 1, status: 1 });

export const Issue = mongoose.model<IIssue>('Issue', issueSchema);
