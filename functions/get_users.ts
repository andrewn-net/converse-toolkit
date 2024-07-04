import {
  DefineDatastore,
  DefineFunction,
  Schema,
  SlackFunction,
} from "deno-slack-sdk/mod.ts";

// Define the datastore to store user IDs
export const ChannelMembersDatastore = DefineDatastore({
  name: "channel_members",
  primary_key: "channel_id",
  attributes: {
    channel_id: { type: Schema.types.string },
    user_ids: { type: Schema.types.string }, // Storing user IDs as a comma-separated string
  },
});

export const ChannelMembersFunctionDefinition = DefineFunction({
  callback_id: "get_users",
  title: "Fetch users from a channel",
  description: "Get all members of a specified Slack channel",
  source_file: "functions/get_users.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
        description: "Channel to fetch members from",
      },
    },
    required: ["channel_id"],
  },
  output_parameters: {
    properties: {
      user_ids: {
        type: Schema.types.string,
        description: "Comma-separated list of user IDs in the channel",
      },
      error: {
        type: Schema.types.string,
        description: "Error message if any",
      },
    },
    required: ["user_ids", "error"], // Ensuring both are always present
  },
});

export default SlackFunction(
  ChannelMembersFunctionDefinition,
  async ({ inputs, client }) => {
    const { channel_id } = inputs;

    try {
      const membersResponse = await client.conversations.members({
        channel: channel_id,
      });

      if (!membersResponse || !membersResponse.members) {
        throw new Error("No members found or unable to fetch members.");
      }

      // Filter out bots and apps
      const fullMembers = await Promise.all(
        membersResponse.members.map(async (memberId: string) => {
          const userInfo = await client.users.info({ user: memberId });
          return userInfo.user.is_bot ? null : memberId;
        }),
      );

      // Remove null values from the array
      const filteredMembers = fullMembers.filter((memberId) =>
        memberId !== null
      );

      const user_ids = filteredMembers.join(","); // Comma-separated list of user IDs

      // Store the user IDs in the datastore
      await client.apps.datastore.put({
        datastore: ChannelMembersDatastore.name,
        item: {
          channel_id: channel_id,
          user_ids: user_ids,
        },
      });

      return {
        outputs: {
          user_ids: user_ids,
          error: "", // No error, return an empty string
        },
      };
    } catch (error) {
      console.error("Failed to retrieve channel members:", error);
      return {
        outputs: {
          user_ids: "", // No user IDs due to error, return an empty string
          error: error.message,
        },
      };
    }
  },
);
