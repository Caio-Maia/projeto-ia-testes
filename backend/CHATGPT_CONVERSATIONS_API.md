# ChatGPT Conversation API Integration

## Overview

This integration uses OpenAI's new Conversations API for managing multi-turn conversations with ChatGPT, specifically designed to work seamlessly with the feedback system.

## API Endpoints

### 1. Create Conversation
**Endpoint:** `POST /api/chatgpt-conversation`

Creates a new conversation with an initial message.

**Request:**
```json
{
  "topic": "demo",
  "initialMessage": "Hello! I need help improving a user story."
}
```

**Response:**
```json
{
  "conversationId": "conv_123",
  "metadata": {"topic": "demo"},
  "createdAt": 1741900000,
  "initialResponse": {
    "role": "assistant",
    "content": "Sure! I'd be happy to help..."
  }
}
```

### 2. Send Message
**Endpoint:** `POST /api/chatgpt-conversation/message`

Send a message to an existing conversation and get a response.

**Request:**
```json
{
  "conversationId": "conv_123",
  "message": "Can you improve this user story?",
  "model": "gpt-4o-mini"
}
```

**Response:**
```json
{
  "conversationId": "conv_123",
  "userMessage": "Can you improve this user story?",
  "aiResponse": {
    "role": "assistant",
    "content": "Sure! Please provide the user story..."
  }
}
```

### 3. Get Conversation History
**Endpoint:** `GET /api/chatgpt-conversation/:conversationId`

Retrieve the full conversation history.

**Response:**
```json
{
  "id": "conv_123",
  "object": "conversation",
  "created_at": 1741900000,
  "metadata": {"topic": "demo"},
  "items": [
    {
      "type": "message",
      "role": "user",
      "content": "Hello!"
    },
    {
      "type": "message",
      "role": "assistant",
      "content": "Hi there! How can I help?"
    }
  ]
}
```

### 4. Regenerate with Feedback
**Endpoint:** `POST /api/chatgpt-conversation/regenerate`

Send feedback about a response and get a revised version.

**Request:**
```json
{
  "conversationId": "conv_123",
  "feedback": "The response was too verbose, please be more concise",
  "model": "gpt-4o-mini"
}
```

**Response:**
```json
{
  "conversationId": "conv_123",
  "feedback": "The response was too verbose, please be more concise",
  "revisedResponse": {
    "role": "assistant",
    "content": "Here's a more concise version..."
  }
}
```

## Integration with Feedback System

The new Conversations API works seamlessly with the feedback system:

1. **Create Conversation** - Store the `conversationId` in the feedback record
2. **Send Messages** - Each generation creates a new entry in the conversation history
3. **Apply Feedback** - Use the **Regenerate with Feedback** endpoint to keep context
4. **Maintain History** - All messages and regenerations are stored in the conversation

## Environment Setup

Add to your `.env` file:
```
CHATGPT_API_KEY=sk-...your-openai-api-key...
```

## Usage Example

### Frontend Implementation

```javascript
// Create conversation
const createConversation = async (taskDescription) => {
  const response = await fetch('/api/chatgpt-conversation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'task_improvement',
      initialMessage: taskDescription
    })
  });
  return response.json();
};

// Send feedback and get revision
const applyFeedback = async (conversationId, feedbackText) => {
  const response = await fetch('/api/chatgpt-conversation/regenerate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversationId,
      feedback: feedbackText,
      model: 'gpt-4o-mini'
    })
  });
  return response.json();
};
```

## Benefits

✅ **Conversation Context** - AI maintains context across multiple turns
✅ **Feedback Integration** - Revisions based on feedback use full conversation history
✅ **Conversation Persistence** - All history stored by OpenAI
✅ **Metadata Support** - Track conversation topics and purposes
✅ **Standard Chat Format** - Compatible with feedback database schema

## Notes

- The Conversations API is the latest OpenAI API for managing conversations
- All conversations are persisted by OpenAI
- The `conversationId` should be stored with feedback records for future reference
- Model selection is flexible - use any available ChatGPT model
