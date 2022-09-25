import express, { json } from 'express';
import util from 'util';
import { exec, spawnSync } from 'child_process';
const execPromise = util.promisify(exec);

const app = express();

app.use(json())

const PORT = 8001;

app.post('/', async (req, res) => {
console.log(req.body)
    const child = await spawnSync(req.body.command, req.body.arguments);

    res.json({
        server: "node/express",
        version: "post proxy",
        status: true,
        message: "Our node.js app works",
        body: req.body,
        stdout: child.stdout.toString().split('\n'),
        stderr: child.stderr.toString().split('\n'),
    })
 

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
