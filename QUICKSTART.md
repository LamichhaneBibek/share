quickstart.md
# Quick Start Guide

## Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev

# 3. Open browser
# Visit http://localhost:3000
```

---

## ✨ New Features to Try

### 1. Create a Share with Expiration
1. Go to dashboard
2. Enter some text
3. **NEW:** Select expiration time (1hr, 1day, 7days, 30days)
4. **NEW:** Check "One-time read" if sensitive
5. Click "Create Share"

### 2. View Your Shares
1. Dashboard shows recent shares
2. **NEW:** See view count, expiry date, security badges
3. **NEW:** Click "..." to delete a share
4. **NEW:** Use pagination buttons to browse more

### 3. Share with Others
1. Click copy button on share
2. Send link to someone
3. They open it - content displays
4. **NEW:** If one-time read enabled, auto-deletes

### 4. Test Rate Limiting
- Create shares rapidly
- After 100 in one day, you'll get: "Rate limit exceeded"
- Resets at midnight UTC

---

## 📖 Documentation

Read these files for detailed information:

| File | Purpose |
|------|---------|
| IMPLEMENTATION_SUMMARY.md | Overview of all 10 improvements |
| MIGRATION_GUIDE.md | Setup, installation, troubleshooting |
| API_REFERENCE.md | Complete API documentation |
| CHANGES.md | Summary of all file changes |

---

## 🧪 Testing Checklist

```
□ Create share with text
□ Select different expiration times
□ Enable one-time read mode
□ View share in browser
□ Check view count increased
□ Copy share link
□ Delete a share
□ Browse multiple pages
□ Create 101 shares (test rate limit)
□ Verify expired shares are removed
```

---

## 🔧 Configuration

Edit these in the code to customize:

### Rate Limit
- **File:** `lib/session.ts`
- **Variable:** `RATE_LIMIT_PER_DAY`
- **Default:** 100 shares/day

### Max Content Size
- **File:** `app/api/shares/route.ts`
- **Variable:** `MAX_CONTENT_LENGTH`
- **Default:** 1MB (1,000,000 bytes)

### Default Expiry
- **File:** `app/api/shares/route.ts`
- **Variable:** `DEFAULT_EXPIRY_HOURS`
- **Default:** 168 hours (7 days)

### Pagination Limit
- **File:** `components/shares-list.tsx`
- **URL:** `&limit=10` (change 10 to desired value)
- **Max:** 50 items per page

---

## 🐛 Common Issues

### "Database locked" error
→ Delete `data/app.db` and restart

### Rate limit triggered too early
→ Check database: `SELECT * FROM rate_limits;`
→ Delete row if needed: `DELETE FROM rate_limits;`

### Shares not expiring
→ Check database: `SELECT * FROM shared_items WHERE expires_at < CURRENT_TIMESTAMP;`
→ Delete manually if needed

### "Share not found" after creating
→ Refresh page
→ Check browser console for errors
→ Check terminal for server errors

---

## 📊 API Examples

### Create Share (New Options)
```bash
curl -X POST http://localhost:3000/api/shares \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello World",
    "expiryHours": 1,
    "oneTimeRead": true
  }'
```

### Get Shares with Pagination
```bash
curl http://localhost:3000/api/shares?page=1&limit=20
```

### Delete a Share
```bash
curl -X DELETE http://localhost:3000/api/shares/a1b2c3d4
```

---

## 📱 Mobile Friendly

All features work on mobile:
- ✅ Create shares on mobile
- ✅ View shares on mobile
- ✅ Delete shares on mobile
- ✅ Responsive pagination

---

## 🚀 Next Steps

1. **Familiarize yourself** with the new features
2. **Read** IMPLEMENTATION_SUMMARY.md for details
3. **Customize** configuration to your needs
4. **Deploy** when ready
5. **Monitor** database size (expired shares auto-cleanup)

---

## 📞 Support

If you encounter issues:

1. Check **MIGRATION_GUIDE.md** troubleshooting section
2. Review **API_REFERENCE.md** for API details
3. Check browser console (F12) for client errors
4. Check terminal output for server errors
5. Reset database if needed: `rm data/app.db`

---

## 🎉 You're All Set!

Your text sharing app now has:
- ✅ Professional API with pagination
- ✅ Security features (rate limiting, size limits)
- ✅ User privacy (expiration, one-time read)
- ✅ Better performance (server rendering, indexes)

**Happy sharing! 🚀**
