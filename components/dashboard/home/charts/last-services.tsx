"use client";

import { useServices } from "@/contexts/services";
import { Service } from "@/types/services";
import { Spinner } from "@heroui/react";
import { ApexOptions } from "apexcharts";
import { useEffect, useMemo, useState } from "react";
import { AreaChart } from "./chart";

interface LastMonthServicesProps {
  selectedStatus: "pending" | "in_progress" | "completed" | "cancelled";
}

export function LastMonthServices({ selectedStatus }: LastMonthServicesProps) {
  const { services, fetchServices, loading, error } = useServices();
  const [viewMode, setViewMode] = useState<"day" | "month" | "year">("day");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const now = new Date();
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  // Tradução dos status
  const statusTranslations: Record<string, string> = {
    pending: "Pendente",
    in_progress: "Em Andamento",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  // Determine dark mode based on localStorage theme
  const updateDarkMode = () => {
    const theme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    if (theme === "dark") {
      setIsDarkMode(true);
    } else if (theme === "light") {
      setIsDarkMode(false);
    } else {
      // For "system" or unset theme, check document class
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    }
  };

  // Monitor theme changes and system dark mode
  useEffect(() => {
    updateDarkMode();

    // Listen for localStorage changes (e.g., theme toggle)
    const handleStorageChange = () => {
      updateDarkMode();
    };

    // Listen for system dark mode changes when theme is "system" or unset
    const observer = new MutationObserver(() => {
      const theme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
      if (theme === "system" || !theme) {
        updateDarkMode();
      }
    });

    window.addEventListener("storage", handleStorageChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      observer.disconnect();
    };
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((service: Service) => {
      const createdAt = new Date(service.created_at);
      if (viewMode === "year") {
        return createdAt >= oneYearAgo && createdAt <= now && service.status === selectedStatus;
      } else if (viewMode === "month") {
        return createdAt >= oneMonthAgo && createdAt <= now && service.status === selectedStatus;
      }
      return (
        createdAt.getFullYear() === now.getFullYear() &&
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getDate() === now.getDate() &&
        service.status === selectedStatus
      );
    });
  }, [services, viewMode, selectedStatus]);

  const chartData = useMemo(() => {
    const dateLabels: string[] = [];
    let interval: number;
    let formatLabel: (date: Date | string | undefined) => string;

    if (viewMode === "day") {
      // Get unique hours with records
      const hoursWithRecords = Array.from(new Set(
        filteredServices.map((service) => new Date(service.created_at).getHours())
      )).sort((a, b) => a - b);

      // Create labels only for hours with records
      hoursWithRecords.forEach((hour) => {
        const hourStr = String(hour).padStart(2, "0");
        dateLabels.push(`${hourStr}:00`);
      });
      interval = hoursWithRecords.length;
      formatLabel = (value: string | Date | undefined) => (typeof value === "string" ? value : "");
    } else if (viewMode === "month") {
      interval = 12;
      for (let i = 0; i < 12; i++) {
        const date = new Date(oneMonthAgo);
        date.setMonth(date.getMonth() - 5 + i);
        dateLabels.push(date.toISOString().split("T")[0]);
      }
      formatLabel = (date: Date | string | undefined) => {
        if (!date || (typeof date === "string" && !date)) return "";
        const d = typeof date === "string" ? new Date(date) : date;
        return d instanceof Date && !isNaN(d.getTime())
          ? d.toLocaleString("pt-BR", { month: "short" }).replace(/^./, (c) => c.toUpperCase())
          : "";
      };
    } else {
      interval = 12;
      for (let i = 0; i < 12; i++) {
        const date = new Date(oneYearAgo);
        date.setMonth(date.getMonth() + i);
        dateLabels.push(date.toISOString().split("T")[0]);
      }
      formatLabel = (date: Date | string | undefined) => {
        if (!date || (typeof date === "string" && !date)) return "";
        const d = typeof date === "string" ? new Date(date) : date;
        return d instanceof Date && !isNaN(d.getTime())
          ? d.toLocaleString("pt-BR", { month: "short" }).replace(/^./, (c) => c.toUpperCase())
          : "";
      };
    }

    const counts = new Array(interval).fill(0);

    dateLabels.forEach((label, i) => {
      let samePeriodServices: Service[] = [];

      if (viewMode === "day") {
        const hour = parseInt(label.split(":")[0], 10);
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

      counts[i] = samePeriodServices.length; // Contagem de serviços
    });

    const series = [{
      name: statusTranslations[selectedStatus] || selectedStatus,
      data: counts,
    }];

    const options: ApexOptions = {
      chart: {
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: true },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      xaxis: {
        type: "category",
        categories: dateLabels,
        labels: {
          formatter: (value: string) => {
            if (viewMode === "day") {
              return value || "";
            }
            return formatLabel(value);
          },
          style: {
            colors: isDarkMode ? "#d1d5db" : "#64748b",
            fontSize: "10px",
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (value: number) => {
            return typeof value === "number" && !isNaN(value) ? Math.floor(value).toString() : "0";
          },
          style: {
            colors: isDarkMode ? "#d1d5db" : "#64748b",
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value: number) => {
            return typeof value === "number" && !isNaN(value) ? `${Math.floor(value)} serviços` : "0 serviços";
          },
        },
        x: {
          formatter: (value: any) => {
            if (viewMode === "day") {
              return `${value || ""} - ${now.toLocaleDateString("pt-BR")}`;
            }
            return formatLabel(value) || value || "";
          },
        },
        theme: isDarkMode ? "dark" : "light",
      },
      grid: {
        borderColor: isDarkMode ? "#27272A" : "#e2e8f0",
        strokeDashArray: 4,
      },
      colors: isDarkMode ? ["#3b82f6"] : ["#016FEE"],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100],
        },
      },
      legend: {
        show: false, // Desativa a legenda
      },
    };

    return { options, series };
  }, [filteredServices, viewMode, isDarkMode, selectedStatus]);

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
    <>
      <div className="ml-4 mt-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Serviços {statusTranslations[selectedStatus] || selectedStatus}{" "}
          {viewMode === "day" ? "Hoje" : viewMode === "month" ? "no Último Mês" : "no Último Ano"}
        </h2>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as "day" | "month" | "year")}
          className="mr-4 p-2 rounded-md"
        >
          <option value="day">Dia</option>
          <option value="month">Mês</option>
          <option value="year">Ano</option>
        </select>
      </div>
      <div>
        {loading && (
          <div className="flex justify-center items-center w-full">
            <Spinner size="sm" color="primary" />
          </div>
        )}
        {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
        {!loading && !error && filteredServices.length === 0 && (
          <div className="flex mt-10 mb-10 justify-center items-center w-full">
            <p>Nenhum serviço encontrado</p>
          </div>
        )}
        {filteredServices.length > 0 && (
          <div>
            <AreaChart options={chartData.options} series={chartData.series} />
          </div>
        )}
      </div>
    </>
  );
}