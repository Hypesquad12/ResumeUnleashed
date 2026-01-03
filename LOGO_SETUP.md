# Logo Setup Instructions

## Required Files

Please add your logo files to the following locations:

### 1. PNG Logo (Main Logo)
**Path**: `/public/images/logo.png`
- This will be used in navbar, footer, and sidebar
- Recommended size: 200x200px or larger (will be auto-scaled)
- Format: PNG with transparent background

### 2. Favicon (ICO)
**Path**: `/public/favicon.ico`
- This will be used as the browser tab icon
- Recommended size: 32x32px or 16x16px
- Format: ICO file

### Optional Additional Favicon Sizes
For better cross-platform support, you can also add:
- `/public/favicon-16x16.png` (16x16px)
- `/public/favicon-32x32.png` (32x32px)
- `/public/apple-touch-icon.png` (180x180px for iOS)

## Current Status

✅ Code updated to reference logo files
✅ Favicon metadata added to layout
✅ All components updated to use `/images/logo.png`

⚠️ **Action Required**: Add the actual logo files to the paths above

## Components Using Logo

1. **Navbar** (`src/components/landing/navbar.tsx`)
   - Uses: `/images/logo.png`
   
2. **Landing Footer** (`src/components/landing/footer.tsx`)
   - Uses: `/images/logo.png`
   
3. **Dashboard Sidebar** (`src/components/layout/sidebar.tsx`)
   - Uses: `/images/logo.png`

## After Adding Files

Once you've added the logo files:
1. Restart the development server: `npm run dev`
2. Clear browser cache or hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
3. Check that logos appear correctly on all pages

## Troubleshooting

If logos don't appear:
- Verify file paths are exactly as specified
- Check file permissions (should be readable)
- Ensure PNG has transparent background
- Try different browser or incognito mode
