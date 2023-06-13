export class Project {
  name: string;
  datasets: DataSet[] = [];
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

  time: number[] = []; //TimeInSeconds
  timeDisplay: number[] = []; //TimeInSeconds
  frameTimePresent: number[] = []; //MsBetweenPresents
  frameTimeDisplayChange: number[] = []; //MsBetweenDisplayChange

  gpuClock: number[] = []; //GPU#Clk (MHz)
  gpuClockAvg: number;
  gpuMemoryClock: number[] = []; //GPU#MemClock (MHz)
  gpuMemoryClockAvg: number;
  gpuUtilization: number[] = []; //GPU#Util (%)
  gpuUtilizationAvg: number;
  gpuTemperature: number[] = []; //GPU#Temp (C)
  gpuTemperatureAvg: number;
  gpuTemperatureMax: number;
  gpuTemperatureMin: number;
  gpuPower: number[] = []; //PCAT Power Total, GPUOnlyPwr(W) (API), NV Pwr(W) (API), AMDPwr(W) (API)
  gpuPowerAvg: number;
  gpuPowerMax: number;
  gpuPowerMin: number;

  cpuClock: number[] = []; //CPUClk (MHz)
  cpuClockAvg: number;
  cpuUtilization: number[] = []; //CPUUtil (%)
  cpuUtilizationAvg: number;
  cpuTemperature: number[] = []; //CPU Package Temp (C)
  cpuTemperatureAvg: number;
  cpuTemperatureMax: number;
  cpuTemperatureMin: number;
  cpuPower: number[] = []; //CPU Package Power (W)
  cpuPowerAvg: number;
  cpuPowerMax: number;
  cpuPowerMin: number;
  cpuTDP: number[] = []; //CPU TDP (W)
  cpuTDPMax: number;
  cpuTDPMin: number;
  cpuUtilizationPerCore: number[][] = []; //CPUCoreUtil%[##]

  batteryCapacityWattHours: number[] = []; //Current Battery Capacity (Wh)
  batteryPercentRemaining: number[] = []; //Battery Percentage
  batteryDrainRate: number[] = []; //Battery Drain Rate (W)
  batteryDrainRateAvg: number;
  batteryDrainRateMax: number;
  batteryDrainRateMin: number;


  public statisticsComparison(isApi: boolean): number[] {
    let FPS: number[];
    if (isApi) {
      FPS = this.frameTimePresent.map((element: number) => Math.round(1000 / element));
    }
    else {
      FPS = this.frameTimeDisplayChange.map((element: number) => Math.round(1000 / element));
    }

    let avgFPS: number = FPS.reduce((a, b) => a + b, 0) / FPS.length;
    FPS.sort((a: number, b: number) => a - b);
    console.log(FPS);

    let Count: { [key: number]: number } = FPS.reduce((acc: any, item: number) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});

    let pc50 = 0, pc10 = 0, pc1 = 0, pc01 = 0;
    let pc50b = false, pc10b = false, pc1b = false, pc01b = false;
    let FPScount = 0;
    let modeFPS = 0;
    let countModeFPS = 0;
    let counter = FPS.length;
    for (let fps in Count) {
      FPScount += Count[fps];
      if (FPScount / counter >= 0.5 && !pc50b) {
        pc50b = !pc50b;
        pc50 = Number(fps);
      }
      else if (FPScount / counter >= 0.1 && !pc10b) {
        pc10b = !pc10b;
        pc10 = Number(fps);
      }
      else if (FPScount / counter >= 0.01 && !pc1b) {
        pc1b = !pc1b;
        pc1 = Number(fps);
      }
      else if (FPScount / counter >= 0.001 && !pc01b) {
        pc01b = !pc01b;
        pc01 = Number(fps);
      }
    }
    console.log(Count);
    let res: number[] = [];
    res.push(pc50, pc10, pc1, pc01);

    return res;
  }

  public probabilityDensity(isApi: boolean, eps: number = 2): { [key: number]: number } {
    let FPS: number[];
    if (isApi) {
      FPS = this.frameTimePresent.map((element: number) => Number(Math.round(1000 / element).toFixed(eps)));
    }
    else {
      FPS = this.frameTimeDisplayChange.map((element: number) => Number(Math.round(1000 / element).toFixed(eps)));
    }
    // console.log(FPS);
    // console.log(Math.max(...FPS));
    let probability: { [key: number]: number } = FPS.reduce((acc: any, item: number) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});

    //console.log(probability);
    Object.keys(probability).forEach((key) => {
      probability[Number(key)] = probability[Number(key)] * 100 / FPS.length;
    });
    return probability;
  }

  public FPS(isApi: boolean): { [key: number]: number } {
    const FPS: number[] = isApi ? this.frameTimePresent.map((element: number) => Math.round(1000 / element)) : this.frameTimeDisplayChange.map((element: number) => Math.round(1000 / element));

    const result: { [key: number]: number } = {};
    if (isApi) {
      for (let i = 0; i < this.time.length; i++) {
        result[this.time[i]] = FPS[i];
      }
    } else {
      for (let i = 0; i < this.timeDisplay.length; i++) {
        result[this.timeDisplay[i]] = FPS[i];
      }
    }

    return result;
  }


  public frameTime(isApi: boolean) {
    const result: { [key: number]: number } = {};

    if (isApi) {
      for (let i = 0; i < this.time.length; i++) {
        result[this.time[i]] = this.frameTimePresent[i];
      }
    } else {
      for (let i = 0; i < this.timeDisplay.length; i++) {
        result[this.timeDisplay[i]] = this.frameTimeDisplayChange[i];
      }
    }

    return result;
  }
}
