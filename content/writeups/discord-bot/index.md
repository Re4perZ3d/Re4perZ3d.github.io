---
title: "CyberSpark CTF — DiscordBadyyyy"
date: 2025-05-18
side: "purple"
summary: "A misc challenge on Discord bot logic and permissions, manipulating bot behaviour to satisfy the flag conditions."
tags: ["misc", "authored"]
---
## Challenge Description

> "Check our Hacker Discord Bot"

This miscellaneous challenge focuses on understanding Discord bot logic and permissions. Participants must creatively manipulate bot behavior by simulating the required conditions.

---

## Solution Walkthrough

### 🤖 Step 1: Understand the Bot's Behavior

Upon joining the CTF’s official Discord server, you'll find a bot named `Hacker`. Typing the `!help` command reveals:

![Help Command](./Screenshot_1547.png)

The key part is:

> “Get the flag if you are a real hacker (with the 'hacker' role)”

You don’t have administrative permissions in the original server, so you **can’t assign yourself** the `hacker` role there.

---

### 💡 Step 2: Creative Bypass – Simulate the Role

Since you can’t gain the role in the original server, the solution is to:

1. **Create your own Discord server**.
2. **Invite the bot** to your server.

   Read the guide here:  
   https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links

   Use the bot invite URL format with the bot's client ID:

   ```text
   https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=0&scope=bot%20applications.commands
   ```

   To find the bot's client ID:

   ![Bot Profile](./Screenshot_1548.png)

   ![Copy Bot ID](./Screenshot_1549.png)

   Paste the ID into the URL above and visit it to invite the bot:

   ![Invite Bot](./Screenshot_1550.png)

3. In your server:
   - Create a role named `hacker`.

     ![Create Role](./Screenshot_1551.png)

   - Assign the role to yourself.

     ![Assign Role](./Screenshot_1552.png)

4. Now type the command (e.g., `!flag`, or whatever the bot expects):

   ![Get Flag](./Screenshot_1553.png)

---

## 🏁 Flag

Spark{G00d_j0B_H4cker}

