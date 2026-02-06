"use client";

import type { BoardContext } from "@/types/board";

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];
const SUBJECTS = [
  "Math",
  "English Language Arts",
  "Science",
  "Social Studies",
  "Art",
  "Music",
  "Physical Education",
  "Technology",
  "World Languages",
  "Career & Technical",
];
const GRADES = [
  "K",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

interface ContextModalProps {
  context: BoardContext;
  onChange: (context: BoardContext) => void;
  forceExpanded?: boolean;
}

export default function ContextModal({ context, onChange }: ContextModalProps) {
  function toggleSubject(subject: string) {
    const current = context.subjects || [];
    const updated = current.includes(subject)
      ? current.filter((s) => s !== subject)
      : [...current, subject];
    onChange({ ...context, subjects: updated });
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg mb-6">
      <div className="px-4 py-3">
        <span className="text-sm font-semibold text-stone-700">
          Project Context
        </span>
      </div>
      <div className="px-4 pb-4 border-t border-stone-100 pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-medium text-stone-600 mb-1 block">
            State
          </label>
          <select
            value={context.state || ""}
            onChange={(e) =>
              onChange({ ...context, state: e.target.value || undefined })
            }
            className="w-full border border-stone-200 rounded px-2 py-1.5 text-sm"
          >
            <option value="">Select state...</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-stone-600 mb-1 block">
            Grade Level
          </label>
          <select
            value={context.gradeLevel || ""}
            onChange={(e) =>
              onChange({
                ...context,
                gradeLevel: e.target.value || undefined,
              })
            }
            className="w-full border border-stone-200 rounded px-2 py-1.5 text-sm"
          >
            <option value="">Select grade...</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-stone-600 mb-1 block">
            Location
          </label>
          <input
            type="text"
            value={context.location || ""}
            onChange={(e) =>
              onChange({ ...context, location: e.target.value || undefined })
            }
            placeholder="City, neighborhood..."
            className="w-full border border-stone-200 rounded px-2 py-1.5 text-sm"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="text-xs font-medium text-stone-600 mb-1 block">
            Subjects
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                className={
                  "text-xs px-2 py-1 rounded-full border transition-colors " +
                  ((context.subjects || []).includes(s)
                    ? "bg-teal-100 border-teal-300 text-teal-700"
                    : "bg-white border-stone-200 text-stone-500 hover:border-stone-300")
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
