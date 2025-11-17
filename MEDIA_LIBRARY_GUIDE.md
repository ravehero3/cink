# Media Library Guide

## Overview
Your UFO Sport e-shop now has a complete media management system powered by Cloudinary. You can upload images and videos directly to your shop and easily select them when editing your homepage.

## Features

### 1. **Media Library Dashboard** (`/admin/media`)
- Upload multiple images and videos at once
- Filter by type (All / Images / Videos)
- View media details (filename, size, dimensions, format)
- Delete media when no longer needed
- Copy URLs to clipboard

### 2. **Cloudinary Integration**
- Automatic optimization and CDN delivery
- Supports images (JPG, PNG, WebP, etc.) and videos (MP4, WebM, etc.)
- Files are stored securely in the cloud
- Fast global delivery

### 3. **Easy Selection**
- When editing homepage sections, click "Select from Library"
- Choose from your uploaded media
- No need to manually enter URLs

## How to Use

### Step 1: Access the Media Library
1. Log in as admin (admin@ufosport.cz / admin123)
2. Navigate to `/admin/media` in your browser
3. You'll see the Media Library dashboard

### Step 2: Upload Media
1. Click the "Upload Files" button
2. Select one or multiple files (images or videos)
3. Files will be uploaded to Cloudinary and saved to your database
4. You'll see them appear in the library immediately

### Step 3: Use Media on Homepage
1. Go to the homepage
2. Click "Edit Section" on any video or image section (when logged in as admin)
3. Click "Select from Library" button next to the URL input
4. Browse and select your uploaded media
5. The URL will be automatically filled in
6. Click "Save Changes"

### Step 4: Manage Media
- **View Details**: Click on any media item to see full details
- **Copy URL**: In the details modal, click "Copy" to copy the URL
- **Delete**: In the details modal, click "Delete Media" to remove it

## Technical Details

### Database Schema
A new `Media` table stores:
- Filename and original name
- Public URL from Cloudinary
- File type (IMAGE/VIDEO)
- Size, dimensions, duration
- Tags and category (for future organization)
- Creation date

### API Endpoints
All endpoints require admin authentication for security:

- `POST /api/media/upload` - Upload files to Cloudinary
  - Requires: Admin session
  - Validates: File type, size (max 100MB)
  - Allowed types: JPEG, PNG, WebP, GIF, MP4, WebM, MOV
  
- `GET /api/media` - Fetch media with filters
  - Requires: Admin session
  - Supports: Type filter, category filter, pagination
  
- `DELETE /api/media?id=xxx` - Soft delete media
  - Requires: Admin session
  - Performs: Soft delete (sets isActive=false)

### Security Features
- ✅ Admin-only access to all media operations
- ✅ File type validation (images and videos only)
- ✅ File size limits (100MB max)
- ✅ Cloudinary credentials stored as environment variables
- ✅ Soft delete (preserves data history)
- ✅ Session-based authentication via NextAuth

### Components
- **MediaLibraryPage** - Full admin interface for media management
- **MediaSelector** - Reusable component for selecting media
- **EditSectionModal** - Updated with media selection integration

## File Types Supported

### Images
- JPG/JPEG
- PNG
- WebP
- GIF
- SVG

### Videos
- MP4 (recommended)
- WebM
- MOV
- AVI

## Tips

1. **Optimize Before Upload**: While Cloudinary will optimize, uploading already-compressed files helps
2. **Name Files Clearly**: Use descriptive names for easy identification
3. **Delete Unused Media**: Keep your library clean by removing old/unused files
4. **Free Tier Limits**: Your Cloudinary account has 25GB storage and 25GB bandwidth per month on the free tier

## Cloudinary Dashboard
Access your Cloudinary dashboard at: https://cloudinary.com/console
- View usage statistics
- Configure upload presets
- Access transformation tools
- Monitor bandwidth

## Next Steps

You can extend this system by:
1. Adding tags/categories to organize media
2. Creating image galleries
3. Building product image uploads for the shop
4. Adding video thumbnails
5. Implementing search functionality in the media library

---

**Note**: For Cloudinary credentials management, the API keys are securely stored as environment variables and never exposed in the frontend code.
