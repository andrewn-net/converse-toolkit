import {
  DefineFunction,
  // DefineType,
  Schema,
  SlackFunction,
} from "deno-slack-sdk/mod.ts";

export const RunRemoteFunctionDefinition = DefineFunction({
  callback_id: "run_remote",
  title: "Run Remote Conversation",
  description: "Run a previously defined conversation",
  source_file: "functions/run_remote.ts",
  input_parameters: {
    properties: {
      conversation_id: {
        type: Schema.types.string,
        description: "00000000-0000-0000-0000-000000000000",
        title: "Conversation Key",
        hint: "The key as shown in the Old Mate app.",
      },
      member: {
        type: Schema.slack.types.user_context,
      },
    },
    required: ["conversation_id", "member"],
  },
  output_parameters: {
    properties: {
      response: {
        type: Schema.types.string,
        description: "Conversation Response",
      },
    },
    required: ["response"],
  },
});

export default SlackFunction(
  RunRemoteFunctionDefinition,
  async ({ inputs, client, env }) => {
    const { conversation_id, member } = inputs;

    const url = `https://old-mate-dev-0e51eba2c681.herokuapp.com/run`;

    console.log("Old mate URL:", url);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          remote_id: conversation_id.trim(),
          member_id: member.id,
        }),
      });
      console.log("Response:", response);
      if (!response.ok) {
        await client.chat.postMessage({
          channel: member.id,
          text: "An error occured!",
        });
      }
      return {
        outputs: {
          response: "Conversation run complete",
        },
      };
    } catch (error) {
      // throw new Error("Failed to call Old Mate");
      console.log("Failed to call Old Mate: ", error.message, error);
      return {
        outputs: {
          response: `Error: Failed to call Old Mate - ${error.message}`,
        },
      };
    }
  },
);
