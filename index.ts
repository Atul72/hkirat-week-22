import express from "express";
import cluster from "cluster";
import os from "os";

const numCPUs = os.cpus().length;

const PORT = 3000;

if (cluster.isPrimary) {
  console.log(`Number of CPUs is ${numCPUs}`);
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    console.log(`Forking worker ${i}`);

    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("lets start another worker");
    cluster.fork();
  });
} else {
  const app = express();
  app.get("/", (req, res) => {
    res.send(`Hello from worker ${process.pid}`);
  });

  app.get("/api/:n", (req, res) => {
    let n = parseInt(req.params.n);
    let count = 0;
    if (n > 500000000) n = 500000000;
    for (let i = 0; i < n; i++) {
      count++;
    }
    res.send(`Final count is ${count} and the worker is ${process.pid}`);
  });

  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started`);
  });
}
