export class Project {
  name: string;
  datasets: DataSet[];
}

export class DataSet {
  constructor() {

  }
  name: string;
  displayName: string;
  isDisplayed: boolean;

  applicationName: string; //Application
  runtime: string; //Runtime
  resolution: string; //Resolution

  gpuName: string; //GPU
  cpuName: string; //CPU

  time: number[]; //TimeInSeconds
  frameTimePresent: number[]; //MsBetweenPresents
  frameTimeDisplayChange: number[]; //MsBetweenDisplayChange

  gpuClock: number[]; //GPU#Clk (MHz)
  gpuClockAvg: number;
  gpuMemoryClock: number[]; //GPU#MemClock (MHz)
  gpuMemoryClockAvg: number;
  gpuUtilization: number[]; //GPU#Util (%)
  gpuUtilizationAvg: number;
  gpuTemperature: number[]; //GPU#Temp (C)
  gpuTemperatureAvg: number;
  gpuTemperatureMax: number;
  gpuTemperatureMin: number;
  gpuPower: number[]; //PCAT Power Total, GPUOnlyPwr(W) (API), NV Pwr(W) (API), AMDPwr(W) (API)
  gpuPowerAvg: number;
  gpuPowerMax: number;
  gpuPowerMin: number;

  cpuClock: number[]; //CPUClk (MHz)
  cpuClockAvg: number;
  cpuUtilization: number[]; //CPUUtil (%)
  cpuUtilizationAvg: number;
  cpuTemperature: number[]; //CPU Package Temp (C)
  cpuTemperatureAvg: number;
  cpuTemperatureMax: number;
  cpuTemperatureMin: number;
  cpuPower: number[]; //CPU Package Power (W)
  cpuPowerAvg: number;
  cpuPowerMax: number;
  cpuPowerMin: number;
  cpuTDP: number[]; //CPU TDP (W)
  cpuTDPMax: number;
  cpuTDPMin: number;
  cpuUtilizationPerCore: number[][]; //CPUCoreUtil%[##]

  batteryCapacityWattHours: number[]; //Current Battery Capacity (Wh)
  batteryPercentRemaining: number[]; //Battery Percentage
  batteryDrainRate: number[]; //Battery Drain Rate (W)
  batteryDrainRateAvg: number;
  batteryDrainRateMax: number;
  batteryDrainRateMin: number;
}
