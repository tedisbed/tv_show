import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const shows = ['Test show a', 'Show B', 'Show C', 'Show A', 'Show D', 'Show E', 'Show F'];
const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28'];

// Custom tooltip to show detailed information
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    // Sort the payload by value (rank) in ascending order
    const sortedPayload = [...payload].sort((a, b) => {
      const rankA = a.value as number;
      const rankB = b.value as number;
      return rankA - rankB;
    });

    return (
      <div className="custom-tooltip" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{`Week: ${label}`}</p>
        {sortedPayload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
            {`${index + 1}. ${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const LineChartComponent = () => {
  const [data, setData] = useState([]);
  const [shows, setShows] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let { data, error } = await supabase
        .from('TopTenList')
        .select(`
          Shows (
            title
          ),
          rank,
          date
        `)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        console.log('Fetched data:', data);
        if (data && data.length > 0) {
          // Process the data for the chart
          const processedData = processDataForChart(data);
          setData(processedData);
          
          // Extract unique show names
          const uniqueShows = [...new Set(data.map(item => item.Shows.title))];
          setShows(uniqueShows);
        } else {
          console.log('No data returned from Supabase');
        }
      }
    } catch (error) {
      console.error('Exception occurred:', error);
    }
  };

  const processDataForChart = (rawData) => {
    // Group the data by date
    const groupedByDate = rawData.reduce((acc, item) => {
      const date = new Date(item.date).toISOString().split('T')[0]; // Format date as YYYY-MM-DD
      if (!acc[date]) {
        acc[date] = { week: date };
      }
      acc[date][item.Shows.title] = item.rank;
      return acc;
    }, {});

    // Convert the grouped data to an array
    return Object.values(groupedByDate);
  };

  return (
    <div style={{ width: '100%', height: '80vh', minHeight: '600px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="week"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 14 }}
          />
          <YAxis
            domain={[1, 10]}
            reversed={true}
            tick={{ fontSize: 14 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '20px' }}
          />
          {shows.map((show, index) => (
            <Line
              key={show}
              type="monotone"
              dataKey={show}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
