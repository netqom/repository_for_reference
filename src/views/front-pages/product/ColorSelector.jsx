"use client"

import { useState } from "react"

export default function ColorSelector() {
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "Blue", value: "#3498db" },
    { name: "Yellow", value: "#f1c40f" },
    { name: "Orange", value: "#e67e22" },
    { name: "Green", value: "#2ecc71" },
    { name: "Red", value: "#e74c3c" },
    { name: "Brown", value: "#795548" },
  ]

  const [selectedColor, setSelectedColor] = useState(colors[6].value)

  return (
    <div className="p-0 mb-5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-normal">Choose Color:</span>
        <div className="flex items-center gap-2">
          {colors.map((color) => (
            <button
              key={color.value}
              className="relative w-6 h-6 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              style={{ backgroundColor: color.value }}
              onClick={() => setSelectedColor(color.value)}
              aria-label={`Select ${color.name}`}
            >
              {selectedColor === color.value && (
                <i className="ri-check-line text-white text-sm"></i>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
