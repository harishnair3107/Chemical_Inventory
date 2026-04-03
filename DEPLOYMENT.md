# Deployment Guide - Chemical Inventory Management

This system is now configured for professional deployment using the **Centralized API Utility** pattern. This allows you to switch between local development and production with zero code changes.

## 1. Backend Deployment (Render.com)

1. **Service Type**: Web Service
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. **Environment Variables**:
   > [!IMPORTANT]
   > You **MUST** set these in the Render dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A long, random string for security.
   - `EMAIL_USER`: `harishnair3107@gmail.com`
   - `EMAIL_PASS`: `ewta qjny txye tlya` (Gmail App Password)
   - `CLIENT_URL`: The URL of your deployed frontend (e.g., `https://your-app.vercel.app`).
   - `PORT`: `5000` (Render sets this automatically, but good to have).

## 2. Frontend Deployment (Vercel / Netlify)

1. **Framework Preset**: Vite
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_URL`: The URL of your **Render backend** followed by `/api` (e.g., `https://chem-app-backend.onrender.com/api`).

## 3. Post-Deployment Checks
- [ ] **MongoDB Whitelist**: Ensure MongoDB Atlas "Network Access" is set to `0.0.0.0/0` (Allow Access from Anywhere) since Render uses dynamic IPs.
- [ ] **Admin Login**: Log in to the Admin Portal using `harishnair3107@gmail.com` to verify the connection.

## Summary of Refactors
- **Client**: Replaced all hardcoded `localhost:5000` URLs with the `api` utility.
- **Server**: Enhanced `cors` to use the `CLIENT_URL` environment variable.
- **Maintenance**: To change the API endpoint in the future, simply update the `VITE_API_URL` variable in your hosting dashboard—no code edits required.
