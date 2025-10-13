// Model configuration
// This contains the list of models that should be displayed in the leaderboard
// Models not in this list will be ignored even if they appear in the data files

const ALLOWED_MODELS = [
  // Proprietary LLMs
  'gpt-5',
  'gemini-2.5-pro',
  'gpt-o3-mini-high',
  'gemini-2.5-flash',
  'gpt-4.1',
  
  // Open-weight Thinking LLMs
  'gpt-oss-120b-high',
  'gpt-oss-20b-high',
  'gpt-oss-120b-medium',
  'gpt-oss-20b-medium',
  'Qwen3-32B',
  'deepseek-reasoner',
  'Qwen3-14B',
  'QwQ-32B',
  'Qwen3-30B',
  'Qwen3-8B',
  'DeepSeek-R1-Distill-Llama-70B',
  'DeepSeek-R1-Distill-Qwen-32B',
  'Qwen3-4B',
  'DeepSeek-R1-Distill-Qwen-14B',
  'DeepSeek-R1-Distill-Llama-8B',
  
  // Open-weight Non-Thinking LLMs
  'deepseek-chat',
  'Qwen3-32B-Non-Thinking',
  'Qwen2.5-Coder-32B-Instruct',
  'Qwen2.5-Coder-14B-Instruct',
  'Mistral-Large-Instruct-2411',
  'Mistral-Small-3.1-24B-2503',
  'Llama-4-Scout',
  'Qwen2.5-72B',
  'Llama-3.3-70B-Instruct',
  'Qwen3-30B-Non-Thinking',
  'Qwen3-4B-Non-Thinking',
  'Qwen3-8B-Non-Thinking',
  'Codestral-22B-v0.1',
  'Llama-3.1-8B-Instruct'
];

// Helper function to check if a model is allowed
function isModelAllowed(modelName) {
  return ALLOWED_MODELS.includes(modelName);
}

// Helper function to get all allowed models
function getAllowedModels() {
  return [...ALLOWED_MODELS];
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    ALLOWED_MODELS,
    isModelAllowed,
    getAllowedModels
  };
}