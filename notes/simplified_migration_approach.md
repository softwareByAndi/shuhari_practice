# Simplified Migration Approach (Dev Environment)

Since this project is still in development, we can perform a direct migration without the complexity of parallel systems, feature flags, or backwards compatibility. This document outlines the streamlined approach.

## Migration Steps

### Step 1: Apply Database Schema
Simply run the migration to create new tables:
```bash
# Apply the new schema
psql $DATABASE_URL < supabase/migrations/004_new_architecture.sql
```

### Step 2: Migrate Existing Data
Run a one-time data migration script:

```sql
-- Insert seed data for stages
INSERT INTO stage (stage_id, code, display_name) VALUES
(1, 'hatsu', '初 Hatsu - Begin'),
(2, 'shu', '守 Shu - Obey'),
(3, 'kan', '鑑 Kan - Mirror'),
(4, 'ha', '破 Ha - Break'),
(5, 'toi', '問 Toi - Question'),
(6, 'ri', '離 Ri - Leave'),
(7, 'ku', '空 Ku - Void');

-- Insert difficulty levels
INSERT INTO difficulty_level (difficulty_level_id, code, display_name, character, pronunciation, description) VALUES
(101, 'seedling', 'Seedling', '苗', 'nae', 'Just beginning to sprout'),
(102, 'sapling', 'Sapling', '若木', 'wakagi', 'Young and growing steadily'),
(103, 'bamboo', 'Bamboo', '竹', 'take', 'Flexible strength, rapid growth'),
(104, 'cedar', 'Cedar', '杉', 'sugi', 'Established and reaching high'),
(105, 'ancient_oak', 'Ancient Oak', '樫', 'kashi', 'Deep roots, mighty presence');

-- Insert difficulty progressions
INSERT INTO difficulty_progression (difficulty_progression_id, code, hatsu, shu, kan, ha, toi, ri) VALUES
(1, 'standard', 1000, 2500, 5000, 10000, 25000, 50000),
(2, 'kids_mode', 500, 1000, 2000, 4000, 8000, 16000);

-- Create field, subject, and topics
INSERT INTO field (field_id, code, display_name, is_active) VALUES
(1, 'math', 'Mathematics', true),
(2, 'science', 'Science', false),
(3, 'programming', 'Programming', false);

INSERT INTO subject (subject_id, code, field_id, display_name) VALUES
(1, 'arithmetic', 1, 'Arithmetic'),
(2, 'algebra', 1, 'Algebra'),
(3, 'geometry', 1, 'Geometry');

INSERT INTO topic (topic_id, code, subject_id, difficulty_progression_id, display_name) VALUES
(1, 'add', 1, 1, 'Addition'),
(2, 'sub', 1, 1, 'Subtraction'),
(3, 'mul', 1, 1, 'Multiplication'),
(4, 'div', 1, 1, 'Division'),
(5, 'mod', 1, 1, 'Modulus'),
(6, 'exp', 1, 1, 'Exponents'),
(7, 'root', 1, 1, 'Square Roots'),
(8, 'add_w_negatives', 1, 1, 'Addition with Negatives'),
(9, 'subtract_w_negatives', 1, 1, 'Subtraction with Negatives');

-- Link all topics to all difficulty levels
INSERT INTO topic_difficulty_option (topic_id, difficulty_level_id)
SELECT t.topic_id, d.difficulty_level_id
FROM topic t
CROSS JOIN difficulty_level d;

-- Migrate existing practice_sessions to new session table
INSERT INTO session (
    user_id, topic_id, stage_id, start_time, end_time,
    total_reps, avg_response_time, median_response_time, accuracy
)
SELECT
    ps.user_id,
    CASE ps.module
        WHEN 'addition' THEN 1
        WHEN 'subtraction' THEN 2
        WHEN 'multiplication' THEN 3
        WHEN 'division' THEN 4
        WHEN 'modulus' THEN 5
        WHEN 'exponents' THEN 6
        WHEN 'square-roots' THEN 7
        WHEN 'negatives-addition' THEN 8
        WHEN 'negatives-subtraction' THEN 9
    END as topic_id,
    CASE ps.current_level
        WHEN 'shu' THEN 2
        WHEN 'ha' THEN 4
        WHEN 'ri' THEN 6
    END as stage_id,
    ps.created_at,
    ps.updated_at,
    ps.total_reps,
    ps.session_avg_response_time,
    ps.session_avg_response_time, -- Use avg as approximation for median
    1.0 -- Assume 100% accuracy for old data
FROM practice_sessions ps
WHERE ps.module IS NOT NULL;

-- Create user_progress records based on highest achieved stage
INSERT INTO user_progress (user_id, topic_id, stage_id)
SELECT
    s.user_id,
    s.topic_id,
    MAX(s.stage_id) as current_stage
FROM session s
GROUP BY s.user_id, s.topic_id;

-- Drop old tables
DROP TABLE IF EXISTS practice_sessions CASCADE;
```

### Step 3: Replace Code Directly

Since we're in dev, we can directly replace files without maintaining backwards compatibility:

1. **Replace lib/supabase.ts** → Create new version with new schema
2. **Update problem-generator.ts** → Add stage-based generation
3. **Replace navigation pages** → New field/subject/topic structure
4. **Update practice component** → 7-stage progression logic
5. **Update RecentPractice** → New progress display

### Step 4: Update Environment

No changes needed to environment variables - same Supabase connection.

## File Replacement Plan

### 1. Database Layer (lib/supabase.ts)
- Delete old functions
- Add new types and functions for new schema
- No need for compatibility layers

### 2. Problem Generator
- Replace digit-based generation with stage/difficulty-based
- Simpler logic since we don't need to support both

### 3. Navigation Structure
```
Old:
/practice/math/equations/[type]/practice?digits=1

New:
/practice/math/arithmetic/[topic]?stage=2&difficulty=101
```

### 4. Practice Component
- Remove old 3-level logic
- Implement 7-stage progression
- Add median tracking and accuracy

## Benefits of Direct Migration

1. **Simpler Code**: No dual systems or feature flags
2. **Faster Development**: No compatibility layers
3. **Cleaner Architecture**: Start fresh with new design
4. **Easier Testing**: Only test new system
5. **Less Technical Debt**: No temporary code to remove later

## Migration Checklist

### Pre-Migration
- [x] Design new schema
- [x] Create migration SQL
- [ ] Backup current dev database (optional but recommended)

### Migration Execution
- [ ] Run schema migration SQL
- [ ] Run data migration SQL
- [ ] Replace lib/supabase.ts
- [ ] Update problem-generator.ts
- [ ] Update navigation pages
- [ ] Update practice component
- [ ] Update UI components

### Post-Migration
- [ ] Test all practice flows
- [ ] Verify data migration
- [ ] Remove old unused code
- [ ] Update documentation

## Potential Issues & Solutions

### Issue: Module name mapping
Old system uses different names (e.g., 'square-roots' vs 'root')
**Solution**: Handle in migration SQL with CASE statements

### Issue: Missing historical data
Old system doesn't track median or accuracy
**Solution**: Use reasonable defaults (avg for median, 100% for accuracy)

### Issue: URL structure change
Bookmarks will break
**Solution**: Not an issue in dev - just update any test scripts

## Next Steps

1. Run the database migration
2. Create new lib/supabase.ts with clean implementation
3. Update components one by one
4. Test thoroughly
5. Deploy to dev environment

This simplified approach will save significant development time and result in cleaner code since we don't need to maintain two systems in parallel.