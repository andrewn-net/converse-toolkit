import { Manifest } from "deno-slack-sdk/mod.ts";
import { ChatGPTPromptDefinition } from "./functions/chatgpt_prompt.ts";
import { ChannelMembersFunctionDefinition } from "./functions/get_users.ts";
import { PostConversationDefinition } from "./functions/post_conversation.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "oldmate-toolkit",
  description: "Workflow Steps to generate conversations using AI",
  icon: "assets/oldmate-icon.jpg",
  workflows: [],
  functions: [
    ChatGPTPromptDefinition,
    ChannelMembersFunctionDefinition,
    PostConversationDefinition,
  ],
  outgoingDomains: ["api.openai.com"],
  datastores: [],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "chat:write.customize",
    "users:read",
    "channels:read",
    "datastore:read",
    "datastore:write",
  ],
});
