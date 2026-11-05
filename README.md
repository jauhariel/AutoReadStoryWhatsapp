🌐 **[Bahasa Indonesia](README.id.md)**

# Auto Read Story WhatsApp

Auto Read Story/Status WhatsApp is a simple bot that lets you automatically view, like, and download your WhatsApp contacts' statuses — so you can be the first to see and like their stories.

<div align="center">
  <img src="img/testing.jpg" alt="testing" width="500">
  <div>Automatically viewing and liking statuses</div>
  <br>
  <img src="img/testing2.jpeg" alt="testing" width="500">
  <div>Automatically downloading media (photos, videos, and audio) from statuses when the downloadMediaStatus feature is enabled</div>
  <br>
  <img src="img/testing3.jpeg" alt="testing" width="500">
  <div>Several commands are available to turn features on or off — just type #menu.</div>
</div>

## Features:

1. **Auto Read Status**: Automatically views statuses when this feature is enabled.
2. **Auto Like Status**: Automatically likes statuses when this feature is enabled.
3. **Download Media**: Automatically downloads media (photos, videos, audio) from statuses when this feature is enabled.
4. **Number Masking**: Masks the phone numbers shown in statuses when this feature is enabled.
5. **Anti-Call**: Automatically rejects incoming calls when this feature is enabled.
6. **Auto Kick Group Story**: Kicks/removes members detected tagging a group in their story.
7. **Blacklist**: Configure specific numbers whose statuses will never be viewed.
8. **Whitelist**: Configure specific numbers whose statuses will be the only ones viewed.
9. **Emojis**: Configure the emojis used to like statuses.
10. **View Once**: Retrieve/download photos, videos, and audio from view-once messages.
11. **Multi-language**: Switch the bot & terminal language with `#lang` (`id`/`en`).
12. **Post Story**: Post a WhatsApp Status/story directly from the bot — as text, photo, video, or audio. You can post it to all contacts or only to specific ones. Contacts are automatically synced from your phone into the `contacts.json` file.

## Installation :

### Windows

1. Node.js:<br>
   https://nodejs.org/en
2. Git:<br>
   https://git-scm.com/downloads

### Ubuntu/Debian

1. Node.js:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && nvm install 22
   ```
2. Git:
   ```bash
   sudo apt update && sudo apt install -y git
   ```

### Termux (Android)

1. Node.js + Git:
   ```bash
   pkg update && pkg install git nodejs-lts
   ```

## How to run the bot :

1. Open your favorite terminal (⁠ ⁠╹⁠▽⁠╹⁠ ⁠) 👍
2. Clone the repository:
   ```bash
   git clone https://github.com/jauhariel/AutoReadStoryWhatsapp.git
   ```
3. Move into the project folder:
   ```bash
   cd AutoReadStoryWhatsapp
   ```
4. Install the required dependencies:
   ```bash
   npm i
   ```
5. Start the bot:
   ```bash
   npm start
   ```
6. Enjoy
<hr>

## Posting stories with the bot :

After logging in, the bot automatically syncs your phone's contact list into the <strong>contacts.json</strong> file. Wait until the bot sends the "contact sync complete" notification in the chat, then you can use the following commands:

1. **Post a text story** — type in the bot's chat:
   ```
   #poststory hello everyone 👋
   ```
2. **Post a photo/video story** — send a photo/video in the bot's chat with the caption `#poststory` (optionally with a caption: `#poststory your caption`), or reply to a photo/video with `#poststory`.
3. **Post an audio story** — reply to an audio/voice message with `#poststory`.
4. **Post a story to specific contacts only** — add a list of numbers after the `|` sign:
   ```
   #poststory hello | 628123456789,628987654321
   ```
   The story will only be visible to the numbers you listed (like WhatsApp's "Share with selected contacts" feature). Without a number list, the story is visible to all synced contacts.
5. **Check your contacts** — type `#listkontak` to see how many contacts have been synced, or `#listkontak budi` / `#listkontak 62812` to search contacts by name/number.

Note: the <strong>contacts.json</strong> file contains your private contact list and will not be pushed to the repository (it's in .gitignore).
<hr>

## Notes

```js
   {
    "language": "id", // bot & terminal language: "id" (Indonesian) or "en" (English)
    "autoReadStatus": true, // set to false if you don't want statuses to be viewed automatically
    "autoLikeStatus": true, // set to false if you don't want statuses to be liked automatically
    "downloadMediaStatus": false, // set to true if you want to download media (photos, videos, audio) from statuses
    "sensorNomor": true, // set to false if you don't want phone numbers in statuses to be masked
    "antiTelpon": false, // set to true to enable the anti-call feature
    "autoKickStory": false, // set to true to enable the group-story-tag kick feature
    "blackList": [ // statuses from numbers in this array will NOT be viewed
        "628987654321",
        "628123456789"
    ],
    "whiteList": [], // if this array is not empty, only statuses from numbers in this array will be viewed
    "emojis": [ // configure the emojis used to like statuses
        "💚",
        "❤️",
        "👍"
    ]
   }
```

1. You can stop specific numbers' statuses from being viewed automatically by adding them to the <strong>blackList</strong> array in the <strong>config.json</strong> file.
2. You can make only specific numbers' statuses be viewed automatically by adding them to the <strong>whiteList</strong> array in the <strong>config.json</strong> file.
3. If you want to view statuses from all contacts, empty both the <strong>blackList</strong> and <strong>whiteList</strong> arrays in the <strong>config.json</strong> file.

4. Set <strong>autoReadStatus</strong> in the <strong>config.json</strong> file to false to disable auto-reading of statuses, or true to enable it.

5. Set <strong>autoLikeStatus</strong> in the <strong>config.json</strong> file to false to disable auto-liking of statuses, or true to enable it.

6. Set <strong>downloadMediaStatus</strong> in the <strong>config.json</strong> file to true to automatically download media (photos, videos, audio) from statuses, or false to disable it.

7. Set <strong>antiTelpon</strong> in the <strong>config.json</strong> file to true to enable the anti-call feature, or false to disable it.

8. Set <strong>autoKickStory</strong> in the <strong>config.json</strong> file to true to enable kicking members detected tagging a group in their story, or false to disable it.

9. Edit the <strong>emojis</strong> array in the <strong>config.json</strong> file to configure the emojis used to like statuses. You can add or change the emojis however you like.

10. Type <strong>#lang en</strong> or <strong>#lang id</strong> in the bot's chat to switch the bot & terminal language. On the first run, the terminal will also ask you to pick a language.

11. Press <strong>CTRL</strong> and <strong>C</strong> on your keyboard at the same time to stop the bot!
12. Delete the <strong>sessions</strong> folder if you want to log in with a different number, or if you run into login issues such as getting stuck while connecting, then start it again with:

```bash
npm start
```
