// src/components/SoberIcon.jsx
"use client";

/**
 * SoberIcon — gold sparkle indicator shown on calendar cells when the user was sober.
 *
 * Usage:
 *   <SoberIcon size={14} />
 *   <SoberIcon size={16} title="Sober day" />
 *
 * Default colors are classic gold; pass `color`/`stroke` to override.
 * Renders inline-block; position via the parent (e.g. absolute top-left of a calendar cell).
 */
export default function SoberIcon({
  size = 14,
  color = "#d4a017",
  stroke = "#8a6a0e",
  title = "Sober",
  style,
  className,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      style={{ display: "block", flexShrink: 0, ...style }}
      className={className}
    >
      <title>{title}</title>
      <path
        d="M 7 0 L 8.5 5.5 L 14 7 L 8.5 8.5 L 7 14 L 5.5 8.5 L 0 7 L 5.5 5.5 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
