import mongoose from "mongoose";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// Import your Job model
import { Job } from "../src/database/models/Job";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function seedJobEmbeddings() {
  await mongoose.connect(process.env.MONGO_URI!);

  const jobs = await Job.find();
  for (const jobDoc of jobs) {
    const job = jobDoc.toObject();
    const summary = `${job.title} ${job.description}`;
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: summary,
      });
      const embedding = embeddingResponse.data[0].embedding;
      await Job.updateOne(
        { _id: job._id },
        {
          $set: {
            embedding,
            embedding_text: summary,
          },
        }
      );
      console.log(`Updated embedding for job: ${job.title}`);
    } catch (err) {
      console.error(`Failed to update embedding for job: ${job.title}`, err);
    }
  }

  await mongoose.disconnect();
  console.log("Finished updating job embeddings.");
}

seedJobEmbeddings().catch(console.error);
