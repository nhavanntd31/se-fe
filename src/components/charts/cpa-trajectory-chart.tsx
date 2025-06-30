"use client"
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ReferenceLine } from 'recharts';
import { useState } from 'react';

interface CPATrajectoryData {
  averageCPA: { semester: string; cpa: number | null }[];
  medianCPA: { semester: string; cpa: number | null }[];
  thresholdStudents: {
    threshHold: number;
    cpaTrajectory: { semester: string; cpa: number | null }[][];
  }[];
  specificStudents: {
    studentId: string;
    studentName: string;
    cpaTrajectory: { semester: string; cpa: number | null }[];
  }[];
  semesters: string[];
  totalStudents: number;
}

interface CPATrajectoryChartProps {
  data: CPATrajectoryData;
}

export function CPATrajectoryChart({ data }: CPATrajectoryChartProps) {
  const [hoveredThreshold, setHoveredThreshold] = useState<number | null>(null);

  if (!data || !data.semesters || data.semesters.length === 0) {
    return <div className="h-[400px] flex items-center justify-center">No data available</div>;
  }

  const chartData = data.semesters.map((semester) => {
    const dataPoint: any = {
      semester,
    };

    const avgCPAPoint = data.averageCPA.find(item => item.semester === semester);
    const medianCPAPoint = data.medianCPA.find(item => item.semester === semester);
    
    dataPoint.averageCPA = avgCPAPoint?.cpa;
    dataPoint.medianCPA = medianCPAPoint?.cpa;

    data.thresholdStudents.forEach(threshold => {
      const studentCPAsAtSemester = threshold.cpaTrajectory
        .map(trajectory => {
          const semesterPoint = trajectory.find(point => point.semester === semester);
          return semesterPoint?.cpa;
        })
        .filter(cpa => cpa !== null && cpa !== undefined && cpa > 0) as number[];

      if (studentCPAsAtSemester.length > 0) {
        const sortedCPAs = studentCPAsAtSemester.sort((a, b) => a - b);
        const minCPA = Math.min(...sortedCPAs);
        const maxCPA = Math.max(...sortedCPAs);
        
        dataPoint[`threshold_${threshold.threshHold}_min`] = minCPA;
        dataPoint[`threshold_${threshold.threshHold}_max`] = maxCPA;
        dataPoint[`threshold_${threshold.threshHold}_center`] = (minCPA + maxCPA) / 2;
        dataPoint[`threshold_${threshold.threshHold}_range`] = maxCPA - minCPA;
      } else {
        dataPoint[`threshold_${threshold.threshHold}_min`] = null;
        dataPoint[`threshold_${threshold.threshHold}_max`] = null;
        dataPoint[`threshold_${threshold.threshHold}_center`] = null;
        dataPoint[`threshold_${threshold.threshHold}_range`] = null;
      }
    });

    data.specificStudents.forEach(student => {
      const studentPoint = student.cpaTrajectory.find(point => point.semester === semester);
      if (studentPoint?.cpa !== null && studentPoint?.cpa !== undefined) {
        dataPoint[`student_${student.studentId}`] = studentPoint.cpa;
      }
    });

    return dataPoint;
  });

  const generateStudentColor = (index: number) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];
    return colors[index % colors.length];
  };

  const getThresholdColor = (threshold: number) => {
    const colors = {
      5: '#fde68a',   
      10: '#fdba74',  
      15: '#f87171', 
      20: '#a78bfa', 
      25: '#6ee7b7', 
      30: '#93c5fd'  
    };
    return colors[threshold as keyof typeof colors] || '#d1d5db';
  };

  const getThresholdStroke = (threshold: number) => {
    const colors = {
      5: '#d97706',   
      10: '#c2410c',  
      15: '#b91c1c', 
      20: '#6d28d9', 
      25: '#047857', 
      30: '#1d4ed8'  
    };
    return colors[threshold as keyof typeof colors] || '#4b5563';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg max-w-xs">
          <p className="font-medium">{`Semester: ${label}`}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey === 'averageCPA') {
              return (
                <p key={index} style={{ color: entry.color }}>
                  {`Average CPA: ${entry.value?.toFixed(2)}`}
                </p>
              );
            }
            if (entry.dataKey === 'medianCPA') {
              return (
                <p key={index} style={{ color: entry.color }}>
                  {`Median CPA: ${entry.value?.toFixed(2)}`}
                </p>
              );
            }
            if (entry.dataKey.startsWith('student_')) {
              const studentId = entry.dataKey.replace('student_', '');
              const student = data.specificStudents.find(s => s.studentId === studentId);
              return (
                <p key={index} style={{ color: entry.color }}>
                  {`${student?.studentName} (${studentId}): ${entry.value?.toFixed(2)}`}
                </p>
              );
            }
            return null;
          })}
          {data.thresholdStudents.map(threshold => {
            const semesterData = chartData.find(d => d.semester === label);
            const minVal = semesterData?.[`threshold_${threshold.threshHold}_min`];
            const maxVal = semesterData?.[`threshold_${threshold.threshHold}_max`];
            if (minVal && maxVal) {
              return (
                <p key={threshold.threshHold} style={{ color: getThresholdStroke(threshold.threshHold) }}>
                  {`${threshold.threshHold}% Threshold: ${minVal.toFixed(2)} - ${maxVal.toFixed(2)}`}
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-2">
        {data.thresholdStudents.map(threshold => (
          <div 
            key={threshold.threshHold}
            className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm cursor-pointer"
            style={{ 
              backgroundColor: getThresholdColor(threshold.threshHold),
              opacity: hoveredThreshold === threshold.threshHold ? 1 : 0.7
            }}
            onMouseEnter={() => setHoveredThreshold(threshold.threshHold)}
            onMouseLeave={() => setHoveredThreshold(null)}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getThresholdColor(threshold.threshHold) }}
            />
            <span>{threshold.threshHold}% Threshold</span>
          </div>
        ))}
      </div>
      
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="semester"
              label={{ value: 'Semester', position: 'insideBottom', offset: -15 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 4]} 
              label={{ value: 'CPA', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {data.thresholdStudents.map((threshold) => (
              <Area
                key={`threshold-area-${threshold.threshHold}`}
                type="monotone"
                dataKey={`threshold_${threshold.threshHold}_max`}
                stroke="none"
                fill={getThresholdColor(threshold.threshHold)}
                fillOpacity={0.3}
                name={`${threshold.threshHold}% Threshold Band`}
                connectNulls={false}
                onMouseEnter={() => setHoveredThreshold(threshold.threshHold)}
                onMouseLeave={() => setHoveredThreshold(null)}
              />
            ))}

            {data.thresholdStudents.map((threshold) => (
              <Area
                key={`threshold-base-${threshold.threshHold}`}
                type="monotone"
                dataKey={`threshold_${threshold.threshHold}_min`}
                stroke="none"
                fill="#ffffff"
                fillOpacity={1}
                name=""
                connectNulls={false}
              />
            ))}

            {data.thresholdStudents.map((threshold) => (
              <Line
                key={`threshold-min-${threshold.threshHold}`}
                type="monotone"
                dataKey={`threshold_${threshold.threshHold}_min`}
                stroke={getThresholdStroke(threshold.threshHold)}
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name={`${threshold.threshHold}% Min`}
                connectNulls={false}
              />
            ))}

            {data.thresholdStudents.map((threshold) => (
              <Line
                key={`threshold-max-${threshold.threshHold}`}
                type="monotone"
                dataKey={`threshold_${threshold.threshHold}_max`}
                stroke={getThresholdStroke(threshold.threshHold)}
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name={`${threshold.threshHold}% Max`}
                connectNulls={false}
              />
            ))}

            <Line
              type="monotone"
              dataKey="averageCPA"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              name="Average CPA"
              connectNulls={false}
            />

            <Line
              type="monotone"
              dataKey="medianCPA"
              stroke="#dc2626"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#dc2626', strokeWidth: 2, r: 3 }}
              name="Median CPA"
              connectNulls={false}
            />

            {data.specificStudents.map((student, index) => (
              <Line
                key={student.studentId}
                type="monotone"
                dataKey={`student_${student.studentId}`}
                stroke={generateStudentColor(index)}
                strokeWidth={2}
                dot={{ fill: generateStudentColor(index), strokeWidth: 2, r: 4 }}
                name={`Student ${student.studentName}`}
                connectNulls={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 