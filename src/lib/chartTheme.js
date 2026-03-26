/**
 * Shared MUI X Charts theme utilities for dark/light mode support.
 */

const textColor = "var(--color-foreground)"
const mutedColor = "var(--color-muted-foreground)"
const borderColor = "var(--color-border)"

export const CHART_FONT = {
  fontSize: 11,
  fontFamily: "inherit",
  fill: textColor,
}

export const GRID_SX = {
  "& .MuiChartsGrid-line": {
    strokeDasharray: "4 4",
    stroke: borderColor,
    strokeOpacity: 0.5,
  },
}

/** Full sx to apply on any chart for dark mode support */
export const CHART_SX = {
  // Axis tick labels
  "& .MuiChartsAxis-tickLabel": {
    fill: `${mutedColor} !important`,
  },
  // Axis lines
  "& .MuiChartsAxis-line": {
    stroke: borderColor,
  },
  // Axis ticks
  "& .MuiChartsAxis-tick": {
    stroke: borderColor,
  },
  // Legend text (SVG and HTML variants)
  "& .MuiChartsLegend-label": {
    fill: `${mutedColor} !important`,
    color: `${mutedColor} !important`,
  },
  "& .MuiChartsLegend-series text": {
    fill: `${mutedColor} !important`,
  },
  "& .MuiChartsLegend-root": {
    color: `${mutedColor} !important`,
  },
  "& [class*='MuiChartsLegend'] span": {
    color: `${mutedColor} !important`,
  },
  "& text": {
    fill: `${mutedColor} !important`,
  },
  // Tooltip
  "& .MuiChartsTooltip-root": {
    backgroundColor: "var(--color-popover) !important",
    color: "var(--color-popover-foreground) !important",
    borderColor: `${borderColor} !important`,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  "& .MuiChartsTooltip-table": {
    color: "inherit !important",
  },
  "& .MuiChartsTooltip-cell": {
    color: "inherit !important",
  },
  "& .MuiChartsTooltip-labelCell": {
    color: "inherit !important",
  },
  "& .MuiChartsTooltip-valueCell": {
    color: "inherit !important",
    fontWeight: 600,
  },
  // Grid
  ...GRID_SX,
}

/** Merge CHART_SX with extra sx props */
export function chartSx(extra = {}) {
  return { ...CHART_SX, ...extra }
}

export const C = {
  primary: "#6366f1",
  emerald: "#10b981",
  amber: "#f59e0b",
  blue: "#3b82f6",
  red: "#ef4444",
  violet: "#8b5cf6",
  rose: "#f43f5e",
}
