import { Request, Response } from "express";
import { JobCategory } from "../database/models/JobCategory";
import fs from "fs";
import csv from "csv-parser";

// // Search job categories
export const searchJobCategories = async (req: Request, res: Response) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let searchQuery = {};
    if (query) {
      searchQuery = {
        name: { $regex: query, $options: "i" },
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
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const categories = await JobCategory.find().skip(skip).limit(limitNum);
    const total = await JobCategory.countDocuments();

    if (!categories) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
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
  }
};
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await JobCategory.findById(req.params.id);
    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
  } catch (error) {
    console.error(error);
  }
};
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, parentCategory } = req.body;
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");
    const existingCategory = await JobCategory.findOne({ slug });
    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: "Category already exists",
      });
      return;
    }
    const category = await JobCategory.create({
      name,
      description,
      parentCategory: parentCategory || null,
      slug,
    });
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(error);
  }
};
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, parentCategory } = req.body;
    const category = await JobCategory.findByIdAndUpdate(
      req.params.id,
      { name, description, parentCategory: parentCategory || null },
      {
        new: true,
      }
    );
    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(error);
  }
};
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await JobCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(error);
  }
};
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
    // First pass: read all categories and build a name -> slug map
    const categoryMap = new Map<string, string>();

    // Load existing categories for reference
    const existingCategories = await JobCategory.find({});
    existingCategories.forEach((cat) => {
      categoryMap.set(cat.name, cat.slug);
    });

    // Read and process the CSV file
    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (row) => {
        // Generate slug from name
        const slug = row.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]+/g, "");

        categories.push({
          name: row.name,
          description: row.description || "",
          parentCategorySlug: row.parentCategory
            ? row.parentCategory
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w\-]+/g, "")
            : "",
          slug,
        });
      })
      .on("end", async () => {
        // First pass: add categories without parent references
        for (const category of categories) {
          try {
            // Check if category already exists
            const existingCategory = await JobCategory.findOne({
              slug: category.slug,
            });

            if (!existingCategory) {
              // If there's a parent category slug, find the parent first
              let parentCategory = null;
              if (category.parentCategorySlug) {
                parentCategory = await JobCategory.findOne({
                  slug: category.parentCategorySlug,
                });

                if (!parentCategory) {
                  errors.push({
                    name: category.name,
                    reason: `Parent category with slug "${category.parentCategorySlug}" not found`,
                  });
                  continue;
                }
              }

              // Create the category with parent reference if it exists
              const newCategory = await JobCategory.create({
                name: category.name,
                description: category.description,
                slug: category.slug,
                parentCategory: parentCategory ? parentCategory._id : null,
              });

              // Add to our map
              categoryMap.set(category.name, newCategory.slug);
            } else {
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
