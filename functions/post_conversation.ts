import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const PostConversationDefinition = DefineFunction({
  callback_id: "post_conversation",
  title: "Post conversation",
  description: "Post a generated conversation in a channel mimicking users",
  source_file: "functions/post_conversation.ts",
  input_parameters: {
    properties: {
      response_text: {
        type: Schema.types.string,
        description: "The generated conversation text",
      },
      user_ids: {
        type: Schema.types.string,
        description: "Comma-separated list of user IDs to mimic",
      },
      channel_id: {
        type: Schema.slack.types.channel_id,
        description: "Channel to post the conversation",
      },
      numberOfUsers: {
        type: Schema.types.string, // Change to string
        description: "Number of users to mimic",
      },
    },
    required: ["response_text", "user_ids", "channel_id", "numberOfUsers"],
  },
  output_parameters: {
    properties: {
      result: {
        type: Schema.types.string,
        description: "Result of the posting operation",
      },
    },
    required: ["result"],
  },
});

export default SlackFunction(
  PostConversationDefinition,
  async ({ inputs, client }) => {
    const { response_text, user_ids, channel_id, numberOfUsers } = inputs;

    try {
      // Convert numberOfUsers from string to number
      const numUsers = parseInt(numberOfUsers, 10);
      if (isNaN(numUsers) || numUsers <= 0) {
        throw new Error(`Invalid number of users: ${numberOfUsers}`);
      }

      // Debugging: Log the response_text and user_ids
      console.log("User IDs:", user_ids);

      const userIdsArray = user_ids.split(",");
      if (userIdsArray.length < numUsers) {
        throw new Error(`At least ${numUsers} user IDs are required.`);
      }

      // Randomly pick the specified number of users from the userIdsArray
      const selectedUserIds = userIdsArray
        .sort(() => 0.5 - Math.random())
        .slice(0, numUsers);

      const conversationLines = response_text.split("\n").filter((line) =>
        line.trim() !== ""
      );
      let userIndex = 0;

      for (const line of conversationLines) {
        const userId = selectedUserIds[userIndex % selectedUserIds.length];
        userIndex++;

        const userInfoResponse = await client.users.info({ user: userId });
        if (!userInfoResponse.ok) {
          throw new Error(
            `Failed to fetch user info for user ID: ${userId}, error: ${userInfoResponse.error}`,
          );
        }

        const userInfo = userInfoResponse.user;
        if (!userInfo) {
          throw new Error(`User info not found for user ID: ${userId}`);
        }

        const { profile } = userInfo;
        const username = profile.real_name;
        const icon_url = profile.image_512;

        // Use variables within the template literal
        const messageText = `${line}`;

        const postMessageResponse = await client.chat.postMessage({
          channel: channel_id,
          text: messageText,
          username: username,
          icon_url: icon_url,
        });

        if (!postMessageResponse.ok) {
          throw new Error(
            `Failed to post message, error: ${postMessageResponse.error}`,
          );
        }

        // Wait a bit between messages to simulate a conversation
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      return {
        outputs: {
          result: "Conversation posted successfully",
        },
      };
    } catch (error) {
      console.error("Failed to post conversation:", error);
      return {
        outputs: {
          result: `Error: ${error.message}`,
        },
      };
    }
  },
);
