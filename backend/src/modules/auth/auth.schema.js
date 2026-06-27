const { z } = require('zod');
const { validatePassword } = require('../../utils/passwordValidator');

// Custom Zod validator for strong passwords
const strongPasswordValidator = z.string()
  .min(1, 'Password is required')
  .refine((password) => {
    const result = validatePassword(password);
    return result.valid;
  }, (password) => {
    const result = validatePassword(password);
    return { message: result.errors.join('; ') };
  });

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
  newPassword: strongPasswordValidator,
});

module.exports = {
  adminLoginSchema,
  teacherLoginSchema,
  studentLoginSchema,
  refreshTokenSchema,
  changePasswordSchema,
};
