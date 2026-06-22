// src/utils/response.js

/**
 * Response Helper - Chuẩn hóa định dạng trả về của API
 */

const successResponse = (res, data = null, message = "Thành công", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const errorResponse = (res, message = "Đã xảy ra lỗi", statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Các hàm helper phổ biến
const createdResponse = (res, data = null, message = "Tạo mới thành công") => {
  return successResponse(res, data, message, 201);
};

const notFoundResponse = (res, message = "Không tìm thấy dữ liệu") => {
  return errorResponse(res, message, 404);
};

const badRequestResponse = (res, message = "Yêu cầu không hợp lệ", errors = null) => {
  return errorResponse(res, message, 400, errors);
};

const unauthorizedResponse = (res, message = "Không có quyền truy cập") => {
  return errorResponse(res, message, 401);
};

const forbiddenResponse = (res, message = "Truy cập bị từ chối") => {
  return errorResponse(res, message, 403);
};

module.exports = {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse
};