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
  'grok-4-fast-reasoning',
  'claude-sonnet-4.5',
  
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

// Display name mapping for models
const MODEL_DISPLAY_NAMES = {
  // GPT models
  'gpt-5': 'GPT-5',
  'gpt-4.1': 'GPT-4.1',
  'gpt-o3-mini-high': 'o3-mini-high',
  'gpt-oss-120b-high': 'GPT-OSS-120B-High',
  'gpt-oss-20b-high': 'GPT-OSS-20B-High',
  'gpt-oss-120b-medium': 'GPT-OSS-120B-Medium',
  'gpt-oss-20b-medium': 'GPT-OSS-20B-Medium',
  'gpt-oss-120b-low': 'GPT-OSS-120B-Low',
  'gpt-oss-20b-low': 'GPT-OSS-20B-Low',
  'gpt-oss-20b-medium': 'GPT-OSS-20B-Medium',
  
  // All other models keep their original names
  'gemini-2.5-pro': 'Gemini-2.5-pro',
  'gemini-2.5-flash': 'Gemini-2.5-flash',
  'grok-4-fast-reasoning': 'Grok-4-Fast-Reasoning',
  'claude-sonnet-4.5': 'Claude-Sonnet-4.5',
  'Qwen3-32B': 'Qwen3-32B',
  'deepseek-reasoner': 'Deepseek-R1',
  'Qwen3-14B': 'Qwen3-14B',
  'QwQ-32B': 'QwQ-32B',
  'Qwen3-30B': 'Qwen3-30B',
  'Qwen3-8B': 'Qwen3-8B',
  'DeepSeek-R1-Distill-Llama-70B': 'DeepSeek-R1-Distill-Llama-70B',
  'DeepSeek-R1-Distill-Qwen-32B': 'DeepSeek-R1-Distill-Qwen-32B',
  'Qwen3-4B': 'Qwen3-4B',
  'DeepSeek-R1-Distill-Qwen-14B': 'DeepSeek-R1-Distill-Qwen-14B',
  'DeepSeek-R1-Distill-Llama-8B': 'DeepSeek-R1-Distill-Llama-8B',
  'deepseek-chat': 'Deepseek-V3',
  'Qwen3-32B-Non-Thinking': 'Qwen3-32B-Non-Thinking',
  'Qwen2.5-Coder-32B-Instruct': 'Qwen2.5-Coder-32B-Instruct',
  'Qwen2.5-Coder-14B-Instruct': 'Qwen2.5-Coder-14B-Instruct',
  'Mistral-Large-Instruct-2411': 'Mistral-Large-Instruct-2411',
  'Mistral-Small-3.1-24B-2503': 'Mistral-Small-3.1-24B-2503',
  'Llama-4-Scout': 'Llama-4-Scout',
  'Qwen2.5-72B': 'Qwen2.5-72B',
  'Llama-3.3-70B-Instruct': 'Llama-3.3-70B-Instruct',
  'Qwen3-30B-Non-Thinking': 'Qwen3-30B-Non-Thinking',
  'Qwen3-4B-Non-Thinking': 'Qwen3-4B-Non-Thinking',
  'Qwen3-8B-Non-Thinking': 'Qwen3-8B-Non-Thinking',
  'Codestral-22B-v0.1': 'Codestral-22B-v0.1',
  'Llama-3.1-8B-Instruct': 'Llama-3.1-8B-Instruct'
};

// Helper function to check if a model is allowed
function isModelAllowed(modelName) {
  return ALLOWED_MODELS.includes(modelName);
}

// Helper function to get all allowed models
function getAllowedModels() {
  return [...ALLOWED_MODELS];
}

// Helper function to get display name for a model
function getModelDisplayName(modelName) {
  return MODEL_DISPLAY_NAMES[modelName] || modelName;
}

// Model category mapping
const MODEL_CATEGORIES = {
  'proprietary': [
    'gpt-5',
    'gemini-2.5-pro',
    'gpt-o3-mini-high',
    'gemini-2.5-flash',
    'gpt-4.1',
    'grok-4-fast-reasoning',
    'claude-sonnet-4.5'
  ],
  'open-weight-thinking': [
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
    'DeepSeek-R1-Distill-Llama-8B'
  ],
  'open-weight-non-thinking': [
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
  ]
};

// Helper function to get category for a model
function getModelCategory(modelName) {
  for (const [category, models] of Object.entries(MODEL_CATEGORIES)) {
    if (models.includes(modelName)) {
      return category;
    }
  }
  return null;
}

// Helper function to check if model is in selected categories
function isModelInCategories(modelName, selectedCategories) {
  const category = getModelCategory(modelName);
  return category && selectedCategories.has(category);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    ALLOWED_MODELS,
    MODEL_DISPLAY_NAMES,
    MODEL_CATEGORIES,
    isModelAllowed,
    getAllowedModels,
    getModelDisplayName,
    getModelCategory,
    isModelInCategories
  };
}
