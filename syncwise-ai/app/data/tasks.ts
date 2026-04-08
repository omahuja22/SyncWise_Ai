export type TaskStatus = 'pending' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  assignedTo: {
    name: string;
    avatar: string;
  };
  status: TaskStatus;
  deadline?: string;
  points: number;
}

export const dummyTasks: Task[] = [
  {
    id: '1',
    title: 'Design dashboard layout',
    assignedTo: {
      name: 'Alice Johnson',
      avatar: 'AJ',
    },
    status: 'done',
    deadline: '2026-04-05',
    points: 8,
  },
  {
    id: '2',
    title: 'Implement user authentication',
    assignedTo: {
      name: 'Bob Smith',
      avatar: 'BS',
    },
    status: 'in-progress',
    deadline: '2026-04-12',
    points: 13,
  },
  {
    id: '3',
    title: 'Create task management API',
    assignedTo: {
      name: 'Carol Davis',
      avatar: 'CD',
    },
    status: 'pending',
    deadline: '2026-04-15',
    points: 21,
  },
  {
    id: '4',
    title: 'Build leaderboard component',
    assignedTo: {
      name: 'David Wilson',
      avatar: 'DW',
    },
    status: 'pending',
    deadline: '2026-04-18',
    points: 13,
  },
  {
    id: '5',
    title: 'Setup database schema',
    assignedTo: {
      name: 'Eve Martinez',
      avatar: 'EM',
    },
    status: 'in-progress',
    deadline: '2026-04-10',
    points: 8,
  },
];
