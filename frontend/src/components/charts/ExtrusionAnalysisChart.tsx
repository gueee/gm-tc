import { useMemo } from 'react'
import Plot from 'react-plotly.js'
import { chartData } from './chartData'

export default function ExtrusionAnalysisChart() {
  // Calculate statistics
  const stats = useMemo(() => {
    const rates = chartData.map(d => d.volumetric_rate)
    const times = chartData.map(d => d.time)

    const minRate = Math.min(...rates)
    const maxRate = Math.max(...rates)
    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length
    const totalTime = Math.max(...times)

    // Format time as mm:ss
    const minutes = Math.floor(totalTime / 60)
    const seconds = Math.floor(totalTime % 60)
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`

    return {
      minRate: minRate.toFixed(2),
      maxRate: maxRate.toFixed(2),
      avgRate: avgRate.toFixed(2),
      totalTime: formattedTime,
      dataPoints: chartData.length,
    }
  }, [])

  // Prepare Plotly data
  const plotData: Plotly.Data[] = [
    {
      x: chartData.map(d => d.time),
      y: chartData.map(d => d.volumetric_rate),
      type: 'scatter',
      mode: 'lines',
      name: 'Volumetric Rate',
      line: {
        color: '#D4A574',
        width: 2,
      },
      fill: 'tozeroy',
      fillcolor: 'rgba(212, 165, 116, 0.2)',
      hovertemplate: '<b>Time: %{x:.1f}s</b><br>Rate: %{y:.2f} mm³/s<extra></extra>',
    },
  ]

  // Plotly layout
  const layout: Partial<Plotly.Layout> = {
    title: undefined,
    xaxis: {
      title: {
        text: 'Time (seconds)',
        font: { color: '#a8b8c8', size: 12 },
      },
      gridcolor: 'rgba(212, 165, 116, 0.1)',
      zeroline: false,
      showgrid: true,
      tickfont: { color: '#8a9aaa', size: 11 },
      color: '#a8b8c8',
    },
    yaxis: {
      title: {
        text: 'Volumetric Rate (mm³/s)',
        font: { color: '#a8b8c8', size: 12 },
      },
      gridcolor: 'rgba(212, 165, 116, 0.1)',
      zeroline: false,
      showgrid: true,
      tickfont: { color: '#8a9aaa', size: 11 },
      color: '#a8b8c8',
    },
    plot_bgcolor: '#1a2332',
    paper_bgcolor: '#1a2332',
    font: { family: 'Inter, Arial, sans-serif', color: '#a8b8c8' },
    margin: { l: 60, r: 40, t: 20, b: 50 },
    hovermode: 'x unified',
    dragmode: 'zoom',
    showlegend: false,
    autosize: true,
  }

  // Plotly config
  const config: Partial<Plotly.Config> = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
    scrollZoom: true,
    doubleClick: 'reset',
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Minimum Rate" value={stats.minRate} unit="mm³/s" />
        <StatCard label="Average Rate" value={stats.avgRate} unit="mm³/s" />
        <StatCard label="Maximum Rate" value={stats.maxRate} unit="mm³/s" />
        <StatCard label="Movement Time" value={stats.totalTime} unit="min:sec" />
      </div>

      {/* Chart */}
      <div className="bg-steel-900 border border-steel-700 rounded-xl p-4 md:p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Volumetric Extrusion Rate Over Time
        </h2>

        <div className="w-full h-[400px] md:h-[500px]">
          <Plot
            data={plotData}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-steel-700 text-sm text-steel-400">
          <span className="text-copper-400 font-medium">Tip:</span> Scroll to zoom, click and drag to pan. Double-click to reset view.
        </div>
      </div>

      {/* Print Specifications */}
      <div className="bg-steel-900 border border-steel-700 rounded-xl p-4 md:p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Print Specifications</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <SpecItem label="Nozzle Diameter" value="0.8 mm" />
          <SpecItem label="Layer Height" value="0.4 mm" />
          <SpecItem label="Filament Diameter" value="1.75 mm" />
          <SpecItem label="Material" value="Overture TPU 80A" />
          <SpecItem label="Total Filament" value="16.19 m" />
          <SpecItem label="Extrusion Segments" value="25,940" />
          <SpecItem label="Actual Print Time" value="24m 26s" />
          <SpecItem label="Data Points" value={stats.dataPoints.toString()} />
        </div>

        <div className="pt-4 border-t border-steel-700 text-sm text-steel-400">
          <span className="text-copper-400 font-medium">Note:</span> Chart shows volumetric extrusion rates during the movement phase.
          Additional time comes from nozzle heating and START_PRINT macro execution.
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-steel-900 border border-steel-700 border-l-4 border-l-copper-400 rounded-lg p-4 hover:shadow-lg hover:shadow-copper-400/10 transition-shadow">
      <div className="text-xs text-steel-400 uppercase font-semibold mb-2 tracking-wider">
        {label}
      </div>
      <div className="text-2xl md:text-3xl font-bold text-copper-400 mb-1">
        {value}
      </div>
      <div className="text-xs text-steel-500">
        {unit}
      </div>
    </div>
  )
}

// Specification Item Component
function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="text-copper-400 font-medium block mb-1">{label}</span>
      <span className="text-steel-300">{value}</span>
    </div>
  )
}


