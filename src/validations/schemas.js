const { z } = require('zod');

// ====================== AUTH ======================
const registerSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự")
});

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống")
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

// ====================== USER ======================
const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional().nullable(),
  phone: z.string().optional(),
  address: z.string().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6)
});

// ====================== BOOK ======================
const createBookSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  price: z.number().positive("Giá phải lớn hơn 0"),
  image: z.string().optional(),
  stock: z.number().int().min(0),
  authorId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  publisherId: z.number().int().positive().optional(),
  pageCount: z.number().int().optional()
});

// ====================== CART ======================
const addToCartSchema = z.object({
  bookId: z.number().int().positive(),
  quantity: z.number().int().min(1).optional().default(1)
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1)
});

// ====================== ORDER ======================
const createOrderSchema = z.object({
  shippingAddress: z.string().min(1, "Địa chỉ phải chi tiết hơn"),
  paymentMethod: z.enum(["cod", "bank"]).optional().default("cod"),
  note: z.string().optional()
});

// ====================== REVIEW ======================
const createReviewSchema = z.object({
  bookId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

// ====================== ADMIN ======================
const categorySchema = z.object({
  name: z.string().min(2)
});

const authorSchema = z.object({
  name: z.string().min(2),
  bio: z.string().optional()
});

const tagSchema = z.object({
  name: z.string().min(2)
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
  createBookSchema,
  addToCartSchema,
  updateCartItemSchema,
  createOrderSchema,
  createReviewSchema,
  categorySchema,
  authorSchema,
  tagSchema
};