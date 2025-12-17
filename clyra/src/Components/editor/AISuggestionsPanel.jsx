export default function AISuggestionsPanel({ open, suggestions, onApply, onClose }) {
  if (!open) return null;       // ← sidebar shows ONLY when open=true
  if (!suggestions) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl p-6 overflow-y-auto z-50">

      <button className="text-gray-500 mb-4" onClick={onClose}>Close</button>

      <h2 className="text-xl font-semibold mb-4">AI Suggestions</h2>

      {suggestions.length === 0 && (
        <p className="text-gray-500">No issues found 🎉</p>
      )}

      <div className="space-y-4">
        {suggestions.map((s, i) => (
          <div key={i} className="p-4 border rounded-xl bg-gray-50">
            <h3 className="font-semibold mb-1">{s.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{s.description}</p>

            <button
              onClick={() => onApply(s.operation)}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm"
            >
              Apply This Fix
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
