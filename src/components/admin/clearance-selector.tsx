"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  CLEARANCE_LEVELS,
  CLEARANCE_LABELS,
  CLEARANCE_DESCRIPTIONS,
  CLEARANCE_NAMES,
  type ClearanceLevel
} from "@/lib/clearance";

interface ClearanceSelectorProps {
  value: ClearanceLevel;
  onChange: (level: ClearanceLevel) => void;
  disabled?: boolean;
  maxLevel?: ClearanceLevel;
}

export function ClearanceSelector({
  value,
  onChange,
  disabled = false,
  maxLevel = CLEARANCE_LEVELS.BLUE, // Default max: Tenant Admin
}: ClearanceSelectorProps) {
  const levels: ClearanceLevel[] = [0, 1, 2, 3, 4, 5, 6];

  const getColorClass = (level: ClearanceLevel) => {
    const colors = {
      0: "bg-gray-900 hover:bg-gray-800",
      1: "bg-red-500 hover:bg-red-600",
      2: "bg-orange-500 hover:bg-orange-600",
      3: "bg-yellow-500 hover:bg-yellow-600",
      4: "bg-green-500 hover:bg-green-600",
      5: "bg-blue-500 hover:bg-blue-600",
      6: "bg-purple-500 hover:bg-purple-600",
    };
    return colors[level];
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {levels.map((level) => {
          const isDisabled = disabled || level > maxLevel;
          const isSelected = value === level;

          return (
            <button
              key={level}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(level)}
              className={`
                relative p-4 rounded-lg text-white text-center transition-all
                ${getColorClass(level)}
                ${isSelected ? "ring-4 ring-offset-2 ring-white shadow-lg scale-105" : ""}
                ${isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div className="text-xs font-bold mb-1">
                {CLEARANCE_NAMES[level]}
              </div>
              <div className="text-2xl font-bold">{level}</div>
            </button>
          );
        })}
      </div>

      {/* Selected level details */}
      <div className="p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-3 h-3 rounded-full ${getColorClass(value)}`} />
          <span className="font-semibold text-lg">
            Niveau {value} - {CLEARANCE_NAMES[value]}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {CLEARANCE_LABELS[value]}: {CLEARANCE_DESCRIPTIONS[value]}
        </p>
      </div>
    </div>
  );
}
