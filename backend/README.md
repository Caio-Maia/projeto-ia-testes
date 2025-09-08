# Backend API for AI-Powered Task & Test Case Generator

This backend provides a flexible API for interacting with different AI models to improve tasks, generate test cases, and analyze implementation risks.

## Architecture

The backend uses a modular architecture to support different AI models and versions:

```
├── api/                      # API routes and entry points
├── controllers/              # Request handlers for different features
│   ├── aiController.js       # Unified controller for AI operations
│   ├── chatgptController.js  # Legacy controller for ChatGPT
│   ├── geminiController.js   # Legacy controller for Gemini
│   └── ...
├── models/                   # Data models and schemas
│   ├── aiModel.js            # Base class for AI models
│   ├── chatgptModel.js       # ChatGPT model implementation
│   ├── geminiModel.js        # Gemini model implementation
│   ├── feedbackModel.js      # Feedback data model (SQLite)
│   └── aiModelFactory.js     # Factory for creating AI model instances
├── services/                 # Business logic services
│   └── aiService.js          # Service for AI operations
├── config/                   # Configuration files
│   ├── aiModels.js           # Configuration for AI models and versions
│   └── database.js           # SQLite database configuration
└── data/                     # Directory for SQLite database file
```

## Database

The application uses SQLite as a local database for storing feedback and other persistent data. This provides several advantages:

- No need for external database server setup
- Data is stored locally in a file
- Faster response times for local development
- No connection timeout issues

The database configuration is in `config/database.js` and the database file is stored in the `data` directory.

## API Endpoints

### Unified AI Endpoints

These endpoints support all AI models through a unified interface:

- `POST /api/ai/improve-task` - Improve a task description
- `POST /api/ai/generate-tests` - Generate test cases for a task
- `POST /api/ai/generate-test-code` - Generate test code for test cases
- `POST /api/ai/analyze-risks` - Analyze implementation risks
- `GET /api/ai/models` - Get available AI models and versions

### Feedback Endpoints

- `POST /api/feedback` - Submit feedback for a generation
- `GET /api/feedback/stats` - Get feedback statistics
- `GET /api/feedback/recent` - Get recent feedback with comments
- `POST /api/feedback/regenerate` - Regenerate content based on feedback

### Request Format

```json
{
  "modelType": "chatgpt|gemini",
  "modelVersion": "gpt-3.5-turbo|gpt-4|gemini-1.5-flash|...",
  "task": "Task description",
  "testCases": "Test cases",
  "framework": "Jest",
  "language": "JavaScript"
}
```

### Response Format

For ChatGPT:
```json
"Generated content as string"
```

For Gemini:
```json
{
  "data": "Generated content as string"
}
```

## Adding a New AI Model

To add a new AI model:

1. Create a new model implementation in `models/` that extends `AIModel`
2. Add the model to `AIModelFactory`
3. Add the model configuration to `config/aiModels.js`

Example:

```javascript
// models/newModel.js
const AIModel = require('./aiModel');

class NewModel extends AIModel {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.model = config.model || 'default-version';
    this.baseUrl = 'https://api.newmodel.com/v1';
  }

  async _makeRequest(prompt) {
    // Implementation
  }

  async improveTask(task, options = {}) {
    // Implementation
  }

  // Other methods...
}

module.exports = NewModel;
```

Then update the factory:

```javascript
// models/aiModelFactory.js
const NewModel = require('./newModel');

// In AIModelFactory class:
static MODEL_TYPES = {
  CHATGPT: 'chatgpt',
  GEMINI: 'gemini',
  NEW_MODEL: 'newmodel'
};

static createModel(type, config = {}) {
  switch (type.toLowerCase()) {
    case this.MODEL_TYPES.CHATGPT:
      return new ChatGPTModel(config);
    case this.MODEL_TYPES.GEMINI:
      return new GeminiModel(config);
    case this.MODEL_TYPES.NEW_MODEL:
      return new NewModel(config);
    default:
      throw new Error(`Unsupported AI model type: ${type}`);
  }
}
```

And add the configuration:

```javascript
// config/aiModels.js
const aiModelsConfig = {
  // Existing models...
  
  newmodel: {
    versions: [
      {
        id: 'default-version',
        name: 'Default Version',
        description: 'Default version of the new model',
        isDefault: true
      },
      // Other versions...
    ],
    apiEndpoint: 'https://api.newmodel.com/v1'
  }
};
```

## Changing Model Versions

To add or update model versions, simply modify the configuration in `config/aiModels.js`:

```javascript
// config/aiModels.js
const aiModelsConfig = {
  chatgpt: {
    versions: [
      // Existing versions...
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Latest GPT-4 model with improved capabilities',
        isDefault: false
      }
    ],
    apiEndpoint: 'https://api.openai.com/v1/chat/completions'
  }
};
```

## Running Tests

```bash
npm test
```

## Environment Variables

- `CHATGPT_API_KEY` - API key for ChatGPT
- `GEMINI_API_KEY` - API key for Gemini