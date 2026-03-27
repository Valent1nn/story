# UNFOLD - Premium Custom Packaging Website

A scroll-driven storytelling website for premium custom packaging, built with React. Features smooth animations, a 3D product preview, an interactive customizer, and full English/Romanian language support.

---

## Table of Contents

1. [What Is This?](#what-is-this)
2. [What You Need Before Starting](#what-you-need-before-starting)
3. [How to Install](#how-to-install)
4. [How to Run the Website Locally](#how-to-run-the-website-locally)
5. [How to Build for Production](#how-to-build-for-production)
6. [How to Deploy](#how-to-deploy)
7. [Project Structure](#project-structure)
8. [Website Sections](#website-sections)
9. [How to Change Content](#how-to-change-content)
10. [Useful Commands (Cheat Sheet)](#useful-commands-cheat-sheet)
11. [Troubleshooting](#troubleshooting)

---

## What Is This?

This is the source code for the **UNFOLD** website - a premium packaging brand page. When someone visits the site, they scroll through a cinematic experience that showcases the product with animations, a photo gallery, interactive 3D preview, and a product customizer.

**Key features:**

- Scroll-triggered animations (text reveals, fade-ins, parallax)
- Photo carousel with drag-to-swipe and coverflow effect
- Interactive 3D box preview (rotate, change colors/materials)
- Product customizer (pick size, color, finish, and more)
- Language switcher (English 🇬🇧 / Romanian 🇷🇴)
- Fully responsive (works on desktop, tablet, and phone)

---

## What You Need Before Starting

Before you can run or modify this website, you need to install these on your computer:

### 1. Visual Studio Code (recommended code editor)

VS Code is a free editor that makes it easy to browse files, edit code, and run terminal commands - all in one window.

- **Download:** Go to [https://code.visualstudio.com](https://code.visualstudio.com) and install it.
- **Why use it:** You can open the entire project folder, click on any file to edit it, and run commands directly from the built-in terminal - no need to open a separate Command Prompt or PowerShell window.
- **Open the project:** After installing, go to **File → Open Folder** and select the `story` folder.

> **Tip - Use Git Bash as your terminal inside VS Code:**
> PowerShell can be quirky with certain commands. Git Bash (installed automatically with Git) is more reliable and consistent. To set it as your default terminal in VS Code:
> 1. Press `Ctrl + Shift + P` and type **"Terminal: Select Default Profile"**
> 2. Choose **Git Bash** from the list
> 3. Open a new terminal with `` Ctrl + ` `` - it will now use Git Bash
>
> All commands in this README work in Git Bash. If you see errors in PowerShell, try switching to Git Bash first.

### 2. Node.js (version 18 or newer)

Node.js is the engine that runs the website on your computer during development.

- **Download:** Go to [https://nodejs.org](https://nodejs.org) and click the **LTS** (recommended) button.
- **Install:** Run the downloaded file and follow the steps. Leave all options at their defaults.
- **Verify:** Open a terminal (Command Prompt, PowerShell, or Terminal) and type:
  ```
  node --version
  ```
  You should see something like `v18.x.x` or higher.

### 3. Git (optional, for cloning and pushing changes)

Git lets you download the code and save changes back to GitHub.

- **Download:** Go to [https://git-scm.com](https://git-scm.com) and install it.
- **Verify:**
  ```
  git --version
  ```

---

## How to Install

### Step 1 - Get the code

**Option A - Clone from GitHub (recommended):**

Open a terminal and run:

```
git clone https://github.com/Valent1nn/story.git
```

Then navigate into the project folder:

```
cd story
```

**Option B - Download as ZIP:**

1. Go to [https://github.com/Valent1nn/story](https://github.com/Valent1nn/story)
2. Click the green **Code** button → **Download ZIP**
3. Extract the ZIP to a folder on your computer
4. Open a terminal and navigate to that folder

### Step 2 - Install dependencies

Inside the project folder, run:

```
npm install
```

This downloads all the libraries the website needs (React, animations, 3D engine, etc.). It may take a minute or two. When it finishes, you'll see a `node_modules` folder appear - that's normal.

---

## How to Run the Website Locally

To start the website on your computer for development/preview:

```
npm run dev
```

You'll see output like:

```
  VITE v8.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
```

**Open that link in your browser** (Ctrl+click or copy-paste). The website will appear.

- Any changes you make to the code will **automatically refresh** in the browser.
- To **stop** the server, press `Ctrl + C` in the terminal.

---

## How to Build for Production

When you're ready to publish the website, you need to create an optimized build:

```
npm run build
```

This creates a `dist/` folder containing the final website files (HTML, CSS, JS, images). These are the files you upload to a web host.

To **preview** the production build locally before deploying:

```
npm run preview
```

---

## How to Deploy

The `dist/` folder can be deployed to any static hosting service. Here are the most common (free) options:

### Option 1 - Netlify (easiest, recommended)

1. Go to [https://app.netlify.com](https://app.netlify.com) and sign up (free).
2. Click **"Add new site"** → **"Deploy manually"**.
3. Drag and drop the `dist/` folder onto the page.
4. Done! You get a live URL like `https://your-site.netlify.app`.

**For automatic deploys from GitHub:**
1. Click **"Add new site"** → **"Import from Git"**.
2. Connect your GitHub account and select the `story` repository.
3. Set these build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy**. Every time you push to GitHub, the site auto-updates.

### Option 2 - Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign up (free).
2. Click **"New Project"** → Import your GitHub repository.
3. Vercel auto-detects Vite. Just click **Deploy**.

### Option 3 - GitHub Pages

1. Install the deploy package:
   ```
   npm install --save-dev gh-pages
   ```
2. Add to `package.json` scripts:
   ```json
   "deploy": "gh-pages -d dist"
   ```
3. Add `base` to `vite.config.js`:
   ```js
   export default defineConfig({
     base: '/story/',
     plugins: [react()],
   })
   ```
4. Build and deploy:
   ```
   npm run build
   npm run deploy
   ```

---

## Project Structure

```
story/
├── public/              ← Static files (images, icons)
│   └── photos/          ← Product photos
├── src/
│   ├── main.jsx         ← App entry point (don't touch)
│   ├── App.jsx          ← Main page with all sections
│   ├── App.css          ← All styling
│   ├── index.css        ← Global/base styles
│   ├── translations.js  ← All text in English & Romanian
│   └── components/
│       ├── Customizer.jsx     ← Product customization panel
│       └── InteractiveBox.jsx ← 3D box preview
├── index.html           ← HTML shell
├── package.json         ← Project config & dependencies
├── vite.config.js       ← Build tool config
└── README.md            ← This file
```

---

## Website Sections

| Section | What It Shows |
|---------|--------------|
| **Navigation** | Sticky top bar with links and language switcher (RO/EN) |
| **Hero** | Big intro headline with call-to-action buttons and sparkle effects |
| **Story** | The brand narrative - what makes the packaging special |
| **Gallery** | Photo carousel with coverflow effect, drag-to-swipe, and captions |
| **Specs** | Product specifications displayed as animated floating cards |
| **Customizer** | Interactive panel to pick box size, color, finish, and see a 3D preview |
| **Closing** | Scroll-driven text reveal with a final call-to-action |
| **Footer** | Copyright and brand info |

---

## How to Change Content

### Change text (headings, descriptions, buttons)

All website text lives in **`src/translations.js`**. Open it and you'll see two sections: `en` (English) and `ro` (Romanian). Edit the values to change what appears on the website.

Example - changing the hero headline:

```js
en: {
  heroTitle1: 'Your New Headline Here',
  ...
}
```

### Change product photos

In **`src/App.jsx`**, find the `productPhotos` array near the top of the file:

```js
const productPhotos = [
  { src: 'https://example.com/photo1.jpg' },
  { src: 'https://example.com/photo2.jpg' },
  ...
]
```

Replace the URLs with your own image links, or place images in `public/photos/` and reference them as:

```js
{ src: '/photos/my-image.jpg' }
```

### Change colors

In **`src/App.css`**, look for the CSS variables at the top:

- `--color-bg` - background color
- `--color-gold` - accent/gold color
- `--color-text` - main text color

### Change the 3D box

Edit **`src/components/InteractiveBox.jsx`** for the 3D preview, and **`src/components/Customizer.jsx`** for the customization options (colors, sizes, materials).

---

## Useful Commands (Cheat Sheet)

| Command | What It Does |
|---------|-------------|
| `npm install` | Install all project dependencies |
| `npm run dev` | Start the development server (live preview) |
| `npm run build` | Create production-ready files in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Check code for errors and style issues |
| `git add -A` | Stage all changed files for a commit |
| `git commit -m "message"` | Save changes with a description |
| `git push story master` | Push changes to GitHub |
| `git pull story master` | Download latest changes from GitHub |

---

## Troubleshooting

### "npm is not recognized"

Node.js is not installed or not in your system PATH. Reinstall Node.js from [https://nodejs.org](https://nodejs.org) and restart your terminal.

### "npm install" fails or takes forever

- Make sure you have an internet connection.
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

  On Windows PowerShell:
  ```
  Remove-Item -Recurse -Force node_modules, package-lock.json
  npm install
  ```

### The page is blank after running `npm run dev`

- Check the terminal for red error messages.
- Make sure you ran `npm install` first.
- Try a different browser or clear cache with `Ctrl + Shift + R`.

### Images don't load

- If using external URLs, make sure they are publicly accessible (not behind a login).
- If using local images in `public/photos/`, make sure the file names match exactly (case-sensitive).

### Changes aren't showing up

- The dev server should auto-refresh. If not, try `Ctrl + Shift + R` (hard refresh).
- If you edited `vite.config.js`, you need to restart the dev server (`Ctrl + C`, then `npm run dev`).

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| [React 19](https://react.dev) | UI framework |
| [Vite 8](https://vite.dev) | Build tool & dev server |
| [Framer Motion](https://www.framer.com/motion/) | Page animations & transitions |
| [GSAP + ScrollTrigger](https://gsap.com) | Scroll-driven animations |
| [Three.js](https://threejs.org) + React Three Fiber | 3D product preview |
| [Playfair Display + Inter](https://fonts.google.com) | Typography |
