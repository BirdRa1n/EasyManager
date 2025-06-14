import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

import { ApexOptions } from "apexcharts";

interface AreaChartProps {
    options: ApexOptions;
    series: { name: string; data: number[] }[];
}

export function AreaChart({ options, series }: AreaChartProps) {
    return (
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <Chart
                options={options}
                series={series}
                type="area"
                height={350}
                width="100%"
            />
        </div>
    );
}
