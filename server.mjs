import express, { json } from 'express';
import util from 'util';
import { exec } from 'child_process';
const execPromise = util.promisify(exec);

const app = express();

app.use(json())

const PORT = 8000;

app.post('*', async (req, res) => {
    // Do nothing to start
    res.json({ status: true, message: "Our node.js app works" })
    // Recieve the credentials

    // Configure the logger

    // Log something

});

app.get('/healthcheck', async (req, res) => {
/*    let gpu = false;
    try {
	const { stdout } = await execPromise('nvidia-smi');
        if (stdout) {
    	  gpu = true;
        }
    }
    catch {
        // no gpu.
    }
*/
    res.json({ state: "healthy", gpu: true })
});

app.listen(PORT, '0.0.0.0', () => console.log(`App listening at port ${PORT}`));
