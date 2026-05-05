const API_BASE_URLS = [
  "https://espaceporcelaine.com/Quiz/backend/api",
  "https://espaceporcelaine.com/Quiz/backend/index.php/api",
];

/**
 * @param {string} path
 */
async function fetchJsonWithFallback(path) {
  let lastResponse = null;

  for (const baseUrl of API_BASE_URLS) {
    const url = `${baseUrl}${path}`;
    console.log("[API] GET", url);
    const response = await fetch(url);
    console.log("[API] status", response.status, url);

    if (response.ok) {
      return response.json();
    }

    lastResponse = response;
  }

  throw new Error(`Impossible de récupérer les données (status ${lastResponse ? lastResponse.status : "unknown"})`);
}

const API_BASE_URL = API_BASE_URLS[0];

const API = {
  /**
   * @param {string|number} questionId
   */
  async getQuestion(questionId) {
    return fetchJsonWithFallback(`/questions/${questionId}`);
  },

  /**
   * @returns {Promise<{questions: Array<any>}>}
   */
  async getAllQuestions() {
    return fetchJsonWithFallback("/questions");
  },

  /**
   * @param {string|number} questionId
   */
  async getAnswers(questionId) {
    return fetchJsonWithFallback(`/questions/${questionId}/reponses`);
  },
};

export { API_BASE_URL, API };
