const { z } = require('zod');

const adminLoginSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .min(1, 'Username cannot be empty')
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
});

const teacherLoginSchema = z.object({
  phone: z
    .string({ required_error: 'Phone number is required' })
    .min(1, 'Phone number cannot be empty')
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
});

const studentLoginSchema = z.object({
  rollNo: z
    .string({ required_error: 'Roll number is required' })
    .min(1, 'Roll number cannot be empty')
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
});

const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: 'Refresh token is required' })
    .min(1, 'Refresh token cannot be empty'),
});

const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required' })
    .min(1),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(6, 'New password must be at least 6 characters'),
});

module.exports = {
  adminLoginSchema,
  teacherLoginSchema,
  studentLoginSchema,
  refreshTokenSchema,
  changePasswordSchema,
};
