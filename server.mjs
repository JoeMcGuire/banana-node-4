import express, { json } from 'express';
import util from 'util';
import { exec, spawnSync } from 'child_process';
const execPromise = util.promisify(exec);

const app = express();
const server = "node/express";
const version = "try catch";
app.use(json())

const PORT = 8001;

app.post('/', async (req, res) => {
    process.on('uncaughtException', function(err) {
        res.json({
            err,
        });
    });
    try {
        const child = await spawnSync(req.body.command, req.body.arguments);
        res.json({
            server,
            version,
            body: req.body,
            stdout: child.stdout.toString().split('\n'),
            stderr: child.stderr.toString().split('\n'),
        })
    }
    catch(e) {
        res.json({
            server,
            version,
            body: req.body,
            error: e,
        });
    }

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
