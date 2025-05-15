import { Request, Response } from "express";
import { JobCategory } from "../database/models/JobCategory";
import fs from "fs";
import csv from "csv-parser";

// Get all job categories
export const getAllJobCategoriesParent = async (
  req: Request,
  res: Response
) => {
  try {
    const { parentId, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query = parentId
      ? { parentCategory: parentId }
      : { parentCategory: { $exists: false } };

    const categories = await JobCategory.find(query)
      .skip(skip)
      .limit(limitNum)
      .populate("parentCategory", "name")
      .sort({ name: 1 });

    const total = await JobCategory.countDocuments(query);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
      pagination: {
        total: total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
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

// Get all job categories with pagination
export const getAllJobCategories = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    // Empty query to get all categories regardless of parent/child status
    const query = {};

    const categories = await JobCategory.find(query)
      .skip(skip)
      .limit(limit)
      .populate("parentCategory", "name") // Populate parent category info
      .sort({ name: 1 });

    const total = await JobCategory.countDocuments(query);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
      pagination: {
        total: total, // Use actual count without adding 1
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching job categories:", error);
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
    const category = await JobCategory.findById(req.params.id).populate(
      "parentCategory",
      "name"
    );

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
    const category = await JobCategory.findOne({
      slug: req.params.slug,
    }).populate("parentCategory", "name");

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

// Search job categories
export const searchJobCategories = async (req: Request, res: Response) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let searchQuery = {};
    if (query) {
      searchQuery = {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      };
    }

    const categories = await JobCategory.find(searchQuery)
      .skip(skip)
      .limit(limitNum)
      .populate("parentCategory", "name")
      .sort({ name: 1 });

    const total = await JobCategory.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
      pagination: {
        total: total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
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

// Import job categories from CSV
export const importCategoriesFromCSV = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const categories: any[] = [];
  const errors: any[] = [];

  try {
    // First pass: read all categories and build a name -> id map
    const categoryMap = new Map<string, string>();

    // Load existing categories for reference
    const existingCategories = await JobCategory.find({});
    existingCategories.forEach((cat) => {
      categoryMap.set(cat.name, cat._id.toString());
    });

    // Read and process the CSV file
    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (row) => {
        // Generate slug from name
        const slug = row.Name.toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]+/g, "");

        categories.push({
          name: row.Name,
          description: row.Description || "",
          parentCategoryName: row.ParentCategoryName || "",
          slug,
        });
      })
      .on("end", async () => {
        // First pass: add categories without parent references
        for (const category of categories) {
          try {
            // Check if category already exists
            const existingCategory = await JobCategory.findOne({
              name: category.name,
            });

            if (!existingCategory) {
              // Create the category without parent reference for now
              const newCategory = await JobCategory.create({
                name: category.name,
                description: category.description,
                slug: category.slug,
              });

              // Add to our map for second pass
              categoryMap.set(category.name, newCategory._id.toString());
            } else {
              // Update the map with existing category
              categoryMap.set(category.name, existingCategory._id.toString());

              errors.push({
                name: category.name,
                reason: "Category already exists - skipped",
              });
            }
          } catch (err) {
            errors.push({
              name: category.name,
              reason: err instanceof Error ? err.message : "Unknown error",
            });
          }
        }

        // Second pass: update parent references
        for (const category of categories) {
          try {
            if (
              category.parentCategoryName &&
              categoryMap.has(category.parentCategoryName)
            ) {
              const parentId = categoryMap.get(category.parentCategoryName);
              await JobCategory.findOneAndUpdate(
                { name: category.name },
                { parentCategory: parentId }
              );
            }
          } catch (err) {
            errors.push({
              name: category.name,
              reason: `Failed to update parent category: ${
                err instanceof Error ? err.message : "Unknown error"
              }`,
            });
          }
        }

        // Clean up temp file
        fs.unlinkSync(file.path);

        res.status(201).json({
          success: true,
          message: "Categories imported",
          imported: categories.length - errors.length,
          errors,
        });
      });
  } catch (error) {
    console.error("CSV import error:", error);
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(500).json({
      success: false,
      message: "CSV import error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
