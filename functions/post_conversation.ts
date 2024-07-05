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
        type: Schema.types.string,
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
      console.log("Response Text:", response_text);
      console.log("User IDs:", user_ids);

      // Remove any '@' symbols from user IDs
      const userIdsArray = user_ids.split(",").map((id) =>
        id.trim().replace(/^@/, "")
      );
      if (userIdsArray.length < numUsers) {
        throw new Error(`At least ${numUsers} user IDs are required.`);
      }

      // Select the specified number of users from the userIdsArray
      const selectedUserIds = userIdsArray
        .sort(() => 0.5 - Math.random())
        .slice(0, numUsers);

      const conversationData = JSON.parse(response_text);
      const { conversations } = conversationData;

      // Ensure the app is a member of the channel
      const channelInfo = await client.conversations.info({
        channel: channel_id,
      });
      if (!channelInfo.ok) {
        throw new Error(`Failed to fetch channel info: ${channelInfo.error}`);
      }

      if (!channelInfo.channel.is_member) {
        // Try to join the channel
        const joinChannelResponse = await client.conversations.join({
          channel: channel_id,
        });
        if (!joinChannelResponse.ok) {
          throw new Error(
            `Failed to join channel: ${joinChannelResponse.error}`,
          );
        }
      }

      const allUserIds = [...new Set([...userIdsArray, ...selectedUserIds])];

      for (const conversation of conversations) {
        const { author, message, reacjis, replies } = conversation;

        console.log(`Author: ${author}`);
        const userId = allUserIds.find(
          (user) => user === author.replace(/^<@|>$/g, ""),
        );

        if (!userId) {
          console.error(`User ID for author ${author} not found in allUserIds`);
          console.log(`All User IDs: ${JSON.stringify(allUserIds)}`);
          throw new Error(`User ID for author ${author} not found`);
        }

        const userInfoResponse = await client.users.info({ user: userId });
        if (!userInfoResponse.ok) {
          throw new Error(
            `Failed to fetch user info for user ID: ${userId}, error: ${userInfoResponse.error}`,
          );
        }

        const userInfo = userInfoResponse.user;
        const { profile } = userInfo;
        const username = profile.real_name;
        const icon_url = profile.image_512;

        // Use variables within the template literal
        const messageText = `${message}`;

        const postMessageResponse = await client.chat.postMessage({
          channel: channel_id,
          text: messageText,
          username: username,
          icon_url: icon_url,
        });

        if (!postMessageResponse.ok) {
          console.error(`Failed to post message: ${postMessageResponse.error}`);
          continue; // Skip this conversation and continue with the next
        }

        const thread_ts = postMessageResponse.ts; // Save the timestamp for threading replies

        // Add reactions to the message
        for (const reacji of reacjis) {
          const emojiName = reacji.replace(/:/g, ""); // Remove colons from emoji name
          try {
            const addReactionResponse = await client.reactions.add({
              channel: channel_id,
              name: emojiName,
              timestamp: thread_ts,
            });

            if (!addReactionResponse.ok) {
              console.warn(
                `Failed to add reaction for emoji ${emojiName}, error: ${addReactionResponse.error}`,
              );
            }
          } catch (error) {
            console.warn(
              `Failed to add reaction for emoji ${emojiName}, error: ${error.message}`,
            );
          }
        }

        // Ensure replies is iterable
        const iterableReplies = Array.isArray(replies) ? replies : [];

        for (const reply of iterableReplies) {
          const {
            author: replyAuthor,
            message: replyMessage,
            reacjis: replyReacjis,
          } = reply;

          const replyUserId = allUserIds.find(
            (user) => user === replyAuthor.replace(/^<@|>$/g, ""),
          );

          if (!replyUserId) {
            console.error(
              `User ID for reply author ${replyAuthor} not found in allUserIds`,
            );
            console.log(`All User IDs: ${JSON.stringify(allUserIds)}`);
            throw new Error(
              `User ID for reply author ${replyAuthor} not found`,
            );
          }

          const replyUserInfoResponse = await client.users.info({
            user: replyUserId,
          });
          if (!replyUserInfoResponse.ok) {
            throw new Error(
              `Failed to fetch user info for user ID: ${replyUserId}, error: ${replyUserInfoResponse.error}`,
            );
          }

          const replyUserInfo = replyUserInfoResponse.user;
          const { profile: replyProfile } = replyUserInfo;
          const replyUsername = replyProfile.real_name;
          const replyIconUrl = replyProfile.image_512;

          const replyText = `${replyMessage}`;

          const postReplyResponse = await client.chat.postMessage({
            channel: channel_id,
            text: replyText,
            username: replyUsername,
            icon_url: replyIconUrl,
            thread_ts: thread_ts,
          });

          if (!postReplyResponse.ok) {
            console.error(`Failed to post reply: ${postReplyResponse.error}`);
            continue; // Skip this reply and continue with the next
          }

          // Add reactions to the reply
          for (const reacji of replyReacjis) {
            const emojiName = reacji.replace(/:/g, ""); // Remove colons from emoji name
            try {
              const addReplyReactionResponse = await client.reactions.add({
                channel: channel_id,
                name: emojiName,
                timestamp: postReplyResponse.ts,
              });

              if (!addReplyReactionResponse.ok) {
                console.warn(
                  `Failed to add reply reaction for emoji ${emojiName}, error: ${addReplyReactionResponse.error}`,
                );
              }
            } catch (error) {
              console.warn(
                `Failed to add reply reaction for emoji ${emojiName}, error: ${error.message}`,
              );
            }
          }
        }
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
