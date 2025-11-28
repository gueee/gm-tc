import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ExtrusionAnalysisChart = () => {
  const chartData = [
    {"time": 0.3, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 0.7, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 1.0, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 1.5, "volumetric_rate": 31.27, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 1.8, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 2.2, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 2.8, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 3.5, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 4.9, "volumetric_rate": 31.17, "linear_rate": 12.96, "feedrate": 5760.0},
    {"time": 5.2, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 5.8, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 6.4, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 7.7, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 9.1, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 9.7, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 11.0, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 12.2, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 26.9, "volumetric_rate": 45.59, "linear_rate": 18.95, "feedrate": 8400.0},
    {"time": 31.8, "volumetric_rate": 45.59, "linear_rate": 18.96, "feedrate": 8400.0},
    {"time": 37.4, "volumetric_rate": 45.59, "linear_rate": 18.96, "feedrate": 8400.0},
    {"time": 40.5, "volumetric_rate": 45.59, "linear_rate": 18.95, "feedrate": 8400.0},
    {"time": 44.1, "volumetric_rate": 45.59, "linear_rate": 18.96, "feedrate": 8400.0},
    {"time": 46.2, "volumetric_rate": 45.59, "linear_rate": 18.96, "feedrate": 8400.0},
    {"time": 55.4, "volumetric_rate": 45.59, "linear_rate": 18.96, "feedrate": 8400.0},
    {"time": 56.2, "volumetric_rate": 31.26, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 56.5, "volumetric_rate": 31.25, "linear_rate": 12.99, "feedrate": 5760.0},
    {"time": 56.8, "volumetric_rate": 31.27, "linear_rate": 13.0, "feedrate": 5760.0},
    {"time": 57.1, "volumetric_rate": 45.59, "linear_rate": 18.95, "feedrate": 8400.0},
    {"time": 57.6, "volumetric_rate": 24.71, "linear_rate": 10.28, "feedrate": 4666.0},
    {"time": 58.1, "volumetric_rate": 36.2, "linear_rate": 15.05, "feedrate": 6669.0},
    {"time": 58.9, "volumetric_rate": 36.06, "linear_rate": 14.99, "feedrate": 6644.0},
    {"time": 60.1, "volumetric_rate": 36.03, "linear_rate": 14.98, "feedrate": 6639.0},
    {"time": 60.8, "volumetric_rate": 36.17, "linear_rate": 15.04, "feedrate": 6665.0},
    {"time": 61.6, "volumetric_rate": 36.05, "linear_rate": 14.99, "feedrate": 6641.0},
    {"time": 62.6, "volumetric_rate": 36.07, "linear_rate": 15.0, "feedrate": 6645.0},
    {"time": 63.3, "volumetric_rate": 8.44, "linear_rate": 3.51, "feedrate": 4667.0},
    {"time": 68.1, "volumetric_rate": 90.0, "linear_rate": 37.42, "feedrate": 16582.0},
    {"time": 77.3, "volumetric_rate": 90.0, "linear_rate": 37.42, "feedrate": 16582.0},
    {"time": 84.3, "volumetric_rate": 90.0, "linear_rate": 37.42, "feedrate": 16582.0},
    {"time": 86.9, "volumetric_rate": 15.17, "linear_rate": 6.31, "feedrate": 4688.0},
    {"time": 87.2, "volumetric_rate": 36.19, "linear_rate": 15.05, "feedrate": 6667.0},
    {"time": 87.5, "volumetric_rate": 36.1, "linear_rate": 15.01, "feedrate": 6712.0},
    {"time": 88.4, "volumetric_rate": 36.06, "linear_rate": 14.99, "feedrate": 6644.0},
    {"time": 89.7, "volumetric_rate": 36.03, "linear_rate": 14.98, "feedrate": 6639.0},
    {"time": 90.2, "volumetric_rate": 36.17, "linear_rate": 15.04, "feedrate": 6665.0},
    {"time": 91.0, "volumetric_rate": 36.04, "linear_rate": 14.98, "feedrate": 6639.0},
    {"time": 92.0, "volumetric_rate": 36.07, "linear_rate": 14.99, "feedrate": 6645.0},
    {"time": 92.6, "volumetric_rate": 15.53, "linear_rate": 6.46, "feedrate": 4614.0},
    {"time": 94.8, "volumetric_rate": 90.0, "linear_rate": 37.42, "feedrate": 16582.0},
    {"time": 102.7, "volumetric_rate": 90.0, "linear_rate": 37.42, "feedrate": 16582.0},
    {"time": 109.0, "volumetric_rate": 90.0, "linear_rate": 37.42, "feedrate": 16582.0},
    {"time": 113.5, "volumetric_rate": 90.0, "linear_rate": 37.42, "feedrate": 16582.0},
    {"time": 116.5, "volumetric_rate": 6.24, "linear_rate": 2.59, "feedrate": 4567.0},
    {"time": 150, "volumetric_rate": 62.53, "linear_rate": 26.0, "feedrate": 11520.0},
    {"time": 200, "volumetric_rate": 90.0, "linear_rate": 37.42, "feedrate": 16582.0},
    {"time": 300, "volumetric_rate": 62.53, "linear_rate": 26.0, "feedrate": 11520.0},
    {"time": 400, "volumetric_rate": 90.0, "linear_rate": 37.42, "feedrate": 16582.0},
    {"time": 500, "volumetric_rate": 56.77, "linear_rate": 23.6, "feedrate": 10460.0},
    {"time": 600, "volumetric_rate": 90.0, "linear_rate": 37.42, "feedrate": 16582.0},
    {"time": 606.7, "volumetric_rate": 20.45, "linear_rate": 8.5, "feedrate": 4800.0}
  ];

  const stats = useMemo(() => {
    const volumetricRates = chartData.map(d => d.volumetric_rate);
    return {
      min: Math.min(...volumetricRates),
      max: Math.max(...volumetricRates),
      avg: (volumetricRates.reduce((a, b) => a + b, 0) / volumetricRates.length).toFixed(2),
      totalTime: chartData[chartData.length - 1].time,
      totalMinutes: (chartData[chartData.length - 1].time / 60).toFixed(2)
    };
  }, []);

  return (
    <div style={{ width: '100%', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h2 style={{ marginTop: 0 }}>G-Code Extrusion Rate Analysis</h2>
      
      <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Minimum Rate</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>{stats.min.toFixed(2)}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>mm³/s</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Average Rate</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>{stats.avg}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>mm³/s</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Maximum Rate</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>{stats.max.toFixed(2)}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>mm³/s</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Print Time</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9C27B0' }}>{stats.totalMinutes}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>minutes</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0 }}>Volumetric Extrusion Rate Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time (seconds)', position: 'insideBottomRight', offset: -5 }}
              stroke="#666"
            />
            <YAxis 
              label={{ value: 'Volumetric Rate (mm³/s)', angle: -90, position: 'insideLeft' }}
              stroke="#666"
            />
            <Tooltip 
              formatter={(value) => value.toFixed(2)}
              labelFormatter={(label) => `${label.toFixed(1)}s`}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="volumetric_rate" 
              stroke="#FF6B6B" 
              dot={false}
              isAnimationActive={false}
              name="Volumetric Rate (mm³/s)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0 }}>Print Specifications</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '14px' }}>
          <div><strong>Nozzle:</strong> 0.8 mm</div>
          <div><strong>Layer Height:</strong> 0.4 mm</div>
          <div><strong>Filament:</strong> 1.75 mm</div>
          <div><strong>Material:</strong> TPU 80A</div>
          <div><strong>Total Filament:</strong> ~16.19 m</div>
          <div><strong>Extrusion Segments:</strong> 25,940</div>
        </div>
      </div>
    </div>
  );
};

export default ExtrusionAnalysisChart;
