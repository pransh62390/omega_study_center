# Exam Portal React Application - Documentation

## Project Overview
A static React application for a tutor to serve custom test series securely to students. Students log in, browse exams/papers, and view PDFs in a view-only mode with answer reveal functionality.

## 📁 Project Structure

```
frontend/
├── .env                          # Environment variables (CHANGE DEFAULTS!)
├── .gitignore                    # Ignores node_modules, dist, .env, .parcel-cache
├── .parcelrc                     # Parcel 2 config for static asset serving
├── index.html                    # Entry point (root div, loads App.js)
├── package.json                  # Dependencies and scripts
├── clean.js                      # Script to clean dist/.parcel-cache
├── App.js                        # Router + auth wrapper
├── index.css                     # All responsive styles
├── pdfs/                         # PDF files served by Parcel from public/
│   └── sample-exam/
│       └── paper-1/
│           └── Test-2.pdf        # 728KB sample PDF
│
├── src/
│   ├── App.js                    # BrowserRouter + Routes + AuthGuard
│   ├── index.css                 # (duplicate at root, see above)
│   ├── hooks/
│   │   └── useExams.js           # Fetches exams.json from S3 or local fallback
│   ├── components/
│   │   ├── Login.js              # Login form + credential validation
│   │   ├── Landing.js            # Hamburger menu + exam list
│   │   ├── Papers.js             # Paper cards with PDF icon placeholder
│   │   ├── PDFViewer.js          # View-only PDF + answer button
│   │   └── AuthGuard.js          # Checks sessionStorage secret
│   └── data/
│       └── exams.json            # Exam/paper metadata (local fallback)
│
└── public/
    └── pdfs/                     # Parcel-served static PDFs
        └── sample-exam/
            └── paper-1/
                └── Test-2.pdf    # 728KB sample PDF
```

## ✅ What's Been Implemented

### Authentication & Login
- **Login page** at `/` with username/password validation against `.env`
- `.env` contains: `REACT_APP_USERNAME`, `REACT_APP_PASSWORD`, `REACT_APP_SECRET`
- On success: secret stored in `sessionStorage` (clears on browser close)
- On fail: shows red error "Wrong username or password" on same page
- **No 404 page** — all auth failures and unknown routes redirect to login

### Routing (react-router-dom v6)
| Path | Component | Auth Required |
|------|-----------|-------------|
| `/` | Login | No |
| `/exams` | Landing (hamburger menu) | Yes |
| `/exams/:examId` | Papers (card grid) | Yes |
| `/exams/:examId/:paperId` | PDFViewer | Yes |
| `*` (unknown) | Redirects to `/` | Yes |

### PDF Viewing
- **Papers page**: Cards show static PDF icon + "PDF" label (no iframe, no loading issues)
- **PDFViewer page**: Question PDF loads in iframe, "Show Answer" button reveals answer PDF below
- **Answer PDF**: Empty `answerPdf` in `exams.json` → shows "Coming soon" placeholder
- When tutor uploads answer → update `answerPdf` path in `exams.json`

### S3 Centralized Configuration ✅
- **`REACT_APP_EXAMS_JSON_URL`** in `.env` points to S3 URL
- App fetches `exams.json` from S3 at runtime
- **Auto-fallback** to local `frontend/src/data/exams.json` if S3 fails
- **Only one line** needs changing to point to different S3 bucket
- Works offline during development (local file used)

### Papers Page (Card Grid)
- Displays exam name + number of papers
- Each card: PDF icon placeholder + paper name
- Click → navigates to PDFViewer page for that paper
- Responsive CSS Grid layout

### PDFViewer Page
- Question PDF in iframe with "Show Answer" button below
- Answer section appears below on button click
- Answer PDF can be empty (shows "Coming soon") or have a path
- PDF protection: iframe with `onContextMenu` prevention + `user-select: none`
- No download button - view only

### Responsive Design
- Mobile-first CSS (`index.css`)
- Hamburger menu transforms to sidebar on mobile
- Exam cards stack vertically on narrow screens
- Iframes adapt to screen height (`80vh` min)

## 🚀 How to Run

1. **Install Node.js** (v18+ recommended)
2. `cd frontend`
3. `npm install`
4. `npm start`
5. App runs at `http://localhost:1234`

### Alternative (no npm needed for code changes):
- All source files are created
- Place PDFs in `frontend/public/pdfs/`
- Update `frontend/src/data/exams.json` paths
- Update `.env` S3 URL
- Share the folder - Parcel handles the rest

## 🔐 Environment Variables (.env)

Create `frontend/.env` with:
```
REACT_APP_USERNAME=tutor
REACT_APP_PASSWORD=test123
REACT_APP_SECRET=my-secret-key-2024
REACT_APP_EXAMS_JSON_URL=https://your-bucket.s3.amazonaws.com/exams.json
```

- **Default credentials**: `tutor` / `test123` — **change before deploying!**
- `REACT_APP_EXAMS_JSON_URL`: S3 URL for centralized exams data
- Omit `REACT_APP_EXAMS_JSON_URL` to use local `exams.json` fallback

## 📝 How to Add Exam PDFs

1. Place PDF in `frontend/public/pdfs/<exam-id>/<paper-id>/question.pdf`
2. Ensure `answer.pdf` exists optionally in same folder
3. Update `frontend/src/data/exams.json`:
   ```json
   {
     "exams": [
       {
         "id": "my-exam",
         "name": "My Exam",
         "papers": [
           {
             "id": "paper-1",
             "name": "Paper 1",
             "questionPdf": "/pdfs/my-exam/paper-1/question.pdf",
             "answerPdf": "/pdfs/my-exam/paper-1/answer.pdf"  // optional
           }
         ]
       }
     ]
   }
   ```
4. If `answerPdf` is empty string `""` → shows "Coming soon" in PDFViewer

### Using S3 (Centralized)
1. Upload `exams.json` to your S3 bucket
2. Set `REACT_APP_EXAMS_JSON_URL` in `.env` to the S3 URL
3. Update `exams.json` in S3 whenever exam data changes
4. PDFs still placed in `public/pdfs/` locally

## 🔒 Authentication Flow

1. User visits `/` → Login page
2. Enter username/password → validated against `.env`
3. On success: `sessionStorage.setItem("secret", secretValue)` → redirect to `/exams`
4. On fail: red error "Wrong username or password" stays on login page
5. All protected routes (`/exams`, `/exams/:id`, `/exams/:id/:pid`) wrapped in `AuthGuard`
6. `AuthGuard` checks `sessionStorage.getItem("secret")`
7. Missing secret → redirect to `/` (login page)
8. Unknown routes `*` → also redirect to `/`

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react` | ^19.2.8 |
| `react-dom` | ^19.2.8 |
| `react-router-dom` | ^6.28.0 (v6 for Parcel compatibility) |

## 🛠️ Available Scripts

| Script | Purpose |
|--------|---------|
| `npm start` | `parcel index.html` — dev server with HMR |
| `npm run build` | `parcel build index.html` — production build |
| `npm run clean` | Clears `.parcel-cache` and `dist/` |
| `npm test` | Runs jest tests |

## 📋 Things Not Yet Implemented (Future)

- ❌ Backend integration — this is a static frontend-only app
- ❌ User accounts / persistent login — sessionStorage only, per-browser
- ❌ PDF encryption/DRM — view-only with basic protections
- ❌ Real-time sync — S3 fetch on every load
- ❌ Search/filter exams — basic list only
- ❌ Download protection — iframe makes download slightly harder but not impossible
- ❌ Analytics / usage tracking

## 🐛 Known Issues / Notes

1. **Parcel 2 + `public/` folder**: PDFs must be in `public/pdfs/` — Parcel 2 doesn't auto-serve other locations
2. **S3 fetch may fail in dev**: Auto-fallback to local `exams.json` 
3. **Content-type check**: Parcel may serve PDFs as `application/octet-stream` — the fetch check handles this
4. **iframe same-origin**: PDFs from `public/` same-origin — no CORS issues
5. **Answer PDF timing**: Tutor uploads answer PDF later → keep `answerPdf: ""` initially

## 📞 Support / Troubleshooting

- **PDF not loading**: Ensure file is in `frontend/public/pdfs/` and path in `exams.json` starts with `/pdfs/`
- **Login not working**: Check `.env` values match exactly (no extra spaces)
- **S3 not fetching**: Verify `REACT_APP_EXAMS_JSON_URL` is valid CORS-enabled URL
- **Hooks error**: Ensure `npm run clean` then `npm start` to clear stale cache
- **Responsive issues**: Viewport meta tag is in `index.html`, CSS is mobile-first

---
*Last updated: August 2026*
*Generated for tutor's test series platform — designed to be simple and maintainable*