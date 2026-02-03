# Backup and Restore Strategy

**Last Updated**: 2026-02-01  
**Status**: Production-Ready

---

## Backup Configuration

### Provider
- **Database**: PostgreSQL (Neon/Supabase/Railway/Render)
- **Backup Type**: Automated point-in-time recovery + manual snapshots

### Frequency
- **Automated**: Daily at 2:00 AM UTC
- **Manual**: Before major deployments
- **Retention**: 30 days

### What's Backed Up
- All database tables (User, Profile, Opportunity, WalkInDetails, UserAction, ListingFeedback, Admin, AdminAudit)
- Schema migrations history
- Indexes and constraints

---

## Restore Procedures

### Scenario 1: Restore from Automated Backup

**Provider-Specific Commands**:

#### Neon
```bash
# List available backups
neonctl backup list --project-id <PROJECT_ID>

# Restore to timestamp
neonctl backup restore \
  --project-id <PROJECT_ID> \
  --timestamp "2024-02-01T02:00:00Z"
```

#### Supabase
```bash
# Via Dashboard: Project Settings > Database > Backups
# Select backup date > Click "Restore"

# Via CLI
supabase db restore <backup-id>
```

#### Railway
```bash
# Via Dashboard: Database > Backups tab
# Select backup > Click "Restore to this snapshot"
```

---

### Scenario 2: Manual Database Export

```bash
# Export (before risky operation)
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -U $DB_USER \
  -d $DB_NAME \
  -F c \
  -f backup_$(date +%Y%m%d_%H%M%S).dump

# Restore from manual backup
PGPASSWORD=$DB_PASSWORD pg_restore \
  -h $DB_HOST \
  -U $DB_USER \
  -d $DB_NAME \
  -c \
  backup_20260201_020000.dump
```

---

### Scenario 3: Prisma Migration Rollback

```bash
# View migration history
npx prisma migrate status

# Rollback last migration
npx prisma migrate resolve --rolled-back <migration-name>

# Reset to specific migration
npx prisma migrate reset
npx prisma migrate deploy
```

---

## Testing Restore (Required Monthly)

### Test Procedure

1. **Create test database**:
```bash
# Create separate test DB
psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE test_restore;"
```

2. **Restore backup to test DB**:
```bash
pg_restore \
  -h $DB_HOST \
  -U $DB_USER \
  -d test_restore \
  latest_backup.dump
```

3. **Verify data integrity**:
```bash
# Check row counts
psql -h $DB_HOST -U $DB_USER -d test_restore -c "
  SELECT 'User' as table, COUNT(*) FROM \"User\"
  UNION ALL
  SELECT 'Opportunity', COUNT(*) FROM \"Opportunity\"
  UNION ALL
  SELECT 'UserAction', COUNT(*) FROM \"UserAction\";
"
```

4. **Cleanup**:
```bash
psql -h $DB_HOST -U $DB_USER -c "DROP DATABASE test_restore;"
```

---

## Emergency Contacts

### Escalation Path
1. **DevOps Lead**: [Contact]
2. **Database Admin**: [Contact]
3. **Provider Support**: See links below

### Provider Support
- **Neon**: https://neon.tech/docs/support
- **Supabase**: https://supabase.com/support
- **Railway**: support@railway.app

---

## Backup Verification Checklist

Run monthly:

- [ ] Automated backups running (check logs)
- [ ] Retention policy enforced (30 days)
- [ ] Test restore completed successfully
- [ ] Backup size trending correctly
- [ ] No corruption warnings in logs

---

## Recovery Time Objective (RTO)

- **Target**: < 30 minutes for full restore
- **Tested**: [Last test date]
- **Result**: [Pass/Fail]

---

## Notes

- Never delete backups manually
- Always test restore in staging before production
- Document all restore operations in incident log
- Keep this document updated with actual provider commands
