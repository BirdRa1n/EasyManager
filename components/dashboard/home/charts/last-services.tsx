"use client";

import { useServices } from "@/contexts/services";
import { Service } from "@/types/services";
import { Spinner } from "@heroui/react";
import { ApexOptions } from "apexcharts";
import { useEffect, useMemo, useState } from "react";
import { AreaChart } from "./chart";

export function LastMonthServices() {
  const { services, fetchServices, loading, error } = useServices();
  const [viewMode, setViewMode] = useState<"day" | "month" | "year">("day");

  const now = new Date("2025-06-14T12:47:00-03:00");
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const filteredServices = useMemo(() => {
    return services.filter((service: Service) => {
      const createdAt = new Date(service.created_at);
      if (viewMode === "year") {
        return createdAt >= oneYearAgo && createdAt <= now;
      } else if (viewMode === "month") {
        return createdAt >= oneMonthAgo && createdAt <= now;
      }
      // For day view, filter services for the current day (June 14, 2025)
      return (
        createdAt.getFullYear() === now.getFullYear() &&
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getDate() === now.getDate()
      );
    });
  }, [services, viewMode]);

  const chartData = useMemo(() => {
    const dateLabels: string[] = [];
    let interval: number;
    let formatLabel: (date: Date | string) => string;

    if (viewMode === "day") {
      interval = 24;
      // Create labels for each hour of the day
      for (let i = 0; i < 24; i++) {
        const hour = String(i).padStart(2, "0");
        dateLabels.push(`${hour}:00`);
      }
      formatLabel = (value: string | Date) => typeof value === "string" ? value : ""; // Use the hour label directly (e.g., "00:00")
    } else if (viewMode === "month") {
      interval = 12;
      for (let i = 0; i < 12; i++) {
        const date = new Date(oneMonthAgo);
        date.setMonth(date.getMonth() - 5 + i);
        dateLabels.push(date.toISOString().split("T")[0]);
      }
      formatLabel = (date: Date | string) => {
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleString("pt-BR", { month: "short" }).replace(/^./, (c) => c.toUpperCase());
      };
    } else {
      interval = 12;
      for (let i = 0; i < 12; i++) {
        const date = new Date(oneYearAgo);
        date.setMonth(date.getMonth() + i);
        dateLabels.push(date.toISOString().split("T")[0]);
      }
      formatLabel = (date: string | Date) => {
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleString("pt-BR", { month: "short" }).replace(/^./, (c) => c.toUpperCase());
      };
    }

    const statusMap: Record<string, number[]> = {};

    dateLabels.forEach((label, i) => {
      let samePeriodServices: Service[] = [];

      if (viewMode === "day") {
        // Group services by hour for the current day
        const hour = i;
        samePeriodServices = filteredServices.filter((service) => {
          const createdAt = new Date(service.created_at);
          return createdAt.getHours() === hour;
        });
      } else {
        const currentDate = new Date(label);
        samePeriodServices = filteredServices.filter((service) => {
          const createdAt = new Date(service.created_at);
          if (viewMode === "year") {
            return (
              createdAt.getFullYear() === currentDate.getFullYear() &&
              createdAt.getMonth() === currentDate.getMonth()
            );
          }
          return (
            createdAt.getFullYear() === currentDate.getFullYear() &&
            createdAt.getMonth() === currentDate.getMonth()
          );
        });
      }

      samePeriodServices.forEach((s) => {
        if (!statusMap[s.status]) {
          statusMap[s.status] = new Array(interval).fill(0);
        }
        statusMap[s.status][i] += 1;
      });
    });

    const series = Object.entries(statusMap).map(([status, data]) => ({
      name: status,
      data,
    }));

    const options: ApexOptions = {
      chart: {
        type: "area",
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      xaxis: {
        type: "category",
        categories: dateLabels,
        labels: {
          formatter: (value: string) => {
            if (viewMode === "day") {
              return value; // e.g., "00:00"
            }
            return formatLabel(value);
          },
          style: {
            colors: "#64748b",
            fontSize: "11px",
          },
        },
      },
      tooltip: {
        x: {
          formatter: (value: any) => {
            if (viewMode === "day") {
              return `${value} - ${now.toLocaleDateString("pt-BR")}`;
            }
            return viewMode === "month" || viewMode === "year"
              ? new Date(value).toLocaleString("pt-BR", { month: "short", year: "numeric" })
              : new Date(value).toLocaleDateString("pt-BR");
          },
        },
      },
      grid: {
        borderColor: "#e2e8f0",
        strokeDashArray: 4,
      },
      colors: ["#016FEE", "#085ac5", "#0e4e9a", "#0e305d"],
    };

    return { options, series };
  }, [filteredServices, viewMode]);

  const formatShortDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="ml-4 mt-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Serviços {viewMode === "day" ? "Hoje" : viewMode === "month" ? "no Último Mês" : "no Último Ano"}
        </h2>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as "day" | "month" | "year")}
          className="mr-4 p-2 border rounded-md text-gray-700"
        >
          <option value="day">Dia</option>
          <option value="month">Mês</option>
          <option value="year">Ano</option>
        </select>
      </div>
      <div>
        {loading && <div className="flex justify-center items-center w-full"><Spinner size="sm" color="primary" /></div>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && filteredServices.length === 0 && (
          <div className="flex mt-10 mb-10 justify-center items-center w-full"><Spinner size="sm" color="primary" /></div>
        )}
        {filteredServices.length > 0 && (
          <div className="mt-6">
            <AreaChart options={chartData.options} series={chartData.series} />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500">
          Mostrando {filteredServices.length} serviços{" "}
          {viewMode === "day"
            ? `em ${formatShortDate(now)}`
            : `de ${formatShortDate(viewMode === "year" ? oneYearAgo : oneMonthAgo)} a ${formatShortDate(now)}`}
        </p>
      </div>
    </div>
  );
}