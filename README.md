<div align="center">

<img src="assets/stderricks-hero.jpg" alt="St.Derricks MD" width="760">

# **St.Derricks MD**

**A security-minded WhatsApp multi-device bot** · **Node.js 22+**

<a href="https://pair-tesla-md.onrender.com"><b>Pair WhatsApp</b></a> ·
<a href="https://heroku.com/deploy?template=https://github.com/emmaderidetekno-debug/saintderricksmd"><b>Deploy on Heroku</b></a> ·
<a href="https://github.com/emmaderidetekno-debug/saintderricksmd/archive/refs/heads/main.zip"><b>Download ZIP</b></a>

</div>

---

## Built by St.Derricks

St.Derricks MD is a multi-device WhatsApp bot with 300+ commands: group management,
AI chat, downloaders, media and sticker tools, owner utilities and live settings -
all controlled from chat, and all hosted by you.

## Features

| Group | What you get |
| --- | --- |
| **Group management** | Add, remove, promote, demote, anti-link, anti-tag, welcome messages, anti-demote and anti-promote guards |
| **AI chat** | Questions, image analysis and conversation memory in DMs |
| **Downloaders** | Music, video and media pulled straight into the chat |
| **Media tools** | Stickers, image and audio conversion, background removal, effects |
| **Live settings** | Antidelete, auto view and like status, anticall, presence |
| **Owner and sudo** | Sudo users with owner privileges, broadcast, block, restart, update |
| **Everyday tools** | Weather, lookups, text tools, QR codes, translators |
| **Coding** | Run C, C++, JavaScript and Python snippets, code images, obfuscation |

## Quick start (Windows)

1. Install **Node.js 22 LTS** from nodejs.org (the project declares `engines.node: 22.x`).
2. Install the packages once:
   ```
   cd path\to\saintderricksmd
   npm install
   ```
3. Get your session string from the pairing page: <https://pair-tesla-md.onrender.com>
   Enter your number (country code, no `+`, no spaces), then approve the link request in
   WhatsApp under **Linked devices**.
4. Open `start-stderricks.bat` in Notepad, paste the string after `SESSION=`, save.
5. Double-click `start-stderricks.bat`.

Or from a terminal:

```
set SESSION=your-session-string
set DEV=2547XXXXXXXX
npm start
```

## Deploy on Heroku

Press **Deploy on Heroku** above, then set the config vars in the app settings.
`Procfile` runs `node start.js`, and `app.json` carries the buildpacks for ffmpeg and webp.

## Config vars

| Variable | Purpose |
| --- | --- |
| `SESSION` | **Required.** The session string from the pairing page. Keep it private. |
| `DEV` | Owner numbers, country code, digits only, comma separated. |
| `BAD_WORD` | Comma-separated words that make the bot remove the member who sends them. |
| `DATABASE_URL` | Postgres connection for settings; Heroku Postgres sets this for you. |
| `TIMEZONE` | Time zone used in reports, for example `Africa/Nairobi`. |
| `MENU_TYPE` | Menu style the bot sends. |

## How the software starts

`start.js` runs `coresync.js`, which downloads the bot core (`index.js` and its plugins)
from the upstream files repository and then executes it. That core is **not** part of this
repository, so its command list and internals change with the upstream project. The
downloader is obfuscated and the remote URL is part of the design - editing it breaks
startup.

## Security notes

- Treat `SESSION` like a password: it grants full access to the linked WhatsApp account.
- Never commit `SESSION`, `.env` or session folders.
- Because the core is downloaded and executed at startup, run this on a host or spare
  number you are comfortable with rather than a machine holding sensitive accounts.

## Licence

MIT. This project is a rebranded continuation of an MIT-licensed WhatsApp bot; the
original copyright notice is retained in `LICENSE` as that licence requires.
