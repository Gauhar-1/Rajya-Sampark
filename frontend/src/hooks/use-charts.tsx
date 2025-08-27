"use client";

import { Line, Bar, Bubble, Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { ChoroplethController, ProjectionScale, ColorScale, GeoFeature, SizeScale, } from "chartjs-chart-geo";
import worldGeoJSONRaw from "@/data/world.geo.json";

type GeoJSON = {
  features: Array<any>;
};

const worldGeoJSON: GeoJSON = worldGeoJSONRaw as GeoJSON;

// Register Chart.js components
ChartJS.register(ChoroplethController,GeoFeature, ProjectionScale, ColorScale,CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend);



export const LineChart = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Users",
        data: [120, 250, 300, 500, 400, 600],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4, // smooth curves
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        responsive: true,
        position: "top" as const,
      },
    },
  }
  return   <Line data={data} options={options} />;
  
};

export const BarChart = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue ($)",
        data: [500, 700, 800, 600, 900, 1200],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
    },
  };

  return <Bar data={data} options={options} />;
};

export const StackedBarChat = ()=>{
    const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Product A",
        data: [300, 400, 500, 600, 700, 800],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Product B",
        data: [200, 300, 400, 300, 400, 500],
        backgroundColor: "rgba(255, 159, 64, 0.6)",
      },
      {
        label: "Product C",
        data: [150, 250, 200, 350, 300, 400],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
    },
    scales: {
      x: {
        stacked: true, // stack on X-axis
      },
      y: {
        stacked: true, // stack on Y-axis
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      <Bar data={data} options={options} />
    </div>
  );
}

export const BubbleChart = ()=>{
   const data = {
    datasets: [
      {
        label: "Dataset A",
        data: [
          { x: 10, y: 20, r: 15 }, // (x, y, radius)
          { x: 15, y: 10, r: 10 },
          { x: 25, y: 8, r: 20 },
        ],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
      {
        label: "Dataset B",
        data: [
          { x: 5, y: 25, r: 12 },
          { x: 20, y: 18, r: 18 },
          { x: 30, y: 12, r: 14 },
        ],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
    },
    scales: {
      x: {
        title: { display: true, text: "X Axis" },
      },
      y: {
        title: { display: true, text: "Y Axis" },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <Bubble data={data} options={options} />
    </div>
  ); 
}



