import { LANGUAGE_RESOURCES, Language } from "./languages";

type QueryType = "resume" | "job" | "company" | "help" | "search" | "general";

export interface QueryAnalysis {
  type: QueryType;
  confidence: number;
  keywords: string[];
}

export function analyzeQuery(query: string, language: Language): QueryAnalysis {
  const resources = LANGUAGE_RESOURCES[language];
  const normalizedQuery = query.toLowerCase().trim();

  let bestMatch: QueryAnalysis = {
    type: "general",
    confidence: 0,
    keywords: [],
  };

  // Check each query type
  for (const [type, keywords] of Object.entries(resources.keywords)) {
    const matchedKeywords = keywords.filter((keyword) =>
      normalizedQuery.includes(keyword.toLowerCase())
    );

    if (matchedKeywords.length > 0) {
      const confidence = matchedKeywords.length / keywords.length;

      if (confidence > bestMatch.confidence) {
        bestMatch = {
          type: type as QueryType,
          confidence,
          keywords: matchedKeywords,
        };
      }
    }
  }

  return bestMatch;
}

export function getResponse(
  analysis: QueryAnalysis,
  language: Language,
  data?: any
): string {
  const resources = LANGUAGE_RESOURCES[language];
  const responses = resources.responses[analysis.type];

  if (!responses) {
    return resources.responses.general.header;
  }

  // If we have data and a specific response for that data type
  if (data && responses[data.type]) {
    return responses[data.type];
  }

  // Return the header response for this query type
  return responses.header || resources.responses.general.header;
}
