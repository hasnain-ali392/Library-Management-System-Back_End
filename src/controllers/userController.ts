import { Request, Response } from 'express';
import { User } from '../models/User';

export const getUsers = async (req: Request, res: Response) => {
  const users = await User.find({}).select('-password');
  res.json({
    success: true,
    data: users
  });
};

export const suspendUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { suspended, reason } = req.body;
  user.isSuspended = suspended !== undefined ? suspended : true;
  user.suspensionReason = reason || (user.isSuspended ? 'Admin suspension' : '');
  user.suspensionDate = user.isSuspended ? new Date() : undefined;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isSuspended ? 'suspended' : 'activated'} successfully`,
    data: user
  });
};

export const updateProfile = async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, phone, address } = req.body;

  // Validate required fields
  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    res.status(400);
    throw new Error('Name cannot be empty');
  }

  // Validate phone number format
  if (phone !== undefined && phone !== null && phone !== '') {
    const phoneRegex = /^\+?[0-9]{10,14}$/;
    if (!phoneRegex.test(phone)) {
      res.status(400);
      throw new Error('Invalid phone number format. Please use 10-14 digits with optional + prefix');
    }
  }

  // Update user data (allow empty string to clear field)
  if (name !== undefined) user.name = name.trim();
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      profileImage: user.profileImage,
      isActive: user.isActive,
      isSuspended: user.isSuspended,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
};
