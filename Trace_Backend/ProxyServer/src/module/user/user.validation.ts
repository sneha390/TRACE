import Joi from 'joi';
import { password, objectId } from '../validate/custom.validation';
import { NewCreatedUser } from './user.interfaces';

const createUserBody: Record<keyof NewCreatedUser, any> = {
  email: Joi.string().required().email(),
  userName: Joi.string(),
  isGoogleAuthUsed: Joi.boolean(),
  phone: Joi.string().required(),
  password: Joi.string().required().custom(password),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().required(),
  bio: Joi.string().required(),
  pronoun: Joi.string().required(),
  link: Joi.string().required(),
  gender: Joi.string().required(),
};

export const createUser = {
  body: Joi.object().keys(createUserBody),
};

export const getUsers = {
  query: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    phone: Joi.array().items(Joi.string()),
    role: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

export const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      userName: Joi.string(),
      isGoogleAuthUsed: Joi.boolean(),
      phone: Joi.string(),
      password: Joi.string().custom(password),
      firstName: Joi.string().allow(''),
      lastName: Joi.string().allow(''),
      role: Joi.string(),
      bio: Joi.string().allow(''),
      pronoun: Joi.string().allow(''),
      link: Joi.string().allow(''),
      gender: Joi.string(),
    })
    .min(1),
};

export const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

export const shareGoal = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    goalId: Joi.string().custom(objectId),
  }),
};

export const shareInvite = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

export const viewGoal = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    goalId: Joi.string().custom(objectId),
  }),
};

export const addFriendsByPhoneNumbers = {
  body: Joi.object().keys({
    phoneNumber: Joi.array().items(Joi.string()),
  }),
};