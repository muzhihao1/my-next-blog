'use client' import { useEffect, useRef }
from 'react' 

import { useTheme }
from '@/lib/hooks/useTheme' interface HeatMapCell { x: number y: number value: number label?: string }
interface HeatMapProps { data: HeatMapCell[]
title?: string xLabels?: string[]
yLabels?: string[]
width?: number height?: number cellSize?: number showValues?: boolean colorScale?: { min: string mid?: string max: string }
formatValue?: (value: number) => string className?: string }
export function HeatMap({ data, title, xLabels = [], yLabels = [], width = 600, height = 400, cellSize = 40, showValues = true, colorScale = { min: '#E0F2FE', mid: '#3B82F6', max: '#1E40AF' }, formatValue = (v) => v.toString(), className = '' }: HeatMapProps) { const canvasRef = useRef<HTMLCanvasElement>(null) const tooltipRef = useRef<HTMLDivElement>(null) const { theme } = useTheme() useEffect(() => { const canvas = canvasRef.current const tooltip = tooltipRef.current if (!canvas || !tooltip) return const ctx = canvas.getContext('2d') if (!ctx) return // Set canvas size canvas.width = width * window.devicePixelRatio canvas.height = height * window.devicePixelRatio ctx.scale(window.devicePixelRatio, window.devicePixelRatio) // Calculate dimensions const padding = { top: title ? 60 : 40, right: 20, bottom: 80, left: 100 }
const gridWidth = width - padding.left - padding.right const gridHeight = height - padding.top - padding.bottom // Calculate grid dimensions const maxX = Math.max(...data.map(d => d.x), xLabels.length - 1) const maxY = Math.max(...data.map(d => d.y), yLabels.length - 1) const cols = maxX + 1 const rows = maxY + 1 const actualCellWidth = Math.min(cellSize, gridWidth / cols) const actualCellHeight = Math.min(cellSize, gridHeight / rows) // Find min and max values const values = data.map(d => d.value) const minValue = Math.min(...values) const maxValue = Math.max(...values) const range = maxValue - minValue || 1 // Color interpolation function const getColor = (value: number): string => { const normalized = (value - minValue) / range if (!colorScale.mid) { // Linear interpolation between min and max return interpolateColor(colorScale.min, colorScale.max, normalized) }
else { // Two-step interpolation if (normalized <= 0.5) { return interpolateColor(colorScale.min, colorScale.mid, normalized * 2) }
else { return interpolateColor(colorScale.mid, colorScale.max, (normalized - 0.5) * 2) }
} }
// Set styles const textColor = theme === 'dark' ? '#F3F4F6' : '#111827' const bgColor = theme === 'dark' ? '#111827' : '#FFFFFF' const gridColor = theme === 'dark' ? '#374151' : '#E5E7EB' // Clear canvas ctx.fillStyle = bgColor ctx.fillRect(0, 0, width, height) // Draw title if (title) { ctx.fillStyle = textColor ctx.font = 'bold 16px sans-serif' ctx.textAlign = 'center' ctx.textBaseline = 'top' ctx.fillText(title, width / 2, 20) }
// Draw cells data.forEach(cell => { const x = padding.left + cell.x * actualCellWidth const y = padding.top + cell.y * actualCellHeight const color = getColor(cell.value) // Draw cell ctx.fillStyle = color ctx.fillRect(x, y, actualCellWidth - 1, actualCellHeight - 1) // Draw cell border ctx.strokeStyle = gridColor ctx.lineWidth = 1 ctx.strokeRect(x, y, actualCellWidth - 1, actualCellHeight - 1) // Draw value if (showValues && actualCellWidth > 30 && actualCellHeight > 20) { ctx.fillStyle = getLuminance(color) > 0.5 ? '#111827' : '#F3F4F6' ctx.font = '11px sans-serif' ctx.textAlign = 'center' ctx.textBaseline = 'middle' ctx.fillText( formatValue(cell.value), x + actualCellWidth / 2, y + actualCellHeight / 2 ) }
}) // Draw Y labels ctx.fillStyle = textColor ctx.font = '12px sans-serif' ctx.textAlign = 'right' ctx.textBaseline = 'middle' yLabels.forEach((label, i) => { const y = padding.top + i * actualCellHeight + actualCellHeight / 2 ctx.fillText(label, padding.left - 10, y) }) // Draw X labels ctx.save() ctx.textAlign = 'center' ctx.textBaseline = 'top' xLabels.forEach((label, i) => { const x = padding.left + i * actualCellWidth + actualCellWidth / 2 const y = padding.top + rows * actualCellHeight + 10 // Rotate labels if they're too long if (label.length > 5) { ctx.save() ctx.translate(x, y) ctx.rotate(-Math.PI / 4) ctx.textAlign = 'right' ctx.fillText(label, 0, 0) ctx.restore() }
else { ctx.fillText(label, x, y) }
}) ctx.restore() // Draw color scale legend const legendWidth = 200 const legendHeight = 20 const legendX = width - padding.right - legendWidth const legendY = height - 40 // Draw gradient const gradient = ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0) gradient.addColorStop(0, colorScale.min) if (colorScale.mid) gradient.addColorStop(0.5, colorScale.mid) gradient.addColorStop(1, colorScale.max) ctx.fillStyle = gradient ctx.fillRect(legendX, legendY, legendWidth, legendHeight) // Legend border ctx.strokeStyle = gridColor ctx.strokeRect(legendX, legendY, legendWidth, legendHeight) // Legend labels ctx.fillStyle = textColor ctx.font = '10px sans-serif' ctx.textAlign = 'center' ctx.textBaseline = 'top' ctx.fillText(formatValue(minValue), legendX, legendY + legendHeight + 5) if (colorScale.mid) { ctx.fillText(formatValue((minValue + maxValue) / 2), legendX + legendWidth / 2, legendY + legendHeight + 5) }
ctx.fillText(formatValue(maxValue), legendX + legendWidth, legendY + legendHeight + 5) // Mouse interaction const handleMouseMove = (event: MouseEvent) => { const rect = canvas.getBoundingClientRect() const x = event.clientX - rect.left const y = event.clientY - rect.top // Check if mouse is over a cell const cellX = Math.floor((x - padding.left) / actualCellWidth) const cellY = Math.floor((y - padding.top) / actualCellHeight) if (cellX >= 0 && cellX < cols && cellY >= 0 && cellY < rows) { const cell = data.find(d => d.x === cellX && d.y === cellY) if (cell) { tooltip.style.display = 'block' tooltip.style.left = `${event.clientX + 10}
px` tooltip.style.top = `${event.clientY - 30}
px` tooltip.innerHTML = ` <div class="bg-gray-900 text-white px-2 py-1 rounded text-sm"> ${xLabels[cellX] || `X: ${cellX}`} / ${yLabels[cellY] || `Y: ${cellY}`}
<br/> 值: ${formatValue(cell.value)}
${cell.label ? `<br/>${cell.label}` : ''} </div> ` }
else { tooltip.style.display = 'none' }
}
else { tooltip.style.display = 'none' }
}
const handleMouseLeave = () => { tooltip.style.display = 'none' }
canvas.addEventListener('mousemove', handleMouseMove) canvas.addEventListener('mouseleave', handleMouseLeave) return () => { canvas.removeEventListener('mousemove', handleMouseMove) canvas.removeEventListener('mouseleave', handleMouseLeave) }
}, [data, title, xLabels, yLabels, width, height, cellSize, showValues, colorScale, formatValue, theme]) // Helper function to interpolate between two colors const interpolateColor = (color1: string, color2: string, factor: number): string => { const c1 = hexToRgb(color1) const c2 = hexToRgb(color2) if (!c1 || !c2) return color1 const r = Math.round(c1.r + (c2.r - c1.r) * factor) const g = Math.round(c1.g + (c2.g - c1.g) * factor) const b = Math.round(c1.b + (c2.b - c1.b) * factor) return `rgb(${r}, ${g}, ${b})` }
// Helper function to convert hex to RGB const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null }
// Helper function to calculate luminance const getLuminance = (color: string): number => { const rgb = color.match(/\d+/g) if (!rgb) return 0 const [r, g, b] = rgb.map(Number) return (0.299 * r + 0.587 * g + 0.114 * b) / 255 }
return ( <div className={`relative inline-block ${className}`}>
<canvas ref={canvasRef}
className="cursor-crosshair" style={{ width, height }
}
/>
<div ref={tooltipRef}
className="fixed z-50 pointer-events-none" style={{ display: 'none' }
}
/> </div> ) }