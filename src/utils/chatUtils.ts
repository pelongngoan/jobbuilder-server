import { Job } from "../database/models/Job";
import natural from "natural";

// Synonym mapping for job search
const SYNONYMS = {
  backend: [
    "backend",
    "back end",
    "server-side",
    "nodejs",
    "api",
    "java",
    "spring",
    "express",
    "django",
    "flask",
    ".net",
    "php",
  ],
  frontend: [
    "frontend",
    "front end",
    "client-side",
    "react",
    "angular",
    "vue",
    "javascript",
    "typescript",
    "html",
    "css",
  ],
  fullstack: ["fullstack", "full stack", "full-stack"],
  devops: [
    "devops",
    "ci/cd",
    "infrastructure",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
  ],
  mobile: [
    "mobile",
    "android",
    "ios",
    "react native",
    "flutter",
    "swift",
    "kotlin",
  ],
};

// Vietnamese keywords for query analysis
const VIETNAMESE_KEYWORDS = {
  job: ["việc làm", "công việc", "nghề nghiệp", "vị trí", "job"],
  company: ["công ty", "doanh nghiệp", "nhà tuyển dụng", "công ty"],
  help: ["giúp", "hướng dẫn", "làm sao", "thế nào"],
  search: ["tìm", "tìm kiếm", "kiếm", "tìm việc", "tìm kiếm việc làm"],
};

// English keywords for query analysis
const ENGLISH_KEYWORDS = {
  job: ["job", "position", "work", "career", "employment"],
  company: ["company", "employer", "business", "organization"],
  help: ["help", "guide", "how to", "instruction"],
  search: ["search", "find", "look for", "seek"],
};

const GENERIC_WORDS = new Set([
  "job",
  "jobs",
  "position",
  "positions",
  "developer",
  "engineer",
  "role",
  "work",
  "career",
  "employment",
]);

// Helper to extract keywords from user input
function extractKeywords(text) {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const stopwords = new Set([
    "the",
    "is",
    "at",
    "which",
    "on",
    "a",
    "an",
    "and",
    "or",
    "for",
    "to",
    "in",
    "of",
    "with",
    "by",
    "as",
    "from",
    "that",
    "this",
    "it",
    "be",
    "are",
    "was",
    "were",
    "will",
    "can",
    "i",
    "me",
    "my",
    "you",
    "your",
    "we",
    "our",
    "they",
    "their",
  ]);
  const filtered = tokens.filter((token) => !stopwords.has(token));
  const stemmed = filtered.map((token) => natural.PorterStemmer.stem(token));
  return Array.from(new Set(stemmed));
}

// Expand keywords with synonyms
function expandKeywords(keywords) {
  let expanded = [];
  for (const kw of keywords) {
    for (const [main, syns] of Object.entries(SYNONYMS)) {
      if (syns.includes(kw)) {
        expanded.push(main, ...syns);
      }
    }
    expanded.push(kw);
  }
  return Array.from(new Set(expanded));
}

// Keyword-based job search (no embeddings)
async function keywordJobSearch(userQuery) {
  const keywords = extractKeywords(userQuery);
  const expandedKeywords = expandKeywords(keywords);
  if (expandedKeywords.length === 0) {
    return [];
  }
  const regexes = expandedKeywords.map((kw) => new RegExp(kw, "i"));
  // Use OR logic for broader matching, now including companyName
  const jobs = await Job.find({
    $or: [
      { title: { $in: regexes } },
      { description: { $in: regexes } },
      { companyName: { $in: regexes } },
    ],
  }).limit(5);
  return jobs;
}

// Helper: Lấy danh sách ngành nghề từ dữ liệu
async function getAllCategories() {
  const categories = await Job.distinct("category");
  return categories.filter(Boolean);
}

// Gợi ý việc làm phổ biến (nhiều ứng viên ứng tuyển nhất)
async function getPopularJobs(top_k = 5) {
  // Sắp xếp theo số lượng ứng viên ứng tuyển (applications.length), giảm dần
  const jobsAgg = await Job.aggregate([
    { $match: { status: "open" } },
    { $addFields: { numApplications: { $size: "$applications" } } },
    { $sort: { numApplications: -1, createdAt: -1 } },
    { $limit: top_k },
    { $project: { _id: 1 } },
  ]);
  const jobIds = jobsAgg.map((j) => j._id);
  // Lấy lại Job documents đầy đủ
  const jobs = await Job.find({ _id: { $in: jobIds } });
  // Đảm bảo thứ tự giống với jobsAgg
  const jobsMap = new Map(jobs.map((j) => [j._id.toString(), j]));
  return jobIds.map((id) => jobsMap.get(id.toString())).filter(Boolean);
}

// Gợi ý việc làm theo ngành nghề
async function getJobsByCategory(category, top_k = 5) {
  const jobs = await Job.find({ category, status: "open" })
    .sort({ createdAt: -1 })
    .limit(top_k);
  return jobs;
}

// Phân loại loại gợi ý dựa trên nội dung user
function classifyRecommendationType(content, categories) {
  const lowerContent = content.toLowerCase();
  // Nếu có từ khóa ngành nghề
  for (const cat of categories) {
    if (cat && lowerContent.includes(cat.toLowerCase())) {
      return { type: "category", category: cat };
    }
  }
  // Nếu có từ khóa tìm kiếm việc làm
  for (const kw of [...VIETNAMESE_KEYWORDS.job, ...ENGLISH_KEYWORDS.job]) {
    if (lowerContent.includes(kw)) {
      return { type: "keyword" };
    }
  }
  // Mặc định gợi ý phổ biến
  return { type: "popular" };
}

export const chatUtils = {
  async generateResponse(_queryType, content) {
    // Lấy danh sách ngành nghề
    const categories = await getAllCategories();
    const classify = classifyRecommendationType(content, categories);
    let jobs = [];
    let message = "";
    if (classify.type === "category") {
      jobs = await getJobsByCategory(classify.category);
      message = `Các việc làm nổi bật trong ngành '${classify.category}':`;
    } else if (classify.type === "keyword") {
      jobs = await keywordJobSearch(content);
      message = "Các việc làm phù hợp với tìm kiếm của bạn:";
    } else {
      jobs = await getPopularJobs();
      message = "Các việc làm phổ biến hiện nay:";
    }
    if (jobs.length === 0) {
      return {
        content:
          "Không tìm thấy việc làm phù hợp. Bạn muốn thử từ khóa khác không?",
        jobRecommendations: [],
      };
    }
    // Sinh nội dung trả lời thân thiện
    const jobList = jobs
      .map(
        (job, idx) =>
          `- ${job.title} tại ${job.companyName || "[Công ty ẩn danh]"} (${
            job.location
          })`
      )
      .join("\n");
    return {
      content: `${message}\n${jobList}`,
      jobRecommendations: jobs,
    };
  },
  // Giữ lại hàm analyzeQuery nếu cần cho các luồng khác
  analyzeQuery(content) {
    const lowerContent = content.toLowerCase();
    for (const [type, keywords] of Object.entries(VIETNAMESE_KEYWORDS)) {
      if (keywords.some((keyword) => lowerContent.includes(keyword))) {
        return type;
      }
    }
    for (const [type, keywords] of Object.entries(ENGLISH_KEYWORDS)) {
      if (keywords.some((keyword) => lowerContent.includes(keyword))) {
        return type;
      }
    }
    return "general";
  },
};
