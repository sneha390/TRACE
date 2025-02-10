import mongoose, { Model, Document } from 'mongoose';
import { QueryResult } from '../paginate/paginate';
import { AccessAndRefreshTokens } from '../token/token.interfaces';

export interface IUser {
  userName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneNumberVerified: boolean;
  isGoogleAuthUsed: boolean;
  firstName: string;
  lastName: string;
  imageUrl: string;
  bio: string;
  pronoun: string;
  link: string;
  gender: string;
  group: mongoose.Types.ObjectId[];
  responseEmail: mongoose.Types.ObjectId[];
  friends: mongoose.Types.ObjectId[];
  subscriptions: mongoose.Types.ObjectId[];
}

export interface IUserDoc extends IUser, Document {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDoc> {
  isEmailTaken(email: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type UpdateUserBody = Partial<IUser>;

export type NewRegisteredUser = Omit<
  IUser,
  | 'role'
  | 'isEmailVerified'
  | 'imageUrl'
  | 'responseEmail'
  | 'group'
  | 'friends'
  | 'password'
  | 'firstName'
  | 'lastName'
  | 'bio'
  | 'link'
  | 'pronoun'
  | 'gender'
  | 'isPhoneNumberVerified'
  | 'subscriptions'
> & {
  isGoogleAuthUsed: false;
};

export type NewCreatedUser = Omit<
  IUser,
  'isEmailVerified' | 'imageUrl' | 'responseEmail' | 'group' | 'friends' | 'isPhoneNumberVerified' | 'subscriptions'
>;

export type NewCreatedUserWithGoogleAuth = Omit<IUser, 'password'> & {
  isGoogleAuthUsed: true;
};

export type CreatedUser = Omit<IUser, 'password'>;

export interface IUserWithTokens {
  user: IUserDoc;
  tokens: AccessAndRefreshTokens;
}
