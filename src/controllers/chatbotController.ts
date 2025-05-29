import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper function to convert file to base64
const fileToGenerativePart = (filePath: string, mimeType: string) => {
  return {
    inlineData: {
      data: fs.readFileSync(filePath).toString("base64"),
      mimeType,
    },
  };
};

// Helper function to check if file is an image
const isImageFile = (filename: string): boolean => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
};

// Helper function to get MIME type
const getMimeType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

// Helper function to extract text from files
const extractTextFromFile = async (
  filePath: string,
  mimeType: string
): Promise<string> => {
  try {
    switch (mimeType) {
      case "application/pdf":
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        return pdfData.text;

      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        const docResult = await mammoth.extractRawText({ path: filePath });
        return docResult.value;

      case "text/plain":
        return fs.readFileSync(filePath, "utf-8");

      default:
        return "";
    }
  } catch (error) {
    console.error(`Error extracting text from file ${filePath}:`, error);
    return "";
  }
};

export const chatbotController = {
  async askQuestion(req: Request, res: Response) {
    try {
      const { message } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!message && (!files || files.length === 0)) {
        return res.status(400).json({
          success: false,
          message: "Message or files are required",
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: "Gemini API key not configured",
        });
      }

      let model;
      let prompt;
      let parts: any[] = [];

      // Check if there are image files
      const imageFiles =
        files?.filter((file) => isImageFile(file.filename)) || [];
      const hasImages = imageFiles.length > 0;

      if (hasImages) {
        // Use Gemini Vision model for images
        model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // Create job-focused prompt for image analysis
        prompt = `You are a helpful job search assistant. Your role is to help users with job-related questions including:
        - Job search strategies
        - Career advice
        - Interview preparation
        - Resume tips and analysis
        - Skill development
        - Industry insights
        - Salary negotiation
        - Professional networking
        - Career transitions
        - Work-life balance

        The user has shared an image. Please analyze the image in the context of job searching and career development. 
        If it's a resume, provide feedback and suggestions for improvement.
        If it's a job posting, help analyze the requirements and provide advice.
        If it's related to career development, provide relevant insights.

        User message: ${
          message || "Please analyze this image in relation to my job search."
        }`;

        // Add text prompt
        parts.push(prompt);

        // Add images
        for (const file of imageFiles) {
          const mimeType = getMimeType(file.filename);
          parts.push(fileToGenerativePart(file.path, mimeType));
        }

        // Also handle non-image files when there are images
        const nonImageFiles =
          files?.filter((file) => !isImageFile(file.filename)) || [];
        if (nonImageFiles.length > 0) {
          let fileContents = "\n\nAdditional file contents:\n";

          for (const file of nonImageFiles) {
            const mimeType = getMimeType(file.filename);
            const textContent = await extractTextFromFile(file.path, mimeType);

            if (textContent.trim()) {
              fileContents += `\n--- ${file.originalname} ---\n${textContent}\n`;
            } else {
              fileContents += `\n--- ${file.originalname} ---\n[Could not extract text content]\n`;
            }
          }

          parts[0] += fileContents;
          parts[0] += `\n\nPlease analyze both the image(s) and the text content above, providing comprehensive feedback and advice.`;
        }
      } else {
        // Use regular text model
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create a job-focused prompt
        prompt = `You are a helpful job search assistant. Your role is to help users with job-related questions including:
        - Job search strategies
        - Career advice
        - Interview preparation
        - Resume tips
        - Skill development
        - Industry insights
        - Salary negotiation
        - Professional networking
        - Career transitions
        - Work-life balance

        Please provide helpful, practical advice focused on job searching and career development.
        
        User question: ${message}`;

        parts.push(prompt);

        // Handle non-image files (like PDF, DOC)
        if (files && files.length > 0) {
          const nonImageFiles = files.filter(
            (file) => !isImageFile(file.filename)
          );

          if (nonImageFiles.length > 0) {
            let fileContents = "\n\nFile contents:\n";

            for (const file of nonImageFiles) {
              const mimeType = getMimeType(file.filename);
              const textContent = await extractTextFromFile(
                file.path,
                mimeType
              );

              if (textContent.trim()) {
                fileContents += `\n--- ${file.originalname} ---\n${textContent}\n`;
              } else {
                fileContents += `\n--- ${file.originalname} ---\n[Could not extract text content]\n`;
              }
            }

            parts[0] += fileContents;
            parts[0] += `\n\nPlease analyze the above file content(s) and provide detailed feedback and advice related to job searching and career development.`;
          }
        }
      }

      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      // Clean up uploaded files after processing
      if (files) {
        files.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error(`Error deleting file ${file.path}:`, error);
          }
        });
      }

      res.json({
        success: true,
        data: {
          message: text,
          timestamp: new Date().toISOString(),
          hasAttachments: files && files.length > 0,
          attachmentCount: files?.length || 0,
        },
      });
    } catch (error) {
      console.error("Chatbot error:", error);

      // Clean up files on error
      const files = req.files as Express.Multer.File[];
      if (files) {
        files.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (cleanupError) {
            console.error(`Error deleting file ${file.path}:`, cleanupError);
          }
        });
      }

      res.status(500).json({
        success: false,
        message: "Error processing your question. Please try again.",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  },

  async getWelcomeMessage(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: {
          message:
            "Hello! I'm your job search assistant. I can help you with job searching strategies, interview preparation, resume tips, career advice, and much more.\n\n📎 **New Feature**: You can now upload files for analysis!\n• Upload your CV/Resume (PDF, DOC, DOCX) for detailed feedback\n• Share job postings or screenshots for analysis\n• Upload any text files for career advice\n\nWhat would you like to know about your career journey?",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error getting welcome message",
      });
    }
  },
};
