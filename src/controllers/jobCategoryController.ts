import { Request, Response } from "express";
import { JobCategory } from "../database/models/JobCategory";

// Get all job categories
export const getAllJobCategories = async (req: Request, res: Response) => {
  try {
    const { parentId } = req.query;

    const query = parentId
      ? { parentCategory: parentId }
      : { parentCategory: { $exists: false } };

    const categories = await JobCategory.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get job category by ID
export const getJobCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await JobCategory.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Job category not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get job category by slug
export const getJobCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const category = await JobCategory.findOne({ slug: req.params.slug });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Job category not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create new job category
export const createJobCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, parentCategory } = req.body;

    // Check if category already exists
    const existingCategory = await JobCategory.findOne({ name });
    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: "Job category already exists",
      });
      return;
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");

    const category = await JobCategory.create({
      name,
      description,
      parentCategory,
      slug,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update job category
export const updateJobCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, parentCategory } = req.body;

    let category = await JobCategory.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Job category not found",
      });
      return;
    }

    // Generate new slug if name is changing
    let updateData: any = { description, parentCategory };
    if (name && name !== category.name) {
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "");
      updateData = { ...updateData, name, slug };
    }

    category = await JobCategory.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete job category
export const deleteJobCategory = async (req: Request, res: Response) => {
  try {
    const category = await JobCategory.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Job category not found",
      });
      return;
    }

    // Check if category has subcategories
    const subcategories = await JobCategory.find({
      parentCategory: req.params.id,
    });
    if (subcategories.length > 0) {
      res.status(400).json({
        success: false,
        message:
          "Cannot delete category with subcategories. Delete subcategories first.",
      });
      return;
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
