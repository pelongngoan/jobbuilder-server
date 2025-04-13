// English keywords for query analysis
export const ENGLISH_KEYWORDS = {
  resume: ["resume", "cv", "curriculum vitae"],
  job: ["job", "position", "work", "career", "employment"],
  company: ["company", "employer", "business", "organization"],
  help: ["help", "guide", "how to", "instruction"],
  search: ["search", "find", "look for", "seek"],
};

// English responses for different query types
export const ENGLISH_RESPONSES = {
  resume: {
    noResume:
      "I notice you don't have a resume uploaded yet. Would you like me to guide you through creating one?",
    recommendations: [
      "Consider adding more specific achievements with quantifiable results",
      "Make sure your skills match the job requirements you're interested in",
      "Keep your resume concise and focused on relevant experience",
    ],
    header: "Here are some recommendations for your resume:",
  },
  job: {
    noResults:
      "I couldn't find any jobs matching your query. Would you like to try a different search term?",
    header: "Here are some jobs that might interest you:",
  },
  company: {
    noResults:
      "I couldn't find any companies matching your query. Would you like to try a different search term?",
    header: "Here are some companies and their job openings:",
  },
  help: {
    header: "Here's how I can help you:",
    topics: {
      search:
        'To search for jobs, you can use keywords like job title, skills, or location. For example: "Find software developer jobs in New York"',
      resume:
        "To get resume recommendations, ask me about your resume or CV. I can help you improve it!",
      apply:
        'To apply for a job, click on the job listing and use the "Apply" button. Make sure your resume is up to date!',
      profile:
        'To update your profile, go to the Profile section and click "Edit". You can add your skills, experience, and preferences there.',
    },
  },
  search: {
    noResults:
      "I couldn't find any jobs matching your search. Try using different keywords or browse our job categories.",
    header: "Here are some jobs that match your search:",
  },
  general: {
    header:
      "I can help you with:\n- Finding jobs\n- Resume recommendations\n- Company information\n- Job search guidance\n\nWhat would you like to know more about?",
  },
};
