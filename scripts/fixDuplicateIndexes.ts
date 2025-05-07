/**
 * This script removes duplicate indexes from Mongoose schema definitions.
 * It looks for models where index() is called on fields that already have unique: true
 * in their schema definition, which creates duplicate indexes.
 */

import fs from "fs";
import path from "path";

const MODELS_DIR = path.join(__dirname, "../src/database/models");

// Read all model files
const modelFiles = fs
  .readdirSync(MODELS_DIR)
  .filter((file) => file.endsWith(".ts") && file !== "index.ts");

console.log(`Processing ${modelFiles.length} model files...`);

let totalFixed = 0;

modelFiles.forEach((file) => {
  const filePath = path.join(MODELS_DIR, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Find schema fields with unique: true
  const uniqueFields: string[] = [];
  const uniqueMatch = content.match(/(\w+):\s*{[^}]*unique:\s*true/g);

  if (uniqueMatch) {
    uniqueMatch.forEach((match) => {
      const fieldName = match.split(":")[0].trim();
      uniqueFields.push(fieldName);
    });
  }

  // Check if we need to fix this file
  if (uniqueFields.length > 0) {
    let fileFixed = false;

    // Remove explicit schema.index calls for fields with unique: true
    uniqueFields.forEach((field) => {
      const indexRegex = new RegExp(
        `\\w+Schema\\.index\\(\\s*{\\s*${field}:\\s*1\\s*}\\s*\\)`,
        "g"
      );
      if (indexRegex.test(content)) {
        content = content.replace(
          indexRegex,
          `// Removed duplicate index for ${field}`
        );
        fileFixed = true;
        totalFixed++;
      }
    });

    if (fileFixed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed duplicate indexes in ${file}`);
    }
  }
});

console.log(`Completed! Fixed ${totalFixed} duplicate indexes`);
