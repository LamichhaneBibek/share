# Installation & Migration Guide

## 📦 Installation Steps

### 1. Install New Dependency
```bash
pnpm install
```

This will install `nanoid@^5.0.0` which is required for the improved slug generation.

---

## 🔄 Database Migration

### Option A: Fresh Start (Recommended for Development)
If you want a clean database with new schema:

```bash
# Delete the old database
rm data/app.db

# Start the app - it will auto-create new tables
pnpm dev
```

### Option B: Keep Existing Data
If you have shares you want to keep, the new schema is backward compatible:

1. Start the app normally: `pnpm dev`
2. Next.js will attempt to create tables if they don't exist
3. You may see errors about duplicate tables - this is expected
4. Manually update the schema:

```sql
-- Run this in your database if tables already exist:
ALTER TABLE shared_items ADD COLUMN view_count INTEGER DEFAULT 0;
ALTER TABLE shared_items ADD COLUMN expires_at DATETIME;
ALTER TABLE shared_items ADD COLUMN one_time_read BOOLEAN DEFAULT 0;

CREATE TABLE IF NOT EXISTS rate_limits (
  session_id TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  PRIMARY KEY (session_id, date),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_shared_items_expires_at ON shared_items(expires_at);
```

---

## 🧪 Testing the New Features

### Test Rate Limiting
```bash
# Create 101 shares in quick succession
for i in {1..101}; do
  curl -X POST http://localhost:3000/api/shares \
    -H "Content-Type: application/json" \
    -d "{\"content\": \"Test $i\"}"
done
# Should get 429 error on the 101st request
```

### Test Expiration
1. Create a share with "1 hour" expiration
2. Check the database:
```sql
SELECT slug, expires_at FROM shared_items WHERE slug = '<your-slug>';
```

### Test One-Time Read
1. Enable "One-time read" when creating a share
2. Click the share link once - content displays and it auto-deletes
3. Refresh the page - should get "Share Not Found" (404)

### Test Pagination
1. Create 25+ shares
2. View your dashboard - should show pagination controls
3. Click through pages

---

## 🚀 Running the Development Server

After installation, start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐛 Troubleshooting

### Issue: "Table already exists" errors
**Solution:** Use Option B migration steps above, or delete `data/app.db` and restart.

### Issue: Shares not expiring
**Solution:** Expiry is checked on GET requests. Manually trigger cleanup:
```sql
DELETE FROM shared_items WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP;
```

### Issue: Rate limit not working
**Solution:** Ensure you're using the same browser/session. Rate limits are per-session based on HTTP-only cookies.

### Issue: Nanoid import errors
**Solution:** Run `pnpm install` again, then restart dev server.

---

## 📊 Checking Database

To inspect the database directly:

```bash
# Using sqlite3 CLI
sqlite3 data/app.db

# Common queries:
sqlite> SELECT COUNT(*) as total_shares FROM shared_items;
sqlite> SELECT * FROM shared_items LIMIT 5;
sqlite> SELECT * FROM rate_limits;
sqlite> SELECT COUNT(*) FROM shared_items WHERE expires_at < CURRENT_TIMESTAMP;
```

---

## 🔄 Reverting Changes

If you need to revert to the original version:

```bash
# Restore original schema
git checkout lib/db.ts lib/session.ts

# Remove nanoid from package.json
pnpm remove nanoid

# Delete database to reset
rm data/app.db

# Restart
pnpm dev
```

---

## 📋 Configuration Options

Edit these in the files to customize:

### Rate Limit
**File:** `lib/session.ts`
```typescript
const RATE_LIMIT_PER_DAY = 100; // Change this number
```

### Max Content Size
**File:** `app/api/shares/route.ts`
```typescript
const MAX_CONTENT_LENGTH = 1_000_000; // 1MB in bytes
```

### Default Expiry
**File:** `app/api/shares/route.ts`
```typescript
const DEFAULT_EXPIRY_HOURS = 24 * 7; // 7 days
```

### Pagination Limit
**File:** `components/shares-list.tsx`
```typescript
const response = await fetch(`/api/shares?page=${pageNum}&limit=10`); // Change 10
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] App starts without errors: `pnpm dev`
- [ ] Dashboard loads at http://localhost:3000
- [ ] Can create a share
- [ ] Share has expiration time selector
- [ ] Share has "One-time read" checkbox
- [ ] Can view share link
- [ ] Can copy share link
- [ ] Can delete shares
- [ ] Pagination shows with multiple shares
- [ ] View counts update when visiting shares
- [ ] Rate limit triggers after many shares

---

## 🆘 Support

If you encounter issues:

1. Check the browser console for client-side errors
2. Check terminal output for server-side errors
3. Verify database file exists: `ls -la data/app.db`
4. Check database connectivity and schema
5. Ensure all dependencies installed: `pnpm install`
