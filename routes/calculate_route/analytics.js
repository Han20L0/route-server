const os = require("os");

//Create function to get CPU information
function cpuAverage() {
  //Initialise sum of idle and time of cores and fetch CPU info
  var totalIdle = 0,
    totalTick = 0;
  var cpus = os.cpus();

  //Loop through CPU cores
  for (var i = 0, len = cpus.length; i < len; i++) {
    //Select CPU core
    var cpu = cpus[i];

    //Total up the time in the cores tick
    for (type in cpu.times) {
      totalTick += cpu.times[type];
    }

    //Total up the idle time of the core
    totalIdle += cpu.times.idle;
  }

  //Return the average Idle and Tick times
  return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}

class Analyzer {
  constructor() {
    this.connectorCount = 0;
    this.intersectionCount = 0;
    this.iterationCount = 0;

    this.__initalCpuUsage = this.initialMemoryUsage = 0;
    this.__cpuInterval = 0;

    this.__cpuPercentages = [];
    this.__memoryUsage = [];

    this.__timeStart = 0;
    this.__queryTime = 0;
    this.__timeEnd = 0;

    this.startAnalyze();
  }

  __startAnalyzeCpu() {
    this.__initalCpuUsage = cpuAverage();

    //Set delay for second Measure
    this.__cpuInterval = setInterval(() => {
      //Grab second Measure
      var currentCpuUsage = cpuAverage();

      //Calculate the difference in idle and total time between the measures
      var idleDifference = currentCpuUsage.idle - this.__initalCpuUsage.idle;
      var totalDifference = currentCpuUsage.total - this.__initalCpuUsage.total;

      //Calculate the average percentage CPU usage
      var percentageCPU = 100 - ~~((100 * idleDifference) / totalDifference);
      this.__cpuPercentages.push(percentageCPU);
    }, 100);
  }

  __endAnalyzeCpu() {
    clearInterval(this.__cpuInterval);
  }

  startAnalyze() {
    this.__timeStart = performance.now();
    this.__startAnalyzeCpu();
  }

  markQuery() {
    this.__queryTime = performance.now();
  }

  endAnalyze() {
    this.__timeEnd = performance.now();
    this.__endAnalyzeCpu();
  }

  markMemory() {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    this.__memoryUsage.push(used);
  }

  createReport() {
    let responseTime = this.__timeEnd - this.__timeStart;
    let queryTime = this.__queryTime - this.__timeStart;

    if (responseTime <= 0) responseTime = 0;
    if (queryTime <= 0) queryTime = 0;

    return {
      connectorCount: this.connectorCount,
      intersectionCount: this.intersectionCount,
      iterationCount: this.iterationCount,
      responseTime: responseTime,
      queryTime: queryTime,
      avgCpu: this.__cpuPercentages.reduce((acc, cpu) => acc + cpu, 0) / this.__cpuPercentages.length,
      memory: Math.max(...this.__memoryUsage),
    };
  }
}

module.exports = Analyzer;
