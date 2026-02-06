"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface CollapsibleMarkdownProps {
  content: string;
  defaultExpanded?: boolean;
  onChange?: (newContent: string) => void;
  /** Unique cell identifier for cross-cell drag-and-drop */
  cellId?: string;
  /** Called when a section is dropped from another cell */
  onCrossCellDrop?: (
    sourceCellId: string,
    rawLines: string[],
    targetCellId: string,
    dropIndex: number,
  ) => void;
}

interface Section {
  header: string;
  body: string;
  /** Raw lines from the original content, used for reconstruction on reorder */
  rawLines: string[];
}

/**
 * Splits a bold-header line into the bold title portion and any trailing description.
 * e.g. "- **Community Mapping** — Walk through the neighborhood"
 *   → title: "**Community Mapping**", description: "Walk through the neighborhood"
 * e.g. "**Define**: Students narrow down the problem"
 *   → title: "**Define**", description: "Students narrow down the problem"
 */
function splitHeaderLine(line: string): { title: string; description: string } {
  // Extract the bold portion: everything from first ** to the closing **
  const boldMatch = line.match(/(\*\*[^*]+\*\*)/);
  if (!boldMatch) return { title: line, description: "" };

  const boldText = boldMatch[1];
  const afterBold = line.slice(line.indexOf(boldText) + boldText.length).trim();

  // Remove leading separators: —, -, –, :, or combinations like ": "
  const description = afterBold.replace(/^[\s]*[—–:\-]+[\s]*/, "").trim();

  return { title: boldText, description };
}

/**
 * Normalizes body text so each non-empty line renders as a separate bullet point.
 * Lines that are already bullets (starting with - or *) are left as-is.
 * Plain text lines are converted to bullets for consistent spacing.
 */
function normalizeBody(body: string): string {
  if (!body) return body;
  const lines = body.split("\n");
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      result.push("");
      continue;
    }
    // Already a bullet or sub-bullet — keep as-is
    if (/^\s*[-*]\s/.test(line)) {
      result.push(line);
    } else {
      // Convert plain text line to a bullet
      result.push("- " + trimmed);
    }
  }
  return result.join("\n");
}

/**
 * Parses markdown content into collapsible sections.
 * Detects patterns like:
 *   - **Header** followed by body text/sub-bullets
 *   - **Header**: description followed by sub-bullets
 * The bold title is extracted as the collapsible header; any description
 * text on the same line is moved into the body.
 * Returns null if the content doesn't have a clear section structure.
 */
function parseSections(content: string): Section[] | null {
  const lines = content.split("\n");
  const sections: Section[] = [];
  let currentHeader: string | null = null;
  let currentBody: string[] = [];
  let currentRawLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect a bold header line: starts with "- **" or "* **" or just "**"
    const isBulletHeader = /^[-*]\s+\*\*[^*]+\*\*/.test(trimmed);
    const isStandaloneHeader =
      /^\*\*[^*]+\*\*/.test(trimmed) && !trimmed.startsWith("**Note");

    if (isBulletHeader || isStandaloneHeader) {
      // Save previous section
      if (currentHeader !== null) {
        sections.push({
          header: currentHeader,
          body: currentBody.join("\n").trim(),
          rawLines: [...currentRawLines],
        });
      }
      // Split the bold title from any inline description
      const { title, description } = splitHeaderLine(trimmed);
      currentHeader = title;
      currentBody = description ? [description] : [];
      currentRawLines = [line];
    } else if (currentHeader !== null) {
      currentBody.push(line);
      currentRawLines.push(line);
    } else {
      // Content before any header
      if (trimmed) {
        currentBody.push(line);
        currentRawLines.push(line);
      }
    }
  }

  // Save last section
  if (currentHeader !== null) {
    sections.push({
      header: currentHeader,
      body: currentBody.join("\n").trim(),
      rawLines: [...currentRawLines],
    });
  }

  // Use collapsible mode if there's at least 1 section
  if (sections.length < 1) {
    return null;
  }

  // If there was pre-header content, prepend it as a non-collapsible intro
  const firstHeaderIndex = lines.findIndex((line) => {
    const t = line.trim();
    return (
      /^[-*]\s+\*\*[^*]+\*\*/.test(t) ||
      (/^\*\*[^*]+\*\*/.test(t) && !t.startsWith("**Note"))
    );
  });
  if (firstHeaderIndex > 0) {
    const introLines = lines.slice(0, firstHeaderIndex);
    const intro = introLines.join("\n").trim();
    if (intro) {
      sections.unshift({ header: "", body: intro, rawLines: introLines });
    }
  }

  return sections;
}

function CollapsibleSection({
  section,
  defaultExpanded,
  index,
  draggable,
  canDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onDelete,
  onEditSection,
  isDragOver,
  cellId,
}: {
  section: Section;
  defaultExpanded: boolean;
  index: number;
  draggable: boolean;
  canDelete: boolean;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDelete: (index: number) => void;
  onEditSection: (index: number, newRawText: string) => void;
  isDragOver: boolean;
  cellId?: string;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
      textareaRef.current.focus();
    }
  }, [editing, editText]);

  function startEditing() {
    setEditText(section.rawLines.join("\n"));
    setEditing(true);
    setExpanded(true);
  }

  function commitEdit() {
    onEditSection(index, editText);
    setEditing(false);
  }

  // Non-collapsible intro section (no header)
  if (!section.header) {
    if (editing) {
      return (
        <div className="mb-1">
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setEditing(false);
              }
            }}
            className="w-full text-sm text-stone-800 bg-white border border-brand-300 rounded-md px-3 py-3 my-2 resize-none focus:outline-none focus:ring-1 focus:ring-brand-300 min-h-[50px]"
          />
        </div>
      );
    }
    return (
      <div
        className="prose prose-sm prose-stone max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 mb-1 cursor-text"
        onDoubleClick={(e) => {
          e.stopPropagation();
          startEditing();
        }}
      >
        <ReactMarkdown>{section.body}</ReactMarkdown>
      </div>
    );
  }

  const hasBody = section.body.length > 0;

  if (editing) {
    return (
      <div
        className={
          "group/section border-b border-stone-100 last:border-b-0 transition-all " +
          (isDragOver ? "border-t-2 border-t-brand-400" : "")
        }
        onDragOver={(e) => onDragOver(e, index)}
        onDrop={(e) => onDrop(e, index)}
      >
        <div className="py-1.5">
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setEditing(false);
              }
            }}
            className="w-full text-sm text-stone-800 bg-white border border-brand-300 rounded-md px-3 py-3 my-2 resize-none focus:outline-none focus:ring-1 focus:ring-brand-300 min-h-[70px]"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        "group/section border-b border-stone-100 last:border-b-0 transition-all " +
        (isDragOver ? "border-t-2 border-t-brand-400" : "")
      }
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
    >
      <div className="flex items-start">
        {draggable && (
          <div
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              onDragStart(e, index);
            }}
            onDragEnd={onDragEnd}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing px-1 py-1.5 text-stone-300 hover:text-stone-500 select-none"
            title="Drag to reorder"
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
              <circle cx="3" cy="2" r="1.2" />
              <circle cx="7" cy="2" r="1.2" />
              <circle cx="3" cy="7" r="1.2" />
              <circle cx="7" cy="7" r="1.2" />
              <circle cx="3" cy="12" r="1.2" />
              <circle cx="7" cy="12" r="1.2" />
            </svg>
          </div>
        )}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (hasBody) setExpanded(!expanded);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            startEditing();
          }}
          className={
            "flex-1 text-left py-1.5 flex items-start gap-1.5 cursor-text " +
            (hasBody ? "hover:bg-stone-50/50" : "")
          }
        >
          {hasBody && (
            <span
              className="text-[10px] text-stone-400 mt-1 flex-shrink-0 w-3 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? "\u25BC" : "\u25B6"}
            </span>
          )}
          <div className="prose prose-sm prose-stone max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:mb-0 [&>ul]:mb-0">
            <ReactMarkdown>{section.header}</ReactMarkdown>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            onDoubleClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover/section:opacity-100 flex-shrink-0 px-1.5 py-1.5 text-stone-300 hover:text-red-500 transition-opacity"
            title="Remove section"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="1" y1="1" x2="9" y2="9" />
              <line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>
        )}
      </div>
      {hasBody && expanded && (
        <div
          onDoubleClick={(e) => {
            e.stopPropagation();
            startEditing();
          }}
          className={
            "pb-1.5 prose prose-sm prose-stone max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-stone-800 [&>ul]:list-disc [&>ul]:pl-5 [&_ul_ul]:list-disc [&_ul_ul]:pl-5 cursor-text " +
            (draggable ? "pl-7" : "pl-4.5")
          }
        >
          <ReactMarkdown>{normalizeBody(section.body)}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default function CollapsibleMarkdown({
  content,
  defaultExpanded = false,
  onChange,
  cellId,
  onCrossCellDrop,
}: CollapsibleMarkdownProps) {
  const sections = parseSections(content);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragSourceIndex = useRef<number | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      dragSourceIndex.current = index;
      // Store data in dataTransfer for cross-cell drag
      if (sections && cellId) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          "application/x-pbl-section",
          JSON.stringify({
            sourceCellId: cellId,
            sectionIndex: index,
            rawLines: sections[index].rawLines,
          }),
        );
      }
    },
    [sections, cellId],
  );

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverIndex(null);

      // Check if this is a cross-cell drop
      const transferData = e.dataTransfer.getData("application/x-pbl-section");
      if (transferData && cellId) {
        try {
          const data = JSON.parse(transferData);
          if (data.sourceCellId !== cellId) {
            // Cross-cell drop — delegate to parent with exact position
            if (onCrossCellDrop) {
              onCrossCellDrop(
                data.sourceCellId,
                data.rawLines,
                cellId,
                dropIndex,
              );
            }
            return;
          }
        } catch {}
      }

      // Within-cell reorder
      const sourceIndex = dragSourceIndex.current;
      if (
        sourceIndex === null ||
        sourceIndex === dropIndex ||
        !sections ||
        !onChange
      )
        return;

      const reordered = [...sections];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(dropIndex, 0, moved);

      const newContent = reordered.map((s) => s.rawLines.join("\n")).join("\n");
      onChange(newContent);
      dragSourceIndex.current = null;
    },
    [sections, onChange, cellId, onCrossCellDrop],
  );

  const handleDragEnd = useCallback(() => {
    setDragOverIndex(null);
    dragSourceIndex.current = null;
  }, []);

  const handleDelete = useCallback(
    (index: number) => {
      if (!sections || !onChange) return;
      const remaining = sections.filter((_, i) => i !== index);
      if (remaining.length === 0) {
        onChange("");
      } else {
        const newContent = remaining
          .map((s) => s.rawLines.join("\n"))
          .join("\n");
        onChange(newContent);
      }
    },
    [sections, onChange],
  );

  const handleEditSection = useCallback(
    (index: number, newRawText: string) => {
      if (!sections || !onChange) return;
      const updated = sections.map((s, i) => {
        if (i !== index) return s;
        return { ...s, rawLines: newRawText.split("\n") };
      });
      const newContent = updated.map((s) => s.rawLines.join("\n")).join("\n");
      onChange(newContent);
    },
    [sections, onChange],
  );

  // Fallback to plain markdown if no collapsible structure detected
  if (!sections) {
    return (
      <div className="prose prose-sm prose-stone max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  const hasMultipleSections = sections.filter((s) => s.header).length > 1;
  const draggable = !!onChange && hasMultipleSections;
  const canDelete = !!onChange;

  return (
    <div>
      {sections.map((section, i) => (
        <CollapsibleSection
          key={i}
          section={section}
          defaultExpanded={defaultExpanded}
          index={i}
          draggable={draggable && !!section.header}
          canDelete={canDelete && !!section.header}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onDelete={handleDelete}
          onEditSection={handleEditSection}
          isDragOver={dragOverIndex === i && dragSourceIndex.current !== i}
          cellId={cellId}
        />
      ))}
    </div>
  );
}
