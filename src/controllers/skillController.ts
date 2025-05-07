import { Request, Response } from "express";
import { Skill } from "../database/models/Skill";

// Get all skills
export const getAllSkills = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const query = category ? { category } : {};

    const skills = await Skill.find(query).sort({ popularity: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
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

// Get skill by ID
export const getSkillById = async (req: Request, res: Response) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      res.status(404).json({
        success: false,
        message: "Skill not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: skill,
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

// Create new skill
export const createSkill = async (req: Request, res: Response) => {
  try {
    const { name, category, description } = req.body;

    // Check if skill already exists
    const existingSkill = await Skill.findOne({ name });
    if (existingSkill) {
      res.status(400).json({
        success: false,
        message: "Skill already exists",
      });
      return;
    }

    const skill = await Skill.create({
      name,
      category,
      description,
      popularity: 0,
    });

    res.status(201).json({
      success: true,
      data: skill,
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

// Update skill
export const updateSkill = async (req: Request, res: Response) => {
  try {
    const { name, category, description, popularity } = req.body;

    let skill = await Skill.findById(req.params.id);

    if (!skill) {
      res.status(404).json({
        success: false,
        message: "Skill not found",
      });
      return;
    }

    skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { name, category, description, popularity },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: skill,
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

// Delete skill
export const deleteSkill = async (req: Request, res: Response) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      res.status(404).json({
        success: false,
        message: "Skill not found",
      });
      return;
    }

    await skill.deleteOne();

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

// Increment skill popularity
export const incrementSkillPopularity = async (req: Request, res: Response) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      res.status(404).json({
        success: false,
        message: "Skill not found",
      });
      return;
    }

    skill.popularity += 1;
    await skill.save();

    res.status(200).json({
      success: true,
      data: skill,
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

// Search skills by name
export const searchSkills = async (req: Request, res: Response) => {
  try {
    const { q, category } = req.query;

    if (!q) {
      res.status(400).json({
        success: false,
        message: "Search query is required",
      });
      return;
    }

    const query: any = {
      name: { $regex: q, $options: "i" },
    };

    if (category) {
      query.category = category;
    }

    const skills = await Skill.find(query)
      .sort({ popularity: -1, name: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error("Search skills error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get trending skills (most popular)
export const getTrendingSkills = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const skills = await Skill.find().sort({ popularity: -1 }).limit(limit);

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error("Get trending skills error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create multiple skills at once
export const bulkCreateSkills = async (req: Request, res: Response) => {
  try {
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      res.status(400).json({
        success: false,
        message: "Skills array is required",
      });
      return;
    }

    // Check for existing skills to avoid duplicates
    const skillNames = skills.map((skill) => skill.name);
    const existingSkills = await Skill.find({ name: { $in: skillNames } });

    if (existingSkills.length > 0) {
      const existingNames = existingSkills.map((skill) => skill.name);

      // Filter out existing skills
      const newSkills = skills.filter(
        (skill) => !existingNames.includes(skill.name)
      );

      if (newSkills.length === 0) {
        res.status(400).json({
          success: false,
          message: "All skills already exist",
          existingSkills,
        });
        return;
      }

      // Initialize popularity if not provided
      const skillsToCreate = newSkills.map((skill) => ({
        ...skill,
        popularity: skill.popularity || 0,
      }));

      const createdSkills = await Skill.insertMany(skillsToCreate);

      res.status(201).json({
        success: true,
        message: `Created ${createdSkills.length} skills. ${existingSkills.length} already existed.`,
        created: createdSkills,
        existing: existingSkills,
      });
      return;
    }

    // If no existing skills, create all
    const skillsToCreate = skills.map((skill) => ({
      ...skill,
      popularity: skill.popularity || 0,
    }));

    const createdSkills = await Skill.insertMany(skillsToCreate);

    res.status(201).json({
      success: true,
      count: createdSkills.length,
      data: createdSkills,
    });
  } catch (error) {
    console.error("Bulk create skills error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
