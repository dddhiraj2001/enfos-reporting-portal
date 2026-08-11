/** Small deterministic contracts keep UI tests focused on behavior rather than data volume. */
export const reports = [
  {
    id: 'users',
    name: 'Users',
    description: 'People, roles, and account status across the organization.',
    rowCount: 2,
    lastUpdated: '2026-08-10T09:30:00',
  },
  {
    id: 'departments',
    name: 'Departments',
    description: 'Organization structure, managers, headcount, and locations.',
    rowCount: 2,
    lastUpdated: '2026-08-10T09:15:00',
  },
  {
    id: 'projects',
    name: 'Projects',
    description: 'Active and completed work with ownership and timelines.',
    rowCount: 2,
    lastUpdated: '2026-08-10T08:45:00',
  },
]

export const users = [
  {
    userId: 'USR-1001',
    name: 'Ava Patel',
    email: 'ava.patel@enfos.example',
    role: 'Administrator',
    status: 'Active',
    createdDate: '2022-03-14',
  },
  {
    userId: 'USR-1008',
    name: 'Daniel Kim',
    email: 'daniel.kim@enfos.example',
    role: 'Project Owner',
    status: 'Pending',
    createdDate: '2026-08-04',
  },
]

export const departments = [
  {
    departmentId: 'DEP-101',
    departmentName: 'Engineering',
    manager: 'Marcus Chen',
    employeeCount: 42,
    location: 'Calgary',
  },
  {
    departmentId: 'DEP-104',
    departmentName: 'Product',
    manager: 'Elena Garcia',
    employeeCount: 16,
    location: 'Vancouver',
  },
]

export const projects = [
  {
    projectId: 'PRJ-2401',
    projectName: 'Atlas Modernization',
    department: 'Engineering',
    owner: "Liam O'Connor",
    status: 'Active',
    startDate: '2026-01-12',
    endDate: '2026-11-20',
  },
  {
    projectId: 'PRJ-2406',
    projectName: 'Legacy Data Migration',
    department: 'Engineering',
    owner: 'Marcus Chen',
    status: 'Completed',
    startDate: '2025-04-07',
    endDate: '2026-06-26',
  },
]
