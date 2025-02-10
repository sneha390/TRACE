import Joi from 'joi';
import { password } from '../validate/custom.validation';
import { NewRegisteredUser } from '../user/user.interfaces';

const registerBody: Record<keyof NewRegisteredUser, any> = {
  email: Joi.string().required().email(),
  userName: Joi.string().required(),
  isGoogleAuthUsed: Joi.boolean(),
  phone: Joi.string().required(),
};

export const register = {
  body: Joi.object().keys(registerBody),
};

export const registerWithPassword = {
  body: Joi.object().keys({
    password: Joi.string().custom(password),
    firstName: Joi.string(),
    lastName: Joi.string(),
    role: Joi.string().required(),
    id: Joi.string(),
    email: Joi.string(),
    userName: Joi.string(),
    isGoogleAuthUsed: Joi.boolean(),
    phone: Joi.string(),
    bio: Joi.string(),
    link: Joi.string(),
    gender: Joi.string(),
    pronoun: Joi.string(),
  }),
};

export const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

export const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

export const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

export const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

export const sendAuthCode = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required(),
  }),
};

export const verifyAuthCodeAndRegister = {
  body: Joi.object().keys({
    requestId: Joi.string().required(),
    code: Joi.string().required(),
    email: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    isGoogleAuthUsed: Joi.boolean(),
    phone: Joi.string().required(),
    password: Joi.string().required().custom(password),
  }),
};