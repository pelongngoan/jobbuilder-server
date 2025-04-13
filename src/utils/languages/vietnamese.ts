// Vietnamese keywords for query analysis
export const VIETNAMESE_KEYWORDS = {
  resume: ["sơ yếu lý lịch", "cv", "hồ sơ", "lý lịch"],
  job: ["việc làm", "công việc", "nghề nghiệp", "vị trí", "job"],
  company: ["công ty", "doanh nghiệp", "nhà tuyển dụng", "công ty"],
  help: ["giúp", "hướng dẫn", "làm sao", "thế nào"],
  search: ["tìm", "tìm kiếm", "kiếm", "tìm việc", "tìm kiếm việc làm"],
};

// Vietnamese responses for different query types
export const VIETNAMESE_RESPONSES = {
  resume: {
    noResume:
      "Tôi nhận thấy bạn chưa tải lên sơ yếu lý lịch. Bạn có muốn tôi hướng dẫn cách tạo một sơ yếu lý lịch không?",
    recommendations: [
      "Hãy thêm các thành tích cụ thể với kết quả có thể đo lường được",
      "Đảm bảo kỹ năng của bạn phù hợp với yêu cầu công việc bạn quan tâm",
      "Giữ sơ yếu lý lịch ngắn gọn và tập trung vào kinh nghiệm liên quan",
    ],
    header: "Đây là một số gợi ý cho sơ yếu lý lịch của bạn:",
  },
  job: {
    noResults:
      "Tôi không tìm thấy công việc nào phù hợp với yêu cầu của bạn. Bạn có muốn thử tìm kiếm với từ khóa khác không?",
    header: "Đây là một số công việc có thể phù hợp với bạn:",
  },
  company: {
    noResults:
      "Tôi không tìm thấy công ty nào phù hợp với yêu cầu của bạn. Bạn có muốn thử tìm kiếm với từ khóa khác không?",
    header: "Đây là một số công ty và các vị trí tuyển dụng của họ:",
  },
  help: {
    header: "Đây là cách tôi có thể giúp bạn:",
    topics: {
      search:
        'Để tìm kiếm việc làm, bạn có thể sử dụng từ khóa như tên công việc, kỹ năng hoặc địa điểm. Ví dụ: "Tìm việc lập trình viên tại Hà Nội"',
      resume:
        "Để nhận gợi ý về sơ yếu lý lịch, hãy hỏi tôi về sơ yếu lý lịch hoặc CV của bạn. Tôi có thể giúp bạn cải thiện nó!",
      apply:
        'Để ứng tuyển vào một công việc, nhấp vào tin tuyển dụng và sử dụng nút "Ứng tuyển". Hãy đảm bảo sơ yếu lý lịch của bạn đã được cập nhật!',
      profile:
        'Để cập nhật hồ sơ của bạn, vào phần Hồ sơ và nhấp vào "Chỉnh sửa". Bạn có thể thêm kỹ năng, kinh nghiệm và sở thích của mình ở đó.',
    },
  },
  search: {
    noResults:
      "Tôi không tìm thấy công việc nào phù hợp với tìm kiếm của bạn. Hãy thử sử dụng từ khóa khác hoặc xem các danh mục việc làm của chúng tôi.",
    header: "Đây là một số công việc phù hợp với tìm kiếm của bạn:",
  },
  general: {
    header:
      "Tôi có thể giúp bạn với:\n- Tìm việc làm\n- Gợi ý về sơ yếu lý lịch\n- Thông tin về công ty\n- Hướng dẫn tìm việc\n\nBạn muốn biết thêm về điều gì?",
  },
};
