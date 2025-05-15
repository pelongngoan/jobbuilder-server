import { Request, Response, NextFunction } from "express";
import multer from "multer";

// Error handler middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", err);

  // Handle Multer errors specifically
  if (err instanceof multer.MulterError) {
    handleMulterError(err, res);
    return;
  }

  // Handle validation errors from Mongoose
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    res.status(400).json({
      success: false,
      error: messages,
    });
    return;
  }

  // Handle duplicate key errors from MongoDB
  if (err.code === 11000) {
    res.status(400).json({
      success: false,
      error: "Duplicate field value entered",
    });
    return;
  }

  // Handle other errors
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Server Error",
  });
};

// Helper function to handle Multer errors
const handleMulterError = (err: multer.MulterError, res: Response): void => {
  console.error("Multer error:", err);

  switch (err.code) {
    case "LIMIT_PART_COUNT":
      res.status(400).json({
        success: false,
        error: "Too many parts in the multipart form",
      });
      break;
    case "LIMIT_FILE_SIZE":
      res.status(400).json({
        success: false,
        error: "File is too large",
      });
      break;
    case "LIMIT_FILE_COUNT":
      res.status(400).json({
        success: false,
        error: "Too many files uploaded",
      });
      break;
    case "LIMIT_FIELD_KEY":
      res.status(400).json({
        success: false,
        error: "Field name is too long",
      });
      break;
    case "LIMIT_FIELD_VALUE":
      res.status(400).json({
        success: false,
        error: "Field value is too long",
      });
      break;
    case "LIMIT_FIELD_COUNT":
      res.status(400).json({
        success: false,
        error: "Too many fields in the form",
      });
      break;
    case "LIMIT_UNEXPECTED_FILE":
      res.status(400).json({
        success: false,
        error: 'Unexpected field name. The field name must be "file".',
      });
      break;
    default:
      res.status(400).json({
        success: false,
        error: `File upload error: ${err.message}`,
      });
  }
};
