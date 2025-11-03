export const successResponse = (message: string, data: any = {}) => ({
  success: true,
  message,
  data,
});

export const errorResponse = (message: string, error?: any) => ({
  success: false,
  message,
  error: error?.message || error,
});
