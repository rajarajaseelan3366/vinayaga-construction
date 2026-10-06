# Vinayaga Construction - Hosting Setup

This version replaces browser-only localStorage with a shared PHP online API. It is intended for PHP hosting such as Hostinger.

## Upload
1. Upload the contents of this folder to `public_html/`.
2. Make sure `api.php`, `index.html`, `admin/`, `image/`, `logo/`, `data/` and `uploads/` are all inside `public_html/`.
3. Open `https://YOUR-DOMAIN/` for the public website.
4. Open `https://YOUR-DOMAIN/admin/` for the admin portal.

## Admin login
Username: `admin`
Password: `vinayaga2000@`

The password is stored as a server-side hash in `api.php`; it is no longer checked by browser JavaScript. Change the hash if you want a different password.

## Important
- The `data/` folder must be writable by PHP.
- The `uploads/` folder must be writable by PHP.
- Project images uploaded from the admin portal are stored in `uploads/` and their paths are saved in `data/site-data.json`.
- Because the data is stored on the server, changes made from Chrome, Edge, mobile or another computer use the same shared data.
- This setup does not require MySQL.

## Before going live
- Change the admin password hash in `api.php`.
- Use HTTPS on the domain.
- Keep the provided `.htaccess` files in `data/` and `uploads/`.
