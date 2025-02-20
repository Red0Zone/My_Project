// EnergyVisualization.jsx
import React, { useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveChoroplethCanvas } from "@nivo/geo";
import axios from "axios";
import styles from "./EnergyVisualization.module.css"; // Import CSS module

const EnergyVisualization = () => {
  const [view, setView] = useState("chart");
  const [chartData, setChartData] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [geoFeatures, setGeoFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get("./energy_plot_data.json");
        setChartData([
          {
            id: "World",
            data: response.data.map((item) => ({
              x: item.year,
              y: item.change,
            })),
          },
        ]);
      } catch (error) {
        console.error("Error loading chart data:", error);
        setError("Failed to load chart data.");
        setLoading(false);
      }
    };

    const fetchMapData = async () => {
      try {
        const [dataRes, featuresRes] = await Promise.all([
          axios.get("./energy-map-data.json"),
          axios.get("./world_countries2.json"),
        ]);

        setMapData(dataRes.data);
        setGeoFeatures(featuresRes.data.features);
      } catch (error) {
        console.error("Error loading map data:", error);
        setError("Failed to load map data.");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
    fetchMapData();
  }, []);

  const toggleView = (selectedView) => {
    setView(selectedView);
  };

  if (loading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.visualizationContainer}>
      {" "}
      {/* Apply CSS class from module */}
      <div className={styles.viewButtons}>
        {" "}
        {/* Apply CSS class from module */}
        <button
          onClick={() => toggleView("map")}
          className={`${styles.viewButton} ${
            view === "map" ? styles.viewButtonActive : ""
          }`}
        >
          {/* Apply CSS classes from module */}
          Map View
        </button>
        <button
          onClick={() => toggleView("chart")}
          className={`${styles.viewButton} ${
            view === "chart" ? styles.viewButtonActive : ""
          }`}
        >
          {/* Apply CSS classes from module */}
          Chart View
        </button>
      </div>
      {view === "chart" ? (
        <EnergyChart data={chartData} />
      ) : (
        <ResponsiveChoroplethCanvas
          data={mapData}
          features={geoFeatures}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          colors="RdBu"
          domain={[0, 1000000]}
          unknownColor="#101b42"
          label="properties.name"
          valueFormat=".2s"
          projectionTranslation={[0.5, 0.5]}
          projectionRotation={[0, 0, 0]}
          enableGraticule={true}
          graticuleLineColor="rgba(0, 0, 0, .2)"
          borderWidth={0.5}
          borderColor="#101b42"
          legends={[
            {
              anchor: "bottom-left",
              direction: "column",
              justify: true,
              translateX: 20,
              translateY: -60,
              itemsSpacing: 0,
              itemWidth: 92,
              itemHeight: 18,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 18,
            },
          ]}
        />
      )}
    </div>
  );
};

const EnergyChart = ({ data }) => {
  const chartData = data;

  if (
    !chartData ||
    chartData.length === 0 ||
    !chartData[0].data ||
    chartData[0].data.length === 0
  ) {
    return <div>No chart data available.</div>;
  }

  const allYears = chartData[0].data.map((d) => d.x);
  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);

  const xAxisLabels = [1966, 1970, 1980, 1990, 2000, 2010, 2023];

  return (
    <div className={styles.chartContainer}>
      {" "}
      {/* Apply CSS class from module */}
      <ResponsiveLine
        data={chartData}
        margin={{ top: 50, right: 110, bottom: 80, left: 80 }}
        xScale={{
          type: "linear",
          min: minYear,
          max: maxYear,
        }}
        yScale={{
          type: "linear",
          min: -4,
          max: 8,
          stacked: false,
          reverse: false,
        }}
        yFormat=" >-.2f"
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: "Year",
          legendOffset: 60,
          legendPosition: "middle",
          tickValues: xAxisLabels,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Annual Change (%)",
          legendOffset: -60,
          legendPosition: "middle",
          format: (value) => `${value}%`,
        }}
        colors={{ scheme: "category10" }}
        pointSize={8}
        enableTouchCrosshair={true}
        useMesh={true}
        tooltip={({ point }) => (
          <div className={styles.tooltip}>
            {" "}
            {/* Apply CSS class from module */}
            <strong>{point.data.x}</strong>
            <br />
            {point.serieId}: {point.data.yFormatted}
          </div>
        )}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            translateX: 100,
            translateY: 60,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
          },
        ]}
      />
    </div>
  );
};

export default EnergyVisualization;
