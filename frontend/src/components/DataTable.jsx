import { formatDate } from '../utils/formatters.js'

/** Applies presentation rules declared by each column without coupling them to report types. */
function renderCell(row, column) {
  const value = row[column.key]

  if (column.type === 'email') {
    return <a className="table-link" href={`mailto:${value}`}>{value}</a>
  }

  if (column.type === 'status') {
    return <span className={`status-badge status-badge--${value.toLowerCase().replace(' ', '-')}`}>{value}</span>
  }

  if (column.type === 'date') {
    return formatDate(value)
  }

  return value
}

/** Renders an accessible sortable table from report-driven column definitions. */
export default function DataTable({ caption, columns, rows, sort, onSort }) {
  return (
    <div className="table-frame">
      <div
        className="table-scroll"
        role="region"
        aria-label={`${caption} data`}
        tabIndex="0"
      >
        <table>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => {
                const isActive = sort.key === column.key
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={isActive ? sort.direction : 'none'}
                  >
                    <button type="button" onClick={() => onSort(column.key)}>
                      {column.label}
                      <span className="sort-indicator" aria-hidden="true">
                        {isActive ? (sort.direction === 'ascending' ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[columns[0].key]}>
                {columns.map((column) => (
                  <td key={column.key}>{renderCell(row, column)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
