# Chronicle - Your Digital Diary

A beautiful, modern diary app with voice-to-text, calendar tracking, quick-log features, and cloud sync.

![Chronicle App](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-1.0-blue)

## ✨ Features

### Core Functionality
- 📝 **Multiple Entry Types** - Event, Thought, Habit, Food, Health tracking
- 🎤 **Voice-to-Text** - Hands-free entry using Web Speech API
- 📅 **Calendar View** - Visual monthly calendar with entry indicators
- ⚡ **Quick-Log Dropdowns** - Fast tracking for habits, food, and health
- 🎨 **Stunning UI** - Black/neon green/gold color scheme with glassmorphism
- 📱 **Mobile Optimized** - Fully responsive for phones and tablets

### Cloud Features (When Supabase is Configured)
- ☁️ **Cloud Sync** - Access your diary from any device
- 🔐 **Authentication** - Secure user accounts with email/password or magic link
- 🔄 **Real-time Updates** - Changes sync instantly across devices
- 🗄️ **PostgreSQL Backend** - Reliable, scalable database

### Local Mode (Fallback)
- 💾 **IndexedDB Storage** - Works entirely offline
- 📤 **Export/Import** - Backup and restore your data as JSON
- 🔒 **Privacy First** - All data stored locally in your browser

---

## 🚀 Quick Start

### Option 1: Local Mode (No Setup Required)

1. Open `index.html` in your browser
2. Start journaling immediately!

Data is stored locally in your browser using IndexedDB.

### Option 2: Cloud Mode with Supabase

#### Prerequisites
- A [Supabase](https://supabase.com) account (free tier available)
- A Supabase project

#### Setup Steps

**1. Create Supabase Tables**

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor:
- Go to your Supabase project dashboard
- Navigate to SQL Editor
- Copy and paste the contents of `supabase-schema.sql`
- Run the query

**2. Configure Supabase Credentials**

Edit `js/config.js` and replace the placeholders:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',  // Your Supabase URL
    anonKey: 'your-anon-key-here'              // Your public anon key
};
```

**Where to find these:**
- Supabase Dashboard → Project Settings → API
- URL: `Project URL`
- Anon Key: `anon` / `public` key

**3. Open the App**

- Open `login.html` in your browser
- Sign up for an account
- Start journaling with cloud sync!

---

## 📂 Project Structure

```
Diary App/
├── index.html              # Main app page
├── login.html              # Authentication page
├── styles.css              # All styling
├── supabase-schema.sql     # Database schema for Supabase
├── js/
│   ├── app.js              # Main application controller
│   ├── auth.js             # Authentication module
│   ├── calendar.js         # Calendar functionality
│   ├── components.js       # Reusable UI components
│   ├── config.js           # Supabase configuration
│   ├── entries.js          # Entry management
│   ├── quicklog.js         # Quick-log dropdowns
│   ├── settings.js         # User preferences
│   ├── storage.js          # Hybrid storage (Supabase + IndexedDB)
│   └── voice.js            # Voice-to-text functionality
```

---

## 🎯 Usage Guide

### Text Entries (Event & Thought)
1. Click **Event** or **Thought** type
2. Type or use the golden mic button for voice-to-text
3. Add optional tags
4. Click **Save Entry**

### Quick-Log (Habit, Food, Health)
1. Click **Habit**, **Food**, or **Health** type
2. Select from dropdown - entry is created instantly!
3. Add custom options with **+ Add Custom Option**

### Calendar Tracking
1. Click **📅 Calendar** in navigation
2. View entries by date
3. Numbers on dates show entry count
4. Click a date to see its entries

---

## 🛠️ Technologies

**Frontend:**
- Vanilla HTML/CSS/JavaScript
- Web Speech API
- IndexedDB API
- Google Fonts (Orbitron, Inter)

**Backend (Optional):**
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Realtime

**Hosting Options:**
- GitHub Pages
- Netlify
- Vercel
- Any static hosting

---

## 🚢 Deployment

### GitHub Pages

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git branch -M main
git remote add origin https://github.com/yourusername/diary-app.git
git push -u origin main

# Enable GitHub Pages
# Go to repo Settings → Pages
# Select source: main branch
# Your app will be at: https://yourusername.github.io/diary-app/
```

### Netlify

1. Push code to GitHub
2. Connect repo to Netlify
3. Deploy automatically
4. No build settings needed (static site)

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically
4. Configure custom domain (optional)

---

## 🔒 Privacy & Security

**Local Mode:**
- All data stored in browser's IndexedDB
- No data leaves your device
- Use Export feature for backups

**Cloud Mode:**
- End-to-end encryption in transit (HTTPS)
- Row Level Security (RLS) in Supabase
- Each user can only access their own data
- Passwords hashed by Supabase Auth

---

## 📝 Customization

### Quick-Log Options

Default options are in `js/quicklog.js`. Modify the `DEFAULT_OPTIONS` object:

```javascript
const DEFAULT_OPTIONS = {
    habit: ['Your custom habit', 'Another habit', ...],
    food: ['Breakfast', 'Custom meal', ...],
    health: ['Custom health metric', ...]
};
```

### Color Scheme

Colors are defined as CSS variables in `styles.css`:

```css
:root {
    --color-neon-green: #00ff00;
    --color-gold: #ffd700;
    --color-black: #000000;
}
```

---

## 🐛 Troubleshooting

**"Supabase not configured" message**
- Check that `js/config.js` has correct URL and anon key
- Make sure you're not using the placeholder values

**Voice-to-text not working**
- Use HTTPS or localhost (required for Web Speech API)
- Grant microphone permissions
- Try Chrome/Edge (best support)

**Entries not syncing**
- Check internet connection
- Verify you're signed in (cloud mode)
- Check browser console for errors

**Can't sign in**
- Verify Supabase credentials are correct
- Check that database schema was created
- Ensure RLS policies are enabled

---

## 🤝 Contributing

Want to improve Chronicle? Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📜 License

MIT License - feel free to use this project however you'd like!

---

## 🎨 Credits

**Design & Development:** Built with modern web standards
**Fonts:** Orbitron & Inter from Google Fonts
**Icons:** Native emoji for cross-platform compatibility

---

## 📧 Support

Found a bug or have a feature request? Open an issue on GitHub!

---

**Enjoy journaling with Chronicle! 📝✨**
