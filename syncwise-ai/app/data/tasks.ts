export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string | null; // UUID of assigned user
  assigned_to_user?: {
    full_name?: string;
    avatar_url?: string;
  } | null;
  status: TaskStatus;
  priority?: TaskPriority;
  deadline?: string;
  points: number;
  user_id?: string; // Creator
  team_id?: string; // Which team owns this task
  created_at?: string;
  updated_at?: string;
}

export const dummyTasks: Task[] = [
  {
    id: '1',
    title: 'Design dashboard layout',
    assigned_to: 'user-alice',
    assigned_to_user: {
      full_name: 'Alice Johnson',
      avatar_url: undefined,
    },
    status: 'done',
    deadline: '2026-04-05',
    points: 8,
  },
  {
    id: '2',
    title: 'Implement user authentication',
    assigned_to: 'user-bob',
    assigned_to_user: {
      full_name: 'Bob Smith',
      avatar_url: undefined,
    },
    status: 'in-progress',
    deadline: '2026-04-12',
    points: 13,
  },
  {
    id: '3',
    title: 'Create task management API',
    assigned_to: 'user-carol',
    assigned_to_user: {
      full_name: 'Carol Davis',
      avatar_url: undefined,
    },
    status: 'pending',
    deadline: '2026-04-15',
    points: 21,
  },
  {
    id: '4',
    title: 'Build leaderboard component',
    assigned_to: 'user-david',
    assigned_to_user: {
      full_name: 'David Wilson',
      avatar_url: undefined,
    },
    status: 'pending',
    deadline: '2026-04-18',
    points: 13,
  },
  {
    id: '5',
    title: 'Setup database schema',
    assigned_to: 'user-eve',
    assigned_to_user: {
      full_name: 'Eve Martinez',
      avatar_url: undefined,
    },
    status: 'in-progress',
    deadline: '2026-04-10',
    points: 8,
  },
];
