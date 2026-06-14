class ApiError extends Error {
  constructor(statusCode, message, code, errors) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
  }
}

module.exports = ApiError;
