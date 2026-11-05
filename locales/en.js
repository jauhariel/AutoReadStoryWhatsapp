// English — natural translation, keys must match locales/id.js
module.exports = {
  // pairing / login (terminal)
  loginPrompt:
    "Hi, it looks like you're not logged in yet. Want to log in to WhatsApp using a pairing code?\nPlease reply with (y/n)\ntype y to agree, or type n to log in using a QR code",
  pairingQuestion:
    "\nWould you like to use a pairing code to log in to WhatsApp? (y/n): ",
  enterNumberNote:
    "Alright, please enter your WhatsApp number!\nnote : use the full international format with the country code, e.g. 628123456789",
  enterNumberPrompt: "\nEnter your WhatsApp number: ",
  numberDigitsOnly:
    "The number must contain digits only!\nPlease enter your WhatsApp number again.",
  numberIntlFormat:
    "The number must use the full international format with the country code!\nExample : Indonesia 628123456789, Malaysia 60123456789\nPlease enter your WhatsApp number again.",
  pairingCodeNotice: "\nCheck your WhatsApp notifications and enter this login code:",
  qrInstructions:
    "Open WhatsApp, tap the three dots in the top right corner, then tap Linked devices. After that, scan the QR code below to log in to WhatsApp",
  invalidInput: 'Invalid input. Please enter "y" or "n".',

  // koneksi (terminal)
  reconnecting: "Trying to connect to WhatsApp...\n",
  loggedOut:
    "It looks like you've been logged out of WhatsApp, please log in again!",
  connected: "Successfully connected to WhatsApp",
  loggedInConsole: "You're logged in with the number:",
  botActiveConsole:
    "The bot is active!\n\nEnjoy the auto read story whatsapp feature by",

  // welcome message (WhatsApp)
  welcome: ({
    number,
    autoReadStatus,
    autoLikeStatus,
    downloadMediaStatus,
    sensorNomor,
    antiTelpon,
    autoKickStory,
  }) => {
    const a = (v) => (v ? "*On*" : "*Off*");
    return `The *AutoReadStoryWhatsApp* bot is active!
You're logged in with the number: ${number}

Feature status:
- Auto Read Status: ${a(autoReadStatus)}
- Auto Like Status: ${a(autoLikeStatus)}
- Download Media Status: ${a(downloadMediaStatus)}
- Number Masking: ${a(sensorNomor)}
- Anti-Call: ${a(antiTelpon)}
- Auto Kick Group Story: ${a(autoKickStory)}

Type *#menu* to see the available commands.

SC : https://github.com/jauhariel/AutoReadStoryWhatsapp`;
  },

  // validateNumber
  numberMissing: (commandname, type, sc) =>
    `The number is required.\nexample:\n\`${commandname} blacklist 628123456789\`\n\nAvailable arguments:\n\n\`${commandname} blacklist number\`\nto ${type} a number ${sc} the blacklist\n\n\`${commandname} whitelist number\`\nto ${type} a number ${sc} the whitelist`,
  numberInvalid: (commandname, type, sc) =>
    `The number must contain digits only.\nexample:\n\`${commandname} blacklist 628123456789\`\n\nAvailable arguments:\n\n\`${commandname} blacklist number\`\nto ${type} a number ${sc} the blacklist\n\n\`${commandname} whitelist number\`\nto ${type} a number ${sc} the whitelist`,
  actionAdd: "add",
  actionRemove: "remove",
  prepTo: "to",
  prepFrom: "from",

  // feature names (for on/off logs & replies)
  featAutoread: "Auto Read Status",
  featAutolike: "Auto Like Status",
  featDlmedia: "Download Media Status",
  featSensornomor: "Number Masking",
  featAntitelpon: "Anti-Call",
  featKickstory: "Auto Kick Group Story",

  featureOnLog: (name) => `Enabled the ${name} feature`,
  featureOffLog: (name) => `Disabled the ${name} feature`,
  featureOn: (name) => `${name} enabled`,
  featureOff: (name) => `${name} disabled`,

  invalidFeatureArg: (arg) =>
    `Invalid argument: ${arg}. Available options: autoread, autolike, dlmedia, sensornomor, kickstory and antitelpon`,
  invalidListArg: (arg) =>
    `Invalid argument: ${arg}. Available options: blacklist, whitelist, emojis`,

  // #on / #off / #add / #remove help
  onHelp: `where are the arguments?\nexample:\n\`#on autolike\`\n\nAvailable arguments:\n\n\`#on autoread\`\nto enable the autoread story feature\n\n\`#on autolike\`\nto enable the autolike story feature\n\n\`#on dlmedia\`\nto enable downloading media (photos, videos, and audio) from stories\n\n\`#on sensornomor\`\nto enable number masking\n\n\`#on antitelpon\`\nto enable anti-call\n\n\`#on kickstory\`\nto enable auto kick group story`,
  offHelp: `where are the arguments?\nexample:\n\`#off autolike\`\n\nAvailable arguments:\n\n\`#off autoread\`\nto disable the autoread story feature\n\n\`#off autolike\`\nto disable the autolike story feature\n\n\`#off dlmedia\`\nto disable downloading media (photos, videos, and audio) from stories\n\n\`#off sensornomor\`\nto disable number masking\n\n\`#off antitelpon\`\nto disable anti-call\n\n\`#off kickstory\`\nto disable auto kick group story`,
  addHelp: `where are the arguments?\nexample:\n\`#add blacklist 628123456789\`\n\nAvailable arguments:\n\n\`#add blacklist number\`\nto add a number to the blacklist\n\n\`#add whitelist number\`\nto add a number to the whitelist\n\n\`#add emojis emoji\`\nto add an emoji to the emojis list`,
  removeHelp: `where are the arguments?\nexample:\n\`#remove blacklist 628123456789\`\n\nAvailable arguments:\n\n\`#remove blacklist number\`\nto remove a number from the blacklist\n\n\`#remove whitelist number\`\nto remove a number from the whitelist\n\n\`#remove emojis emoji\`\nto remove an emoji from the emojis list`,

  // emojis
  emojiRequired: (cmd) =>
    `the emoji is required.\nexample:\n\`${cmd} emojis 👍\``,
  emojiOnlyOne: (cmd) =>
    `only 1 emoji is allowed.\nexample:\n\`${cmd} emojis 👍\``,
  emojiAddedLog: (e) => `You added the emoji ${e} to the emojis list`,
  emojiAdded: (e) => `emoji ${e} has been added to the emojis list`,
  emojiExists: (e) => `emoji ${e} is already in the emojis list`,
  emojiLast:
    "Can't remove the last emoji. There must be at least one emoji.\n\nType `#info` to check the available emojis",
  emojiRemovedLog: (e) => `You removed the emoji ${e} from emojis`,
  emojiRemoved: (e) => `emoji ${e} has been removed from the emojis list`,
  emojiNotFound: (e) =>
    `emoji ${e} is not in the emojis list\n\nType \`#info\` to check the available emojis`,

  // blacklist / whitelist
  numberAddedLog: (num, list) => `You added the number ${num} to the ${list}`,
  numberAdded: (num, list) => `Number ${num} has been added to the ${list}`,
  numberExists: (num, list) => `Number ${num} is already in the ${list}`,
  numberRemovedLog: (num, list) => `You removed the number ${num} from the ${list}`,
  numberRemoved: (num, list) => `Number ${num} has been removed from the ${list}`,
  numberNotFound: (num, list) =>
    `Number ${num} is not in the ${list}\n\nType \`#info\` to check the available numbers`,

  // menu
  menu: `Command list:
example usage: #on autolike

On commands:
\`#on autoread\`
Enables the autoread story feature

\`#on autolike\`
Enables the autolike story feature

\`#on dlmedia\`
Enables downloading media (photos, videos, and audio) from stories

\`#on sensornomor\`
Enables number masking

\`#on antitelpon\`
Enables anti-call

\`#on kickstory\`
Enables auto kick group story

Off commands:
\`#off autoread\`
Disables the autoread story feature

\`#off autolike\`
Disables the autolike story feature

\`#off dlmedia\`
Disables downloading media (photos, videos, and audio) from stories

\`#off sensornomor\`
Disables number masking

\`#off antitelpon\`
Disables anti-call

\`#off kickstory\`
Disables auto kick group story

Add commands:
\`#add blacklist number\`
Adds a number to the blacklist

\`#add whitelist number\`
Adds a number to the whitelist

\`#add emojis emoji\`
Adds an emoji to the emojis list

Remove commands:
\`#remove blacklist number\`
Removes a number from the blacklist

\`#remove whitelist number\`
Removes a number from the whitelist

\`#remove emojis emoji\`
Removes an emoji from the emojis list

Info command:
\`#info\`
Shows feature statuses and the numbers/emojis in the blacklist, whitelist, and emojis

Viewonce command:
\`#viewonce\`
Retrieves/downloads photos, videos, or audio from a view-once message you replied to

Language command:
\`#lang en\`
Changes the bot & terminal language (id/en)

Story commands:
\`#poststory your text\`
Posts a text story

\`#poststory\` (reply to a photo/video)
Posts a photo/video story from the message you replied to

\`#poststory text | number1,number2\`
Posts a story visible only to the numbers you list

Contacts command:
\`#listkontak\`
Shows how many contacts have been synced to the bot

\`#listkontak name\`
Searches contacts by name or number
`,

  // viewonce
  viewonceImageLog:
    "Successfully retrieved the view-once image from your replied message",
  viewonceVideoLog:
    "Successfully retrieved the view-once video from your replied message",
  viewonceAudioLog:
    "Successfully retrieved the view-once audio from your replied message",
  viewonceInvalid:
    "The message you replied to is not a view-once photo, video, or audio message",
  viewonceNoQuote:
    "Reply to a view-once message with the #viewonce command",

  // info
  info: ({
    autoReadStatus,
    autoLikeStatus,
    downloadMediaStatus,
    sensorNomor,
    antiTelpon,
    autoKickStory,
  }) => {
    const a = (v) => (v ? "*On*" : "*Off*");
    return `Feature status:
- Auto Read Status: ${a(autoReadStatus)}
- Auto Like Status: ${a(autoLikeStatus)}
- Download Media Status: ${a(downloadMediaStatus)}
- Number Masking: ${a(sensorNomor)}
- Anti-Call: ${a(antiTelpon)}
- Auto Kick Group Story: ${a(autoKickStory)}`;
  },
  blacklistList: (list) => `Blacklist:\n${list}`,
  blacklistEmpty: "Blacklist is empty.",
  whitelistList: (list) => `Whitelist:\n${list}`,
  whitelistEmpty: "Whitelist is empty.",
  emojisList: (list) => `Emojis:\n${list}`,
  emojisEmpty: "Emojis is empty.",
  infoFooter: `\n\nType \`#add\` to add a number or emoji to the blacklist, whitelist, and emojis\nType \`#remove\` to remove a number or emoji from the blacklist, whitelist, and emojis\nType \`#on\` to enable a feature\nType \`#off\` to disable a feature\nType \`#menu\` to see the available commands`,

  // #lang
  langHelp: (current) =>
    `current language: *${current}*\nexample:\n\`#lang id\` for Bahasa Indonesia\n\`#lang en\` for English`,
  langChangedLog: (lang) => `Language changed to: ${lang}`,
  langChanged: (lang) => `Language successfully changed to *${lang}*`,

  // contacts sync
  contactsSavedLog: (added, total) =>
    `Synced ${added} new contacts (${total} total saved in contacts.json)`,
  contactsSyncedLog: (total) =>
    `Contact sync complete! ${total} contacts saved. The #poststory feature is ready to use.`,
  contactsSynced: (total) =>
    `✅ Contact sync complete!\n\n*${total}* contacts from your phone have been saved to the bot.\nYou can now post stories with the \`#poststory\` command.\n\nType \`#listkontak\` to check the synced contacts.\nType \`#poststory\` to see how to use it.`,

  // #poststory
  postStoryHelp: `How to use *#poststory* :

*1. Post a text story :*
\`#poststory hello everyone\`

*2. Post a photo/video story :*
Send a photo/video in this chat with the caption \`#poststory\`, or reply to one with \`#poststory\`
(you can add a caption : \`#poststory your caption\`)

*3. Post an audio story :*
Reply to an audio/voice message with \`#poststory\`

*3. Post a story to specific contacts :*
\`#poststory hello | 628123456789,628987654321\`

Notes :
- Without a number list → the story is visible to all synced contacts
- With a number list → the story is only visible to the numbers you listed
- Type \`#listkontak\` to check synced contacts`,
  postStoryBusy:
    "A story post is still in progress, please wait a moment.",
  postStoryInvalidTarget: (arg) =>
    `Invalid number list format: "${arg}"\ncorrect example :\n\`#poststory hello | 628123456789,628987654321\``,
  postStoryNoContacts:
    "Contacts haven't been synced yet.\n\nWait a moment after login until the bot sends the \"contact sync complete\" notification, then try again.\n\nType `#listkontak` to check how many contacts have been synced.",
  postStoryKindText: "text",
  postStoryKindImage: "photo",
  postStoryKindVideo: "video",
  postStoryKindAudio: "audio",
  postStorySuccessLog: (kind, count) =>
    `Successfully posted a ${kind} story to ${count} contacts`,
  postStorySuccess: (targetCount, totalContacts) =>
    `✅ Story successfully posted to *${targetCount}* contacts!${
      targetCount < totalContacts
        ? `\n(only the numbers you listed can see this story)`
        : `\n(all synced contacts can see this story)`
    }`,
  postStoryFail: (err) => `❌ Failed to post story :\n${err}`,

  // #listkontak
  contactCount: (total) =>
    `📚 *${total}* contacts synced to the bot.\n\nType \`#listkontak name\` to search contacts by name/number.\nexample : \`#listkontak budi\` or \`#listkontak 62812\``,
  contactSearchResult: (query, count, list) =>
    `Search results for "*${query}*" (${count} contacts, showing max 20) :\n\n${list}`,
  contactSearchEmpty: (query) =>
    `No contacts match "*${query}*".`,

  // auto kick story
  kickTagMsg: (n) =>
    `@${n} was detected tagging the group in their story, they will be removed.`,
  kickLog: (group) =>
    `Removed a member from the group ${group} for tagging the group in their story.`,
  notAdminLog: (group) =>
    `You're not an admin in the group ${group}, so the member can't be removed.`,

  // status reading
  statusDeletedLog: (name) => `The status from ${name} was deleted.`,
  unknown: "Unknown",
  statusBlacklistedLog: (name, num) =>
    `${name} (${num}) posted a status but is on the blacklist. The status won't be viewed.`,
  statusNotWhitelistedLog: (name, num) =>
    `${name} (${num}) posted a status but is not on the whitelist. The status won't be viewed.`,
  statusViewedLog: (name, num, liked) =>
    `Successfully viewed ${liked ? "and liked " : ""}the status from: ${name} (${num})`,
  statusViewedMsg: (name, num, liked) =>
    `The status from *${name}* (${num}) has been viewed ${liked ? "and liked" : ""}`,
  noCaption: "No caption",
  mediaImage: "image",
  mediaVideo: "video",
  mediaStatusViewedMsg: (kind, name, num, liked) =>
    `The ${kind} status from *${name}* (${num}) has been viewed ${liked ? "and liked" : ""}`,
  withCaption: (content, caption) => `${content} with caption: "*${caption}*"`,
  mediaUploadFailMsg: (content, kind, name, num) =>
    `${content} but failed to upload the ${kind} status media from *${name}* (${num}).`,
  audioStatusViewedMsg: (name, num, liked) =>
    `The audio status from *${name}* (${num}) has been viewed ${liked ? "and liked" : ""}. Here's the audio.`,
  audioUploadFailMsg: (name, num) =>
    `Failed to upload the audio from the audio status of *${name}* (${num}).`,
  textStatusViewedMsg: (name, num, liked, caption) =>
    `The text status from *${name}* (${num}) has been viewed ${liked ? "and liked" : ""} with caption: "*${caption}*"`,
};
