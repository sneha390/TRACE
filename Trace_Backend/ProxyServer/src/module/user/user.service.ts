import httpStatus from 'http-status';
import mongoose from 'mongoose';
import User from './user.model';
import ApiError from '../errors/ApiError';
import { NewCreatedUser, UpdateUserBody, IUserDoc, NewRegisteredUser } from './user.interfaces';
import { QueryResult } from '../paginate/paginate';

/**
 * Create a user
 * @param {NewCreatedUser} userBody
 * @returns {Promise<IUserDoc>}
 */
export const createUser = async (userBody: NewCreatedUser): Promise<IUserDoc> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Register a user
 * @param {NewRegisteredUser} userBody
 * @returns {Promise<IUserDoc>}
 */
export const registerUser = async (userBody: NewRegisteredUser): Promise<IUserDoc> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Get user by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IUserDoc | null>}
 */
export const getUserById = async (id: mongoose.Types.ObjectId): Promise<IUserDoc | null> => User.findById(id);

/*
 * Get user by phone number
 * @param {number} phoneNumber
 * @returns {Promise<IUserDoc | null>}
 */
export const getUserByPhoneNumber = async (phoneNumber: number): Promise<IUserDoc | null> =>
  User.findOne({ phone: phoneNumber });

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<IUserDoc | null>}
 */
export const getUserByEmail = async (email: string): Promise<IUserDoc | null> => User.findOne({ email });

/**
 * Update user by id
 * @param {mongoose.Types.ObjectId} userId
 * @param {UpdateUserBody} updateBody
 * @returns {Promise<IUserDoc | null>}
 */
export const updateUserById = async (
  userId: mongoose.Types.ObjectId,
  updateBody: UpdateUserBody
): Promise<IUserDoc | null> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<IUserDoc | null>}
 */
export const deleteUserById = async (userId: mongoose.Types.ObjectId): Promise<IUserDoc | null> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.deleteOne();
  return user;
};


export const searchUsers = async (search: string): Promise<IUserDoc[] | null> => {
  const users = await User.find({
    $and: [
      {
        $or: [{ firstName: { $regex: search, $options: 'i' } }, { lastName: { $regex: search, $options: 'i' } }],
      },
      { isPhoneVerified: true },
    ],
  });
  return users;
};

export const isPhoneNumberTaken = async (phone: string): Promise<boolean> => {
  const user = await User.findOne({ phone });

  return !!user;
};

export const isPhoneVerified = async (phone: string): Promise<boolean> => {
  const user = await User.findOne({ phone });

  if (user) {
    return user.isPhoneNumberVerified;
  }

  return false;
};

export const isPasswordSet = async (phone: string): Promise<boolean> => {
  const user = await User.findOne({
    phone,
  });
  if (user) {
    if (user.password) {
      return true;
    }
    return false;
  }
  return false;
};

export const findUserByPhoneNumber = async (phoneNumber: string[]): Promise<QueryResult> => {
  const users = await User.find({
    phone: { $in: phoneNumber.map((number) => new RegExp(number.replace(/[^0-9]/g, ''), 'g')) },
  });

  return {
    results: users,
    page: 1,
    limit: users.length,
    totalPages: 1,
    totalResults: users.length,
  };
};

export const createGoogleUser = async (userBody: {
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  isGoogleAuthUsed: boolean;
}): Promise<IUserDoc> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already registered with this email');
  }
  return User.create({ ...userBody, isGoogleAuthUsed: true });

};