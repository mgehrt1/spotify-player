import React, { useState } from "react";
import { useMessageSubscription } from "./MessageListener";

interface vscode {
    postMessage(message: any): void;
}
declare const vscode: vscode;

const Devices = ({ setSelectedDevice }) => {
    const [devices, setDevices] = useState([]);

    useMessageSubscription((message) => {
        if (message.command === "devices") {
            setDevices(message.devices);
        }
    });

    return (
        devices.length > 0 &&
        devices.map((device) => (
            <button onClick={() => setSelectedDevice(device.id)} key={device.id}>
                {device.name}
            </button>
        ))
    );
};

export default Devices;
