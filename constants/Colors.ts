import { useState } from 'react';

type PrimaryColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

const validColors: PrimaryColor[] = ["default", "primary", "secondary", "success", "warning", "danger"];

const usePrimaryColor = (): PrimaryColor => {
    const [color, setColor] = useState<PrimaryColor>("primary");
    return color;
};

export default usePrimaryColor;
