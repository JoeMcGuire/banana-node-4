import express, { json } from 'express';
import util from 'util';
import { exec, spawnSync } from 'child_process';
import fetch from 'node-fetch';
import WinstonCloudWatch from 'winston-cloudwatch';
import winston from 'winston';
import dateFormat from 'dateformat';
import { randomUUID } from 'crypto';
const execPromise = util.promisify(exec);
const workerId = randomUUID();
const region = "eu-west-1";

const logger = winston.createLogger({
    // format: winston.format.json(),
     transports: [
         new (winston.transports.Console)({
             timestamp: true,
             colorize: true,
         })
    ]
});
logger.info('Worker launched', workerId );

const app = express();
const server = "node/express";
const version = "node server first";
app.use(json())

const PORT = 8001;

const setupLoggerCloudWatch = (accessKeyId, secretAccessKey) => {
    if (logger.transports.length === 1) {
        const cloudwatchConfig = {
            logGroupName: "/banana-dev",
            logStreamName: `${dateFormat(new Date(), "yyyy/mm/dd")}/${workerId}`,
            awsOptions: {
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
                region,
            }
        }
        const cwTransport = new WinstonCloudWatch(cloudwatchConfig);
        logger.add(cwTransport);
        logger.info('CloudWatch log configured');
    }
}

app.post('/', async (req, res) => {
    process.on('uncaughtException', function(err) {
        res.json({
            err,
        });
    });
    try {
        setupLoggerCloudWatch(req.body.key, req.body.secret);
        logger.info('action', req)
        if (req.body.command) {
            const child = await spawnSync(req.body.command, req.body.arguments);
            return res.json({
                server,
                version,
                body: req.body,
                stdout: child.stdout.toString().split('\n'),
                stderr: child.stderr.toString().split('\n'),
            })
        }
        else if (req.body.prompt) {
            const response = await fetch("http://localhost:8003", {
                method: 'POST',
                body: JSON.stringify(req.body),
            });

            return res.json({
                server,
                version,
                body: req.body,
                out: await response.json(),
            })
        }
        else {
            return res.json({
                server,
                version,
                body: req.body,
            })
        }
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
    logger.info('Init called');
    res.json({ state: "healthy", gpu: true })
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
    
});

app.get('/init', async (req, res) => {
    logger.info('Init called');
    return res.json({
        "init": "complete"
    })
});

app.listen(PORT, '0.0.0.0', () => console.log(`App listening at port ${PORT}`));
