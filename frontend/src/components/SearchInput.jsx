/** Renders a consistently labeled controlled search field. */
export default function SearchInput({ id, label, value, onChange, placeholder }) {
  return (
    <div className="search-field">
      <label className="search-field__label" htmlFor={id}>{label}</label>
      <div className="search-field__control">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
        </svg>
        <input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
