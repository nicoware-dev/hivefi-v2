"use client";

import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { useEffect, useState } from "react";

Chart.register(CategoryScale);

type ChartTitles = {
  x?: string | undefined;
  y?: string | undefined;
  yRight?: string | undefined;
};

export default function ChartBarStacked({
  chartTitles,
  chartData,
}: {
  chartTitles: ChartTitles;
  chartData: any;
}) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  chartData.datasets.forEach((data: any, index: number) => {
    let radius = { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };

    if (index === 1 && index === chartData.datasets.length - 1) {
      radius = { topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6 };
    } else if (index === 1) {
      radius = { topLeft: 0, topRight: 0, bottomLeft: 6, bottomRight: 6 };
    } else if (index === chartData.datasets.length - 1) {
      radius = { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 };
    }
    data.borderRadius = [radius];
    data.borderSkipped = false;
  });

  return (
    <Bar
      data={chartData}
      width={10}
      height={5}
      options={{
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false, // This allows the chart to fill the container height
        scales: {
          x: {
            stacked: true,
            title: {
              display: false,
              text: chartTitles.x,
            },
          },
          y: {
            stacked: true,
            display: !isSmallScreen && chartTitles.y != undefined,

            title: {
              display: false,
              text: chartTitles.y,
            },
          },
          yRight: {
            display: !isSmallScreen && chartTitles.yRight != undefined,

            position: "right",
            grid: {
              drawOnChartArea: false,
            },
            title: {
              display: false,
              text: chartTitles.yRight,
            },
          },
        },
      }}
    />
  );
}
