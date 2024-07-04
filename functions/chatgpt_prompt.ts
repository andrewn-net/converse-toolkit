import {
  DefineDatastore,
  DefineFunction,
  Schema,
  SlackFunction,
} from "deno-slack-sdk/mod.ts";

// Define the datastore
export const ResponsesDatastore = DefineDatastore({
  name: "responses",
  primary_key: "id",
  attributes: {
    id: { type: Schema.types.string },
    prompt: { type: Schema.types.string },
    response: { type: Schema.types.string },
  },
});

export const ChatGPTPromptDefinition = DefineFunction({
  callback_id: "chatgpt_prompt",
  title: "Generate conversation",
  description: "Generate conversation using ChatGPT",
  source_file: "functions/chatgpt_prompt.ts",
  input_parameters: {
    properties: {
      apiKey: {
        type: Schema.types.string,
        title: "OpenAI API key",
        description: "OpenAI API key",
      },
      industryText: {
        type: Schema.types.string,
        title: "Industry",
        description: "Industry",
      },
      topicText: {
        type: Schema.types.string,
        title: "Topic",
        description: "Topic",
      },
      numberOfUsers: {
        type: Schema.types.string,
        title: "Number of Users",
        description: "Number of users in the conversation",
      },
      conversationLength: {
        type: Schema.types.string, // Changed to string to be included in the prompt
        title: "Conversation Length",
        description: "Length of the conversation",
      },
      tone: {
        type: Schema.types.string,
        title: "Tone of Conversation",
        description: "Tone of the conversation",
        enum: ["Casual", "Formal"], // Static select options
      },
      emojiUsage: {
        type: Schema.types.string,
        title: "Use of Emoji",
        description: "Use of emoji",
        enum: ["None", "Minimal", "Heavy"], // Static select options
      },
    },
    required: [
      "apiKey",
      "industryText",
      "topicText",
      "numberOfUsers",
      "conversationLength",
      "tone",
      "emojiUsage",
    ],
  },
  output_parameters: {
    properties: {
      responseText: {
        type: Schema.types.string,
        description: "Response text from OpenAI",
      },
    },
    required: ["responseText"],
  },
});

export default SlackFunction(
  ChatGPTPromptDefinition,
  async ({ inputs, client }) => {
    try {
      const {
        apiKey,
        industryText,
        topicText,
        numberOfUsers,
        conversationLength,
        tone,
        emojiUsage,
      } = inputs;

      const promptText = `
      Generate a conversation between ${numberOfUsers} people about ${topicText} in the ${industryText} industry. 
      The conversation should be ${conversationLength} individual messages in length. For example, if it is ${numberOfUsers} users but the conversation length is ${conversationLength}, there should be ${conversationLength} sentences generated.
      Each person should have a distinct perspective and voice. The tone of the conversation should be ${tone}.
      The use of emoji throughout the conversation should be ${emojiUsage}. Minimal equals 1 emoji per sentence. Heavy means 3+ emoji per sentence. Emoji should be standard Slack emoji only.
      The conversation should be in ${conversationLength} messages, without including speaker names or labels. For example, remove quotes and do not include the prefix of Person A etc. Instead of Person A: "Hi" the output should just be Hi.
      `;

      console.log(promptText); // Debug prompt in terminal

      const openAIResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: promptText }],
            max_tokens: 500, // Set a reasonable token limit for the response
          }),
        },
      );

      if (!openAIResponse.ok) {
        throw new Error(
          `Failed to call OpenAI API. Status Code: ${openAIResponse.status}`,
        );
      }

      const responseData = await openAIResponse.json();

      const completionMessage = responseData.choices[0].message.content;

      console.log(completionMessage); // Debug generated content from OpenAI

      // Store the response in the datastore
      const responseId = crypto.randomUUID();
      await client.apps.datastore.put({
        datastore: ResponsesDatastore.name,
        item: {
          id: responseId,
          prompt: promptText,
          response: completionMessage,
        },
      });

      // Return the actual response content
      return { outputs: { responseText: completionMessage } };
    } catch (error) {
      console.error(`Error: ${error.message}`);
      throw error;
    }
  },
);
