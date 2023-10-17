const express = require('express');
const { exec } = require('child_process');
const fs = require("fs-extra");

const app = express();
const port = 3000; // You can change this to the desired port

app.use(express.json());

let forkProcess;

// Function to start Hardhat fork
function startHardhatFork() {
    return new Promise((resolve, reject) => {
      const forkProcess = exec('npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/jqgmhlIy4fIg1SrqLptgOsCba0sf-40B');
  
      forkProcess.stdout.on('data', (data) => {
        console.log("Forking: ",data);
        // resolve("Successfully started node");
        if (data.includes('Started HTTP')) {
          console.log('Hardhat fork has successfully started');
          resolve();
        }
      });
  
      forkProcess.on('error', (error) => {
        reject(error);
      });
    });
}

// Function to gracefully shut down the fork process
function shutdownForkProcess() {
    if (forkProcess) {
      forkProcess.kill('SIGINT'); // Send a signal to gracefully shut down the fork
    }
  }
function executeSimulation() {
    return new Promise((resolve, reject) => {
      const scriptProcess = exec('npx hardhat run ./scripts/simulateTx.js');
      let simdata = "NULL";
      
      scriptProcess.stdout.on('data', (data) => {
        console.log('Script Output:', data);
        simdata = data;
      });
  
      scriptProcess.on('error', (error) => {
        reject(error);
      });
  
      scriptProcess.on('exit', (code) => {
        if (code === 0) {
            console.log("Simulation successfull");
            resolve("Exitted");
        } else {
          reject(new Error(`Script exited with code ${code}`));
        }
      });
    });
  }
  

app.get('/simulate', async (req, res) => {

    const data = req.body;
    console.log("Data received: ",data);
    //Write argument
    await fs.writeJSON('./scripts/transaction.json',data);
    try{

        await startHardhatFork();
        await executeSimulation();

        //Read the simulated result
        const simdata = await fs.readJson("./scripts/ERC20change.json");
        console.log("Simulated data: ",simdata);    
        res.status(200).json({data: simdata});
        
        //Kill the fork
        shutdownForkProcess();

    }catch(err){
        console.log("Error occured: ",err);
        res.status(500).json({data:"Error occured"});
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
