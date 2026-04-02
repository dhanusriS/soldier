export function getStatus(heartRate, temperature, motion, connected = true) {
    if (!connected || motion === "No Movement" || heartRate < 60 || heartRate > 110 || temperature > 37.5) {
        return "CRITICAL";
    }
    if (heartRate > 100 || heartRate < 65 || temperature > 37 || temperature < 35) {
        return "WARNING";
    }
    return "SAFE";
}
