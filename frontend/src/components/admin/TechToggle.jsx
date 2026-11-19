export function TechToggle({ options, selected, onChange }) {
  function toggle(name) {
    if (selected.includes(name)) {
      onChange(selected.filter((item) => item !== name));
    } else {
      onChange([...selected, name]);
    }
  }

  if (options.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {options.map((name) => {
        const isSelected = selected.includes(name);
        return (
          <li key={name}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggle(name)}
              className={`min-h-11 cursor-pointer rounded-full border px-3 font-mono text-label-md uppercase transition-colors duration-200 ${
                isSelected
                  ? "border-text-primary text-text-primary"
                  : "border-control text-text-muted hover:border-text-muted hover:text-text-secondary"
              }`}
            >
              {name}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
