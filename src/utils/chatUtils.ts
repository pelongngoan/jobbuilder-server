import { Job } from "../database/models/Job";
import { Resume } from "../database/models/Resume";

// Vietnamese keywords for query analysis
const VIETNAMESE_KEYWORDS = {
  resume: ["sơ yếu lý lịch", "cv", "hồ sơ", "lý lịch"],
  job: ["việc làm", "công việc", "nghề nghiệp", "vị trí", "job"],
  company: ["công ty", "doanh nghiệp", "nhà tuyển dụng", "công ty"],
  help: ["giúp", "hướng dẫn", "làm sao", "thế nào"],
  search: ["tìm", "tìm kiếm", "kiếm", "tìm việc", "tìm kiếm việc làm"],
};

// English keywords for query analysis
const ENGLISH_KEYWORDS = {
  resume: ["resume", "cv", "curriculum vitae"],
  job: ["job", "position", "work", "career", "employment"],
  company: ["company", "employer", "business", "organization"],
  help: ["help", "guide", "how to", "instruction"],
  search: ["search", "find", "look for", "seek"],
};

export const chatUtils = {
  // Analyze the user's message to determine the type of query
  analyzeQuery(content: string): string {
    const lowerContent = content.toLowerCase();

    // Check Vietnamese keywords
    for (const [type, keywords] of Object.entries(VIETNAMESE_KEYWORDS)) {
      if (keywords.some((keyword) => lowerContent.includes(keyword))) {
        return type;
      }
    }

    // Check English keywords
    for (const [type, keywords] of Object.entries(ENGLISH_KEYWORDS)) {
      if (keywords.some((keyword) => lowerContent.includes(keyword))) {
        return type;
      }
    }

    return "general";
  },

  // Detect languages in the query
  detectLanguages(content: string): string[] {
    const languages: string[] = [];

    // Check for Vietnamese characters
    if (
      /[\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0300-\u036F\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF]/.test(
        content
      )
    ) {
      languages.push("vietnamese");
    }

    // Check for English (basic check for Latin characters)
    if (/[a-zA-Z]/.test(content)) {
      languages.push("english");
    }

    // If no specific language detected, default to English
    if (languages.length === 0) {
      languages.push("english");
    }

    return languages;
  },

  // Generate appropriate response based on query type
  async generateResponse(queryType: string, content: string, userId: string) {
    // Detect languages in the query
    const languages = this.detectLanguages(content);

    // Generate responses for each detected language
    const responses: { [key: string]: string } = {};
    const jobRecommendations: any[] = [];

    for (const lang of languages) {
      const isVietnamese = lang === "vietnamese";

      let response;
      switch (queryType) {
        case "resume":
          response = await handleResumeQuery(content, userId, isVietnamese);
          break;
        case "job":
          response = await handleJobQuery(content, isVietnamese);
          break;
        case "company":
          response = await handleCompanyQuery(content, isVietnamese);
          break;
        case "help":
          response = handleHelpQuery(content, isVietnamese);
          break;
        case "search":
          response = await handleSearchQuery(content, isVietnamese);
          break;
        default:
          response = handleGeneralQuery(content, isVietnamese);
      }

      responses[lang] = response.content;

      // Use job recommendations from the first response
      if (
        jobRecommendations.length === 0 &&
        response.jobRecommendations.length > 0
      ) {
        jobRecommendations.push(...response.jobRecommendations);
      }
    }

    // Combine responses if multiple languages detected
    let combinedContent = "";
    if (languages.length > 1) {
      combinedContent = "Here's your response in multiple languages:\n\n";

      if (responses.english) {
        combinedContent += "🇺🇸 English:\n" + responses.english + "\n\n";
      }

      if (responses.vietnamese) {
        combinedContent += "🇻🇳 Tiếng Việt:\n" + responses.vietnamese;
      }
    } else {
      // Use the single language response
      combinedContent = responses[languages[0]];
    }

    return {
      content: combinedContent,
      jobRecommendations: jobRecommendations,
    };
  },
};

// Handle resume-related queries
async function handleResumeQuery(
  content: string,
  userId: string,
  isVietnamese: boolean
) {
  const resume = await Resume.findOne({ userId });
  if (!resume) {
    return {
      content: isVietnamese
        ? "Tôi nhận thấy bạn chưa tải lên sơ yếu lý lịch. Bạn có muốn tôi hướng dẫn cách tạo một sơ yếu lý lịch không?"
        : "I notice you don't have a resume uploaded yet. Would you like me to guide you through creating one?",
      jobRecommendations: [],
    };
  }

  // Analyze resume content and provide recommendations
  const recommendations = isVietnamese
    ? [
        "Hãy thêm các thành tích cụ thể với kết quả có thể đo lường được",
        "Đảm bảo kỹ năng của bạn phù hợp với yêu cầu công việc bạn quan tâm",
        "Giữ sơ yếu lý lịch ngắn gọn và tập trung vào kinh nghiệm liên quan",
      ]
    : [
        "Consider adding more specific achievements with quantifiable results",
        "Make sure your skills match the job requirements you're interested in",
        "Keep your resume concise and focused on relevant experience",
      ];

  return {
    content: isVietnamese
      ? `Đây là một số gợi ý cho sơ yếu lý lịch của bạn:\n${recommendations.join(
          "\n"
        )}`
      : `Here are some recommendations for your resume:\n${recommendations.join(
          "\n"
        )}`,
    jobRecommendations: [],
  };
}

// Handle job-related queries
async function handleJobQuery(content: string, isVietnamese: boolean) {
  const jobs = await Job.find({
    $or: [
      { title: { $regex: content, $options: "i" } },
      { description: { $regex: content, $options: "i" } },
    ],
  }).limit(5);

  if (jobs.length === 0) {
    return {
      content: isVietnamese
        ? "Tôi không tìm thấy công việc nào phù hợp với yêu cầu của bạn. Bạn có muốn thử tìm kiếm với từ khóa khác không?"
        : "I couldn't find any jobs matching your query. Would you like to try a different search term?",
      jobRecommendations: [],
    };
  }

  return {
    content: isVietnamese
      ? "Đây là một số công việc có thể phù hợp với bạn:"
      : "Here are some jobs that might interest you:",
    jobRecommendations: jobs,
  };
}

// Handle company-related queries
async function handleCompanyQuery(content: string, isVietnamese: boolean) {
  const jobs = await Job.find({
    companyName: { $regex: content, $options: "i" },
  }).limit(5);

  if (jobs.length === 0) {
    return {
      content: isVietnamese
        ? "Tôi không tìm thấy công ty nào phù hợp với yêu cầu của bạn. Bạn có muốn thử tìm kiếm với từ khóa khác không?"
        : "I couldn't find any companies matching your query. Would you like to try a different search term?",
      jobRecommendations: [],
    };
  }

  return {
    content: isVietnamese
      ? "Đây là một số công ty và các vị trí tuyển dụng của họ:"
      : "Here are some companies and their job openings:",
    jobRecommendations: jobs,
  };
}

// Handle help and guidance queries
function handleHelpQuery(content: string, isVietnamese: boolean) {
  const helpTopics = isVietnamese
    ? {
        search:
          'Để tìm kiếm việc làm, bạn có thể sử dụng từ khóa như tên công việc, kỹ năng hoặc địa điểm. Ví dụ: "Tìm việc lập trình viên tại Hà Nội"',
        resume:
          "Để nhận gợi ý về sơ yếu lý lịch, hãy hỏi tôi về sơ yếu lý lịch hoặc CV của bạn. Tôi có thể giúp bạn cải thiện nó!",
        apply:
          'Để ứng tuyển vào một công việc, nhấp vào tin tuyển dụng và sử dụng nút "Ứng tuyển". Hãy đảm bảo sơ yếu lý lịch của bạn đã được cập nhật!',
        profile:
          'Để cập nhật hồ sơ của bạn, vào phần Hồ sơ và nhấp vào "Chỉnh sửa". Bạn có thể thêm kỹ năng, kinh nghiệm và sở thích của mình ở đó.',
      }
    : {
        search:
          'To search for jobs, you can use keywords like job title, skills, or location. For example: "Find software developer jobs in New York"',
        resume:
          "To get resume recommendations, ask me about your resume or CV. I can help you improve it!",
        apply:
          'To apply for a job, click on the job listing and use the "Apply" button. Make sure your resume is up to date!',
        profile:
          'To update your profile, go to the Profile section and click "Edit". You can add your skills, experience, and preferences there.',
      };

  let response = isVietnamese
    ? "Đây là cách tôi có thể giúp bạn:\n"
    : "Here's how I can help you:\n";
  Object.entries(helpTopics).forEach(([topic, description]) => {
    response += `\n${topic.toUpperCase()}: ${description}`;
  });

  return {
    content: response,
    jobRecommendations: [],
  };
}

// Handle job search queries
async function handleSearchQuery(content: string, isVietnamese: boolean) {
  const searchTerms = content.toLowerCase().split(" ");
  const jobs = await Job.find({
    $or: [
      { title: { $regex: searchTerms.join("|"), $options: "i" } },
      { description: { $regex: searchTerms.join("|"), $options: "i" } },
      { skills: { $in: searchTerms } },
    ],
  }).limit(5);

  if (jobs.length === 0) {
    return {
      content: isVietnamese
        ? "Tôi không tìm thấy công việc nào phù hợp với tìm kiếm của bạn. Hãy thử sử dụng từ khóa khác hoặc xem các danh mục việc làm của chúng tôi."
        : "I couldn't find any jobs matching your search. Try using different keywords or browse our job categories.",
      jobRecommendations: [],
    };
  }

  return {
    content: isVietnamese
      ? "Đây là một số công việc phù hợp với tìm kiếm của bạn:"
      : "Here are some jobs that match your search:",
    jobRecommendations: jobs,
  };
}

// Handle general queries
function handleGeneralQuery(content: string, isVietnamese: boolean) {
  return {
    content: isVietnamese
      ? "Tôi có thể giúp bạn với:\n- Tìm việc làm\n- Gợi ý về sơ yếu lý lịch\n- Thông tin về công ty\n- Hướng dẫn tìm việc\n\nBạn muốn biết thêm về điều gì?"
      : "I can help you with:\n- Finding jobs\n- Resume recommendations\n- Company information\n- Job search guidance\n\nWhat would you like to know more about?",
    jobRecommendations: [],
  };
}
