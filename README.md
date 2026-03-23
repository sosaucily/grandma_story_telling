# Grandma's Story Time

A shared book-reading app for grandma and grandchild to read picture books together over video chat — no matter the distance.

Grandma controls the pages. Eli watches and points. Both see each other via built-in video calling.

## How It Works

1. Upload photos of children's book pages to Google Drive (one folder per book)
2. Open the website — Eli clicks his avatar, Grandma clicks hers
3. Grandma picks a book and reads aloud, turning pages with the controls
4. Eli sees the same page in real time, and his cursor shows up on Grandma's screen

## Setup

### 1. Google Drive

1. Create a folder in Google Drive (this is your "bookshelf")
2. Inside it, create one subfolder per book (folder name = book title)
3. Upload page photos to each book folder, named in order: `01.jpg`, `02.jpg`, etc.
4. Right-click the root folder → Share → "Anyone with the link" → Viewer

### 2. Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Go to **APIs & Services → Library** → search for "Google Drive API" → Enable it
4. Go to **APIs & Services → Credentials** → Create Credentials → API Key
5. (Optional but recommended) Click the key → restrict it to "Google Drive API" only

### 3. Configure the App

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `VITE_GOOGLE_API_KEY` — your API key from step 2
- `VITE_DRIVE_FOLDER_ID` — the ID of your root bookshelf folder (from the folder URL: `https://drive.google.com/drive/folders/THIS_PART`)

### 4. Run Locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### 5. Deploy to GitHub Pages

```bash
npm run build
```

Deploy the `dist/` folder to GitHub Pages (or any static host like Netlify/Vercel).

## Tech Stack

- **Vite + TypeScript** — static site, no backend
- **Google Drive API** — reads book images from your public Drive folder
- **Jitsi Meet** — embedded video calling (free, no account needed)
- **Jitsi data channels** — page sync + cursor sharing, no extra server

## Tips

- Name page images with zero-padded numbers (`01.jpg`, not `1.jpg`) for correct sort order
- Works on tablets (Android Chrome, iPad Safari) and desktop browsers
- The API key is safe in client-side code since it only reads public files — restrict it to the Drive API in Google Cloud Console for extra safety
