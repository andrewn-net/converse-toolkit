import { Manifest } from "deno-slack-sdk/mod.ts";
import { ChatGPTPromptDefinition } from "./functions/chatgpt_prompt.ts";
import { ChannelMembersFunctionDefinition } from "./functions/get_users.ts";
import { PostConversationDefinition } from "./functions/post_conversation.ts";
import { RunRemoteFunctionDefinition } from "./functions/run_remote.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "Old Mate Toolkit",
  description: "Workflow Steps to generate conversations using AI",
  icon: "assets/oldmate-icon.jpg",
  workflows: [],
  functions: [
    ChatGPTPromptDefinition,
    ChannelMembersFunctionDefinition,
    PostConversationDefinition,
    RunRemoteFunctionDefinition,
  ],
  outgoingDomains: [
    "api.openai.com",
    "old-mate-dev-0e51eba2c681.herokuapp.com",
  ],
  datastores: [],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "chat:write.customize",
    "users:read",
    "channels:read",
    "reactions:write",
    "datastore:read",
    "datastore:write",
    "channels:join",
  ],
});
