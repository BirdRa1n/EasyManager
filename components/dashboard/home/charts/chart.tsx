import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

import { ApexOptions } from "apexcharts";

interface AreaChartProps {
    options: ApexOptions;
    series: { name: string; data: number[] }[];
}

export function AreaChart({ options, series }: AreaChartProps) {
    return (
        <Chart
            options={options}
            series={series}
            type="area"
            width="100%"
        />
    );
}
