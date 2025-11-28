# GM-TC Website

Personal website for [gm-tc.tech](https://gm-tc.tech).

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: PHP (CMS - coming soon)
- **Hosting**: Uberspace (U7)
- **Deployment**: Git pull from GitHub

## Project Structure

```
gm-tc/
├── public/               # Web-accessible files
│   ├── index.html        # Homepage
│   ├── css/
│   │   └── main.css      # Styles
│   └── assets/           # Images, fonts, etc.
├── cms/                  # CMS backend (coming soon)
│   ├── api/
│   ├── admin/
│   └── config/
├── scripts/
│   └── deploy-gm-tc.sh   # Deployment script for Uberspace
└── skills/               # Development guidelines
```

## Development Workflow

1. Work on `dev` branch
2. Test locally
3. Merge to `main` when ready
4. SSH to Uberspace and pull:

```bash
ssh gmtc@gmtc.uber.space
cd ~/repos/gm-tc
git pull origin main
```

Or use the deploy script:

```bash
~/bin/deploy-gm-tc.sh
```

## Local Development

Simply open `public/index.html` in your browser, or use a local server:

```bash
# Python
cd public && python -m http.server 8000

# Node.js
npx serve public

# PHP
php -S localhost:8000 -t public
```

## Contact

- **Website**: [gm-tc.tech](https://gm-tc.tech)
- **Email**: office@gm-tc.tech

