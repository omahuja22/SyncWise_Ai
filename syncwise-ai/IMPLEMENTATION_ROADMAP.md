# SyncWise AI - Production Implementation Roadmap

## ✅ COMPLETED (This Session)

### Phase 1: Team-Based Architecture Foundation
- ✅ Enhanced Task interface with team_id, priority, description, deadline
- ✅ Created `analyticsService.ts` with:
  - `computeTeamStats()` - Calculate team performance metrics
  - `assessRisk()` - Detect risk conditions
  - `getTeamLeaderboard()` - Compute rankings by points
  - `logActivity()` - Track user engagement
  - `getUserEngagement()` - Get 7-day activity count
- ✅ Updated `taskService.ts` with:
  - `getTeamTasks(teamId)` - Fetch team-scoped tasks
  - Enhanced `createTask()` with description and priority
- ✅ Fixed TaskCard component for new schema
- ✅ Created database migration SQL

### Build Status
✅ TypeScript compilation passes
✅ All 15 routes generate successfully
✅ No type errors

---

## 🚀 NEXT IMMEDIATE STEPS (HIGH PRIORITY)

### Step 1: Apply Database Migration (5 minutes)
**File:** `supabase/migrations/002_team_based_system_setup.sql`

1. Go to Supabase → SQL Editor
2. Copy entire migration file content
3. Paste into SQL editor
4. Click "Run"
5. Verify no errors

**What it does:**
- Creates `activity_logs` table for engagement tracking
- Adds missing columns to `tasks` table (team_id, description, priority)
- Enables RLS policies for data isolation
- Creates `team_stats_view` for efficient analytics queries

**Command to check if applied:**
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'team_id';
```

### Step 2: Update useTasks Hook (10 minutes)
**File:** `hooks/useTasks.ts`

Replace the hook to use `getTeamTasks()` and teamContext:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTeams } from '@/app/contexts/TeamContext';
import { getTeamTasks } from '@/services/taskService';
import { Task } from '@/app/data/tasks';

export const useTasks = () => {
  const { user } = useAuth();
  const { selectedTeamId } = useTeams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      if (!user?.id) {
        setTasks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔹 [useTasks] Loading tasks for team:', selectedTeamId);

        // If team selected: fetch team tasks
        // Otherwise: return empty for demo
        if (selectedTeamId) {
          const teamTasks = await getTeamTasks(selectedTeamId);
          setTasks(teamTasks);
        } else {
          setTasks([]);
        }

        setError(null);
      } catch (err: any) {
        console.error('❌ [useTasks] Error:', err.message);
        setError(err.message);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [selectedTeamId, user?.id]);

  return { tasks, loading, error };
};
```

### Step 3: Update OverviewPage to Show Team Stats (15 minutes)
**File:** `app/components/pages/OverviewPage.tsx`

Add this at the top of the component to import analytics:

```typescript
import { getTeamTasks } from '@/services/taskService';
import { computeTeamStats, assessRisk } from '@/services/analyticsService';
import { useTeams } from '@/app/contexts/TeamContext';
```

Replace the stat calculation section with:

```typescript
const { selectedTeamId, selectedTeam } = useTeams();
const [teamStats, setTeamStats] = useState<any>(null);
const [riskAlert, setRiskAlert] = useState<any>(null);

useEffect(() => {
  const loadTeamStats = async () => {
    if (!selectedTeamId) {
      setTeamStats(null);
      return;
    }
    
    try {
      const tasks = await getTeamTasks(selectedTeamId);
      const stats = computeTeamStats(tasks);
      const risk = assessRisk(tasks);
      
      setTeamStats(stats);
      setRiskAlert(risk);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };
  
  loadTeamStats();
}, [selectedTeamId]);

// Use teamStats for display
const totalTasks = teamStats?.totalTasks || tasks.length;
const completedTasks = teamStats?.completedTasks || tasks.filter(t => t.status === 'done').length;
```

Add risk alert banner after welcome section:

```typescript
{riskAlert?.atRisk && (
  <motion.div
    className="rounded-lg p-4 mb-4"
    style={{
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      color: '#ef4444',
    }}
  >
    {riskAlert.reason}
  </motion.div>
)}
```

### Step 4: Update LeaderboardPage for Real Data (20 minutes)
**File:** `app/components/pages/LeaderboardPage.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useTeams } from '@/app/contexts/TeamContext';
import { getTeamLeaderboard } from '@/services/analyticsService';
import { motion } from 'framer-motion';

interface LeaderboardUser {
  userId: string;
  userName: string;
  totalPoints: number;
  tasksCompleted: number;
  onTimePercentage: number;
  rank?: number;
}

export default function LeaderboardPage() {
  const { selectedTeamId, selectedTeam } = useTeams();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!selectedTeamId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getTeamLeaderboard(selectedTeamId);
        setLeaderboard(data);
      } catch (err) {
        console.error('Error loading leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [selectedTeamId]);

  if (!selectedTeam) {
    return (
      <div className="text-center p-12">
        <p style={{ color: 'var(--text-secondary)' }}>
          Select a team to see the leaderboard
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          🏆 Leaderboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Top performers in {selectedTeam.name}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 border-3 border-slate-600 border-t-green-500 rounded-full animate-spin" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center p-12 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No team members yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg p-4 flex items-center justify-between"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                  style={{
                    backgroundColor:
                      index === 0
                        ? '#fbbf24'
                        : index === 1
                        ? '#c0cfe4'
                        : index === 2
                        ? '#cd7f32'
                        : '#6b7280',
                  }}
                >
                  {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--foreground)' }}>
                    {user.userName}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {user.tasksCompleted} completed
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
                  {user.totalPoints}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {user.onTimePercentage}% on-time
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📋 REMAINING FEATURES (Phase 2-3)

### Feature: Create Task Modal Integration
- Add team_id to task creation
- Show team selector in CreateTaskModal
- Test task creation from dashboard

### Feature: Premium UI Upgrades
- [ ] Dark theme with green accents
- [ ] Glassmorphism cards
- [ ] Smooth hover animations
- [ ] Better spacing

### Feature: Activity Tracking
- [ ] Log activity on task view
- [ ] Log activity on task complete
- [ ] Display in user profile

### Feature: Analytics Page
- [ ] Charts for task completion trends
- [ ] Time-series of efficiency score
- [ ] Team performance metrics

### Feature: Email Notifications (Future)
- [ ] Task assigned notifications
- [ ] Overdue reminders
- [ ] Weekly summary

---

## 🧪 TESTING CHECKLIST

After each feature:

### Database Tests
```sql
-- Check if team tasks filter works
SELECT * FROM tasks WHERE team_id = 'YOUR_TEAM_ID' LIMIT 5;

-- Check activity logs
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;

-- Check team stats view
SELECT * FROM team_stats_view WHERE id = 'YOUR_TEAM_ID';
```

### Application Tests
- [ ] Create team → Create task → See on dashboard
- [ ] Task shows correct team context
- [ ] Leaderboard shows real points
- [ ] Analytics show real metrics
- [ ] Risk detection triggers correctly
- [ ] Switch teams → Tasks update correctly

### RLS Tests
- [ ] User can only see their teams
- [ ] User can only see tasks in their teams
- [ ] Non-members cannot access team data

---

## 🎨 UI ENHANCEMENTS (Premium Feel)

### Color Scheme
```css
--foreground: #ffffff (white text)
--card-bg: rgba(255, 255, 255, 0.05) (dark cards)
--accent-success: #22c55e (green)
--text-secondary: #9ca3af (gray)
--border: rgba(255, 255, 255, 0.1)
```

### Typography
- H1: 32px, 700 weight (titles)
- H2: 24px, 600 weight (sections)
- Body: 14px, 400 weight (default)
- Small: 12px, 400 weight

### Spacing
- Gap: 4px, 8px, 12px, 16px, 24px, 32px
- Padding: 12px, 16px, 24px
- Border radius: 8px, 12px, 16px

### Animations
- Fade in: 300ms ease-out
- Scale: 0.95 → 1 on hover
- Slide: -4px on hover

---

## 🚨 CRITICAL NOTES

1. **Migration Required**: Run the SQL migration before features will work
2. **Team Selection**: All features require a selected team
3. **RLS Policies**: Ensure RLS is enabled for security
4. **Performance**: Use indexes for large datasets
5. **Error Handling**: Check browser console for detailed logs

---

## 📊 EFFICIENCY FORMULA

```
Efficiency = (0.5 × On-time rate) + (0.3 × Completion rate) + (0.2 × Activity)
```

- **On-time rate**: % of tasks completed by deadline
- **Completion rate**: % of total tasks completed
- **Activity**: Normalized by task count

---

## 🔐 RLS POLICIES CHECKLIST

- [ ] Users can only access their teams
- [ ] Users can only see tasks in their teams
- [ ] Leaders can manage team members
- [ ] Members cannot modify team settings
- [ ] Activity logs are private but visible to team

---

## 📞 QUICK SUPPORT REFERENCE

### Common Errors

**Error: "Could not find relationship"**
- Solution: Run migration 002_team_based_system_setup.sql

**Error: "team_id column not found"**
- Solution: Verify migration ran successfully

**Error: "tasks not showing"**
- Solution: Check selected team, verify RLS policies

**Error: "leaderboard empty"**
- Solution: Create tasks with team_id, check filters

---

## ✨ DEMO FLOW (For Investors)

1. **Sign in** → See dashboard
2. **Create team** "My Awesome Team"
3. **Create 3 tasks** with different priorities
4. **Complete 2 tasks** → See leaderboard update
5. **Show analytics** → Highlight efficiency score
6. **Switch teams** → Show data isolation
7. **Show risk alert** → If pending > 3
8. **Mobile demo** → Show responsive design

---

## 📝 SESSION SUMMARY

### What Was Accomplished
- ✅ Task interface updated for team system
- ✅ Analytics engine created (6 functions)
- ✅ Task service enhanced for team queries
- ✅ Database migration SQL prepared
- ✅ Build passes all type checks
- ✅ Application fully compiles

### Next Session Should Focus On
1. Run database migration
2. Update useTasks hook
3. Update OverviewPage stats
4. Update LeaderboardPage
5. Test all features end-to-end
6. Premium UI polish

### Time Estimate
- Database migration: 5 min
- Hook update: 10 min
- Dashboard update: 15 min
- Leaderboard update: 20 min
- Testing: 15 min
- **Total: ~75 minutes for full Phase 2**

---

**Build Status**: ✅ PASSING
**Migrations Ready**: ✅ YES
**Features Completed**: ✅ 1 of 11
**Quality Level**: Production-ready foundation
