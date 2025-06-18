"use client"

import { useTheme } from "next-themes"

const matrix = [
  [1, 1, 2, 3, 3],
  [1, 2, 2, 3, 3],
  [2, 2, 3, 4, 4],
  [2, 3, 3, 4, 5],
  [3, 3, 4, 5, 5],
]

const colors = {
  1: "bg-green-500/20 hover:bg-green-500/30",
  2: "bg-yellow-500/20 hover:bg-yellow-500/30",
  3: "bg-orange-500/20 hover:bg-orange-500/30",
  4: "bg-red-500/20 hover:bg-red-500/30",
  5: "bg-red-900/20 hover:bg-red-900/30",
}

export function RiskMatrix() {
  const { theme } = useTheme()

  return (
    <div className="grid h-[300px] w-full grid-cols-5 gap-1">
      {matrix.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            className={`${
              colors[cell as keyof typeof colors]
            } flex items-center justify-center rounded-md border text-sm font-medium transition-colors`}
          >
            {cell}
          </div>
        )),
      )}
    </div>
  )
}

