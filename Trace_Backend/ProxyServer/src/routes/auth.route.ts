import express, { Router } from 'express';
// import { authController, authValidation } from 'src/module/auth';
import validate from '../module/validate/validate.middleware';
import { authValidation, authController } from '../module/auth';
// import { validate } from 'src/module/validate';

const router: Router = express.Router();

router.post('/register', validate(authValidation.registerWithPassword), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

export default router;
