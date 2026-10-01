/**
 * API Service Layer for communicating with Spring Boot backend
 */

const API_BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Analyzes legacy code by sending it to the backend
 * @param {string} legacyCode - The legacy Java code to analyze
 * @param {Object} options - Optional parameters
 * @returns {Promise<Object>} The analysis response
 */
export async function analyzeCode(legacyCode, options = {}) {
  const {
    targetJavaVersion = '21',
    refactoringGoals = ['reduce_complexity', 'modernize_syntax', 'improve_readability'],
    models = ['nemotron', 'gpt4o', 'gemini', 'claude'],
  } = options;

  const requestBody = {
    legacyCode,
    targetJavaVersion,
    refactoringGoals,
    models,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to backend. Please ensure the Spring Boot server is running on http://localhost:8080');
    }
    throw error;
  }
}

/**
 * Health check for the backend
 * @returns {Promise<boolean>} True if backend is reachable
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}