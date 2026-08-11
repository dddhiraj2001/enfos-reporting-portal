/**
 * Defines frontend presentation metadata for the stable backend report contracts.
 * The live-backend contract check detects report IDs or fields that drift out of sync.
 */
export const reportConfigs = {
  users: {
    id: 'users',
    name: 'Users',
    description: 'People, roles, and account access across the organization.',
    singularName: 'user',
    columns: [
      { key: 'userId', label: 'User ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'createdDate', label: 'Created date', type: 'date' },
    ],
  },
  departments: {
    id: 'departments',
    name: 'Departments',
    description: 'Organization structure, managers, headcount, and locations.',
    singularName: 'department',
    columns: [
      { key: 'departmentId', label: 'Department ID' },
      { key: 'departmentName', label: 'Department name' },
      { key: 'manager', label: 'Manager' },
      { key: 'employeeCount', label: 'Employee count' },
      { key: 'location', label: 'Location' },
    ],
  },
  projects: {
    id: 'projects',
    name: 'Projects',
    description: 'Active and completed work with ownership and timelines.',
    singularName: 'project',
    columns: [
      { key: 'projectId', label: 'Project ID' },
      { key: 'projectName', label: 'Project name' },
      { key: 'department', label: 'Department' },
      { key: 'owner', label: 'Owner' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'startDate', label: 'Start date', type: 'date' },
      { key: 'endDate', label: 'End date', type: 'date' },
    ],
  },
}

/** Returns presentation metadata only for report routes supported by the frontend. */
export function getReportConfig(reportId) {
  return reportConfigs[reportId]
}
