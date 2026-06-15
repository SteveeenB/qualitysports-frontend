export default function SizeChips({ tallas = [], selected, onSelect, disabled = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      {[...tallas].sort((a, b) => a - b).map(t => {
        const isSelected = selected === t
        return (
          <button
            key={t}
            type="button"
            disabled={disabled}
            onClick={() => onSelect?.(isSelected ? null : t)}
            className={`w-10 h-10 rounded-lg text-sm font-medium border transition-all
              ${isSelected
                ? 'bg-[#C0392B] text-white border-[#C0392B]'
                : 'bg-white text-gray-700 border-gray-300 hover:border-[#C0392B] hover:text-[#C0392B]'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}
