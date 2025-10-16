export interface ChartDataPoint {
  [key: string]: string | number
}

export interface ChartConfig {
  type: 'line' | 'area' | 'bar' | 'pie' | 'composed'
  dataKey: string
  color: string
  name?: string
}

export interface ChartProps {
  data: ChartDataPoint[]
  config: ChartConfig[]
  width?: number | string
  height?: number | string
  responsive?: boolean
}

export interface TooltipConfig {
  formatter?: (value: any, name: string) => [string, string]
  labelFormatter?: (label: string) => string
  active?: boolean
  payload?: any[]
  label?: string
}

export interface LegendConfig {
  verticalAlign?: 'top' | 'middle' | 'bottom'
  height?: number
  iconType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye'
}

export interface AxisConfig {
  dataKey?: string
  domain?: [number | string, number | string]
  tickFormatter?: (value: any) => string
  hide?: boolean
}

export interface ChartInteractionData {
  chartType: string
  dataPoint: ChartDataPoint
  seriesName?: string
  value: number | string
}