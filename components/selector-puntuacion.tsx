"use client";

export default function SelectorPuntuacion({
  valor,
  onChange,
  etiqueta,
}: {
  valor: number;
  onChange: (v: number) => void;
  etiqueta: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{etiqueta}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`text-2xl transition-transform hover:scale-110 ${
              n <= valor ? "opacity-100" : "opacity-30"
            }`}
          >
            🧻
          </button>
        ))}
      </div>
    </div>
  );
}