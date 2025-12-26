import { DeviceReading, InstallationChoice, MonitoringDevice } from '../types';

type Listener = (reading: DeviceReading) => void;

class DeviceService {
  private listenersByPlant: Record<string, Listener[]> = {};
  private intervalsByPlant: Record<string, any> = {};

  async connectDevice(plantId: string, installation: InstallationChoice): Promise<MonitoringDevice> {
    // Mock pairing delay
    await new Promise((r) => setTimeout(r, 800));
    return {
      id: `dev_${plantId}_${Date.now()}`,
      plantId,
      name: 'GrowMe Sensor',
      connected: true,
      installation,
    };
  }

  subscribe(plantId: string, cb: Listener): () => void {
    if (!this.listenersByPlant[plantId]) this.listenersByPlant[plantId] = [];
    this.listenersByPlant[plantId].push(cb);

    if (!this.intervalsByPlant[plantId]) {
      this.intervalsByPlant[plantId] = setInterval(() => {
        const reading: DeviceReading = {
          humidityPercent: 40 + Math.random() * 30,
          lightLux: 200 + Math.random() * 800,
          temperatureCelsius: 18 + Math.random() * 6,
          soilMoisturePercent: 25 + Math.random() * 50,
          timestamp: Date.now(),
        };
        (this.listenersByPlant[plantId] || []).forEach((fn) => fn(reading));
      }, 3000);
    }

    return () => {
      this.listenersByPlant[plantId] = (this.listenersByPlant[plantId] || []).filter((fn) => fn !== cb);
      if (this.listenersByPlant[plantId].length === 0 && this.intervalsByPlant[plantId]) {
        clearInterval(this.intervalsByPlant[plantId]);
        delete this.intervalsByPlant[plantId];
      }
    };
  }
}

export const deviceService = new DeviceService();


