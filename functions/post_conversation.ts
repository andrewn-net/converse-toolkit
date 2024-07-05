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

const validEmojis = [
  "grinning",
  "grimacing",
  "grin",
  "joy",
  "smiley",
  "smile",
  "sweat_smile",
  "laughing",
  "innocent",
  "wink",
  "blush",
  "slightly_smiling_face",
  "upside_down_face",
  "relaxed",
  "yum",
  "relieved",
  "heart_eyes",
  "kissing_heart",
  "kissing",
  "kissing_smiling_eyes",
  "kissing_closed_eyes",
  "stuck_out_tongue_winking_eye",
  "stuck_out_tongue_closed_eyes",
  "stuck_out_tongue",
  "money_mouth_face",
  "nerd_face",
  "sunglasses",
  "hugging_face",
  "smirk",
  "no_mouth",
  "neutral_face",
  "expressionless",
  "unamused",
  "roll_eyes",
  "thinking",
  "flushed",
  "disappointed",
  "worried",
  "angry",
  "rage",
  "pensive",
  "confused",
  "slightly_frowning_face",
  "frowning_face",
  "persevere",
  "confounded",
  "tired_face",
  "weary",
  "triumph",
  "open_mouth",
  "scream",
  "fearful",
  "cold_sweat",
  "hushed",
  "frowning",
  "anguished",
  "cry",
  "disappointed_relieved",
  "sleepy",
  "sweat",
  "sob",
  "dizzy_face",
  "astonished",
  "zipper_mouth_face",
  "mask",
  "face_with_thermometer",
  "face_with_head_bandage",
  "sleeping",
  "zzz",
  "poop",
  "smiling_imp",
  "imp",
  "japanese_ogre",
  "japanese_goblin",
  "skull",
  "ghost",
  "alien",
  "robot_face",
  "smiley_cat",
  "smile_cat",
  "joy_cat",
  "heart_eyes_cat",
  "smirk_cat",
  "kissing_cat",
  "scream_cat",
  "crying_cat_face",
  "pouting_cat",
  "raised_hands",
  "clap",
  "wave",
  "thumbsup",
  "thumbsdown",
  "punch",
  "fist",
  "v",
  "ok_hand",
  "raised_hand",
  "open_hands",
  "muscle",
  "pray",
  "point_up",
  "point_up_2",
  "point_down",
  "point_left",
  "point_right",
  "middle_finger",
  "hand_splayed",
  "metal",
  "vulcan",
  "writing_hand",
  "nail_care",
  "lips",
  "tongue",
  "ear",
  "nose",
  "eye",
  "eyes",
  "bust_in_silhouette",
  "busts_in_silhouette",
  "speaking_head",
  "baby",
  "boy",
  "girl",
  "man",
  "woman",
  "person_with_blond_hair",
  "older_man",
  "older_woman",
  "man_with_gua_pi_mao",
  "man_with_turban",
  "cop",
  "construction_worker",
  "guardsman",
  "spy",
  "santa",
  "angel",
  "princess",
  "bride_with_veil",
  "walking",
  "runner",
  "dancer",
  "dancers",
  "couple",
  "two_men_holding_hands",
  "two_women_holding_hands",
  "bow",
  "information_desk_person",
  "no_good",
  "ok_woman",
  "raising_hand",
  "person_with_pouting_face",
  "person_frowning",
  "haircut",
  "massage",
  "couple_with_heart",
  "couplekiss",
  "family",
  "womans_clothes",
  "shirt",
  "jeans",
  "necktie",
  "dress",
  "bikini",
  "kimono",
  "lipstick",
  "kiss",
  "footprints",
  "high_heel",
  "sandal",
  "boot",
  "mans_shoe",
  "athletic_shoe",
  "womans_hat",
  "tophat",
  "mortar_board",
  "crown",
  "helmet_with_cross",
  "school_satchel",
  "pouch",
  "purse",
  "handbag",
  "briefcase",
  "eyeglasses",
  "dark_sunglasses",
  "ring",
  "closed_umbrella",
  "dog",
  "cat",
  "mouse",
  "hamster",
  "rabbit",
  "bear",
  "panda_face",
  "koala",
  "tiger",
  "lion_face",
  "cow",
  "pig",
  "pig_nose",
  "frog",
  "octopus",
  "monkey_face",
  "see_no_evil",
  "hear_no_evil",
  "speak_no_evil",
  "monkey",
  "chicken",
  "penguin",
  "bird",
  "baby_chick",
  "hatching_chick",
  "hatched_chick",
  "wolf",
  "boar",
  "horse",
  "unicorn",
  "bee",
  "bug",
  "snail",
  "beetle",
  "ant",
  "spider",
  "scorpion",
  "crab",
  "snake",
  "turtle",
  "tropical_fish",
  "fish",
  "blowfish",
  "dolphin",
  "whale",
  "whale2",
  "crocodile",
  "leopard",
  "tiger2",
  "water_buffalo",
  "ox",
  "cow2",
  "dromedary_camel",
  "camel",
  "elephant",
  "goat",
  "ram",
  "sheep",
  "racehorse",
  "pig2",
  "rat",
  "mouse2",
  "rooster",
  "turkey",
  "dove",
  "dog2",
  "poodle",
  "cat2",
  "rabbit2",
  "chipmunk",
  "feet",
  "dragon",
  "dragon_face",
  "cactus",
  "christmas_tree",
  "evergreen_tree",
  "deciduous_tree",
  "palm_tree",
  "seedling",
  "herb",
  "shamrock",
  "four_leaf_clover",
  "bamboo",
  "tanabata_tree",
  "leaves",
  "fallen_leaf",
  "maple_leaf",
  "mushroom",
  "ear_of_rice",
  "bouquet",
  "tulip",
  "rose",
  "wilted_rose",
  "hibiscus",
  "cherry_blossom",
  "blossom",
  "sunflower",
  "sun_with_face",
  "full_moon_with_face",
  "first_quarter_moon_with_face",
  "last_quarter_moon_with_face",
  "new_moon_with_face",
  "waxing_crescent_moon",
  "waning_crescent_moon",
  "first_quarter_moon",
  "waning_gibbous_moon",
  "last_quarter_moon",
  "new_moon",
  "waxing_gibbous_moon",
  "full_moon",
  "crescent_moon",
  "earth_africa",
  "earth_americas",
  "earth_asia",
  "volcano",
  "milky_way",
  "partly_sunny",
  "octocat",
  "squirrel",
];

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

      const userIdsArray = user_ids.split(",");
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
          (user) => user === author,
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
          throw new Error(
            `Failed to post message, error: ${postMessageResponse.error}`,
          );
        }

        // Add reactions to the message
        for (const reacji of reacjis) {
          const emojiName = reacji.replace(/:/g, ""); // Remove colons from emoji name
          if (validEmojis.includes(emojiName)) {
            const addReactionResponse = await client.reactions.add({
              channel: channel_id,
              name: emojiName,
              timestamp: postMessageResponse.ts,
            });

            if (!addReactionResponse.ok) {
              throw new Error(
                `Failed to add reaction, error: ${addReactionResponse.error}`,
              );
            }
          } else {
            console.warn(`Invalid emoji name: ${emojiName}`);
          }
        }

        for (const reply of replies) {
          const {
            author: replyAuthor,
            message: replyMessage,
            reacjis: replyReacjis,
          } = reply;

          const replyUserId = allUserIds.find(
            (user) => user === replyAuthor,
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
            thread_ts: postMessageResponse.ts,
          });

          if (!postReplyResponse.ok) {
            throw new Error(
              `Failed to post reply, error: ${postReplyResponse.error}`,
            );
          }

          // Add reactions to the reply
          for (const reacji of replyReacjis) {
            const emojiName = reacji.replace(/:/g, ""); // Remove colons from emoji name
            if (validEmojis.includes(emojiName)) {
              const addReplyReactionResponse = await client.reactions.add({
                channel: channel_id,
                name: emojiName,
                timestamp: postReplyResponse.ts,
              });

              if (!addReplyReactionResponse.ok) {
                throw new Error(
                  `Failed to add reply reaction, error: ${addReplyReactionResponse.error}`,
                );
              }
            } else {
              console.warn(`Invalid emoji name: ${emojiName}`);
            }
          }
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
