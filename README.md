# Retroweb

Retroweb renders modern websites inside a retro terminal-style frontend.  
The production setup in this repo is:

- static frontend built by Vite
- PHP backend endpoint at `fetch.php`
- same-origin deployment on one Hostinger PHP site

The frontend calls `fetch.php?url=...` beside the app, so the browser stays on the same origin and avoids the cross-origin problems that broke the passive frontend earlier.

## Project Layout

```txt
src/                 React frontend
php/                 PHP endpoint and Hostinger rewrite config
scripts/             build packaging scripts
hostinger-dist/      generated upload package
```

## Local Development

Install dependencies:

```sh
npm install
```

Run on localhost:

```sh
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```txt
http://localhost:5173/
```

The frontend reads `VITE_FETCH_API` from `.env` when provided.  
For the Hostinger build, the script forces `VITE_FETCH_API=fetch.php` so the generated app uses the PHP file next to `index.php`.

Local note: the real fetch backend is PHP. The local Vite server previews the frontend, but arbitrary website fetching works correctly only when the PHP files are served by a PHP web server or after deploying `hostinger-dist/` to Hostinger.

## Production Build for Hostinger

Build the exact package intended for Hostinger:

```sh
npm run build:hostinger
```

That command does three things:

1. builds the frontend with `VITE_FETCH_API=fetch.php`
2. creates `hostinger-dist/` as the final upload folder
3. removes the intermediate Vite `dist/` folder

The output folder contains:

```txt
hostinger-dist/
  .htaccess
  index.php
  fetch.php
  health.php
  assets/
  favicon.svg
```

## Deploy to Hostinger

Upload the contents of `hostinger-dist/` into `public_html/`.

After upload:

- `index.php` serves the frontend
- `fetch.php` serves the backend API
- `health.php` returns a JSON health response
- `.htaccess` rewrites SPA routes back to `index.php`

Final server run instructions:

1. Run `npm install` if dependencies are not installed.
2. Run `npm run build:hostinger`.
3. Upload everything inside `hostinger-dist/` to the target Hostinger folder.
4. If deploying under `https://generativeworks.net/retroweb/`, upload into `public_html/retroweb/`.
5. If deploying at the domain root, run `VITE_DEPLOY_BASE=/ npm run build:hostinger` and upload into `public_html/`.
6. Confirm `https://generativeworks.net/retroweb/health.php` returns `{"ok":true}`.
7. Open `https://generativeworks.net/retroweb/` and transmit a URL.

## Backend API

The PHP backend endpoint is:

```txt
GET fetch.php?url=<encoded absolute url>
```

Health check:

```txt
GET /health.php
```

Example:

```sh
curl 'https://your-domain.example/retroweb/fetch.php?url=https%3A%2F%2Fexample.com%2F'
curl 'https://your-domain.example/retroweb/health.php'
```

## PHP Backend Behavior

`fetch.php`:

- accepts only `http` and `https` target URLs
- rejects private or reserved network targets
- follows a limited number of redirects
- limits upstream response size
- returns CORS headers
- forwards the upstream response body and content type
- requires the PHP cURL extension

Optional PHP-side environment variables:

```txt
ALLOWED_ORIGIN=*
MAX_BYTES=8388608
TIMEOUT_SECONDS=15
MAX_REDIRECTS=5
```

## Important Notes

- This production setup assumes the frontend and backend live on the same Hostinger site.
- The frontend build for Hostinger uses `fetch.php`, not an external backend URL.
- If you upload to the domain root instead of `/retroweb/`, set `VITE_DEPLOY_BASE=/` before building.
- If you change the backend path, you must rebuild the frontend.
- I could not run a PHP syntax check in this workspace because `php` is not installed here.

## Useful Commands

```sh
npm run dev
npm run build
npm run build:hostinger
```
