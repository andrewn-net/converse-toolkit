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
      topics: {
        type: Schema.types.array,
        items: {
          type: Schema.types.string,
        },
        title: "Topics",
        description: "List of topics",
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
      userCount: {
        type: Schema.types.string,
        title: "Number of Users",
        description: "Number of users in the conversation",
      },
      conversationCount: {
        type: Schema.types.string,
        title: "Conversation Count",
        description: "Number of conversations to generate",
      },
      users: {
        type: Schema.types.array,
        items: {
          type: Schema.types.string,
        },
        title: "Users",
        description: "List of user IDs",
      },
      messageLength: {
        type: Schema.types.string,
        title: "Message Length",
        description: "Length of each conversation post",
      },
      useThreads: {
        type: Schema.types.string,
        title: "Use Threads?",
        description: "Include threads in the conversation",
        enum: [
          "Up to 5 replies",
          "Up to 10 replies",
          "Up to 15 replies",
          "Up to 20 replies",
          "Avoid threads", // Represents "Do not allow threads"
        ], // Static select options for threads
      },
      accountName: {
        type: Schema.types.string,
        title: "Account Name",
        description: "Name of the account",
      },
      customisation: {
        type: Schema.types.string,
        title: "Customisation",
        description: "Customisation text for the prompt",
      },
    },
    required: [
      "apiKey",
      "industryText",
      "topics",
      "tone",
      "emojiUsage",
      "userCount",
      "conversationCount",
      "users",
      "messageLength",
      "useThreads",
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
        topics,
        tone,
        emojiUsage,
        userCount,
        conversationCount,
        users,
        messageLength,
        useThreads,
        accountName,
        customisation,
      } = inputs;

      let prompt = "";
      const industryTextFormatted = accountName
        ? `${accountName}'s industry`
        : `the ${industryText} industry`;

      if (accountName) {
        prompt = `
        You know all about the company called ${accountName}. Ground your responses in the context of that company, their business, customers, and their operations.
        `;
      }

      if (customisation) {
        prompt += `
        ${customisation}
        `;
      }

      prompt += `
      Generate ${conversationCount} different Slack conversations between ${userCount} unique people. These people can @-mention each other. When they do so they use the following format:
      `;
      for (const user of users) {
        prompt += `- <@${user}>
        `;
      }

      if (topics.length > 0) {
        prompt += `
        Conversations can be about topics such as ${topics.join(", ")}
        `;
      }

      prompt += `
      Conversations must be grounded in ${industryTextFormatted}
      There should be ${conversationCount} conversations where each conversation should include a variable number of threaded replies between 0 and ${useThreads}.
      Each initial conversation post should have a minimum of 2 and a maximum of ${messageLength} sentences and may use simple markdown formatting for bold, italics, code.
      Each person should have a distinct perspective and voice. The tone of the conversation should be ${tone}.
      Each message can optionally allow for mentioning of other users as per the list above. Do not assume any other name for users. You must only reference the list above.
      Each message and reply can have between 0 and 4 emoji reactions (reacjis) attached to it.
      Include emoji throughout the message content. The use of emoji throughout the content of the message should be '${emojiUsage}'. Minimal equals 1 emoji per sentence. Heavy means 3+ emoji per sentence. Emoji must be standard Slack emoji only.
      Output the response in a JSON object in this format:
  
      {
      "conversations":[
          {
          "author":author_name,
          "message":message_content,
          "reacjis":[name_of_emoji_response],
          "replies":[
          {
              "author":reply_author_name,
              "message":reply_content,
              "reacjis":[name_of_emoji_responses]
          }
          ]
          }
      ]
      }
  
      There must be at least ${conversationCount} initial conversation posts. Make it happen! And don't forget to mention people by name in messages and ensure the output is properly structured JSON.
      `;

      console.log(prompt); // Log the prompt

      const openAIResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: prompt },
            ],
            max_tokens: 1000, // Set a reasonable token limit for the response
            reponse_format: {
              type: "json_object",
            },
          }),
        },
      );

      if (!openAIResponse.ok) {
        throw new Error(
          `Failed to call OpenAI API. Status Code: ${openAIResponse.status}`,
        );
      }

      const responseData = await openAIResponse.json();
      let completionMessage = responseData.choices[0].message.content.trim();

      console.log(completionMessage); // Log generated content from OpenAI

      // Clean up the response from markdown if it contains code block
      if (completionMessage.startsWith("```json")) {
        completionMessage = completionMessage.slice(7, -3).trim();
      }

      // Store the response in the datastore
      const responseId = crypto.randomUUID();
      await client.apps.datastore.put({
        datastore: ResponsesDatastore.name,
        item: {
          id: responseId,
          prompt: prompt,
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
