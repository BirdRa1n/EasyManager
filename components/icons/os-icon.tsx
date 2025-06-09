import { useEffect, useState } from "react";

//icons
import { FaApple } from "react-icons/fa";
import { FaWindows } from "react-icons/fa";
import { FaLinux } from "react-icons/fa";

const OSIcon = () => {
    const [os, setOS] = useState<string>("");

    useEffect(() => {
        window.ipc.on('os', (os: any) => {
            console.log("os", os);
            setOS(os?.platform);
        });

        window.ipc.send('get-os', {});
    }, []);

    switch (os) {
        case "darwin":
            return <FaApple />;
        case "win32":
            return <FaWindows />;

        case "win64":
            return <FaWindows />;
        case "linux":
            return <FaLinux />;
        case "linux64":
            return <FaLinux />;
        case "linux32":
            return <FaLinux />;
        case "linuxarm":
            return <FaLinux />;
        case "linuxarm64":
            return <FaLinux />;
        case "linuxx64":
            return <FaLinux />;
        case "linuxx32":
            return <FaLinux />;
        case "linuxx86":
            return <FaLinux />;
        case "linuxx86_64":
            return <FaLinux />;
        case "linuxx86_32":
            return <FaLinux />;
        case "linuxx86_64":
            return <FaLinux />;
        case "linuxx86_32":
            return <FaLinux />;
        case "linuxx86_64":
            return <FaLinux />;
        default:
            return <FaWindows />;
    }
}

export default OSIcon;