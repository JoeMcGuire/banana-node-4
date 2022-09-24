const { spawn } = require('child_process');
const winston = require('winston');
//const loggers = require('@goodware/log');
const WinstonCloudWatch = require('winston-cloudwatch');
const cloudwatchConfig = {
    logGroupName: "test",
    logStreamName: "test-test",
  //  awsAccessKeyId: process.env.CLOUDWATCH_ACCESS_KEY,
  //  awsSecretKey: process.env.CLOUDWATCH_SECRET_ACCESS_KEY,
  //  awsRegion: process.env.CLOUDWATCH_REGION,
  //  messageFormatter: ({ level, message, additionalInfo }) =>    `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(additionalInfo)}}`
}
const cwTransport = new WinstonCloudWatch(cloudwatchConfig);

 //   logger.add(new WinstonCloudWatch(cloudwatchConfig))
const logger = winston.createLogger({
   // format: winston.format.json(),
    transports: [
        cwTransport,
        new (winston.transports.Console)({
            timestamp: true,
            colorize: true,
        })
   ]
});

logger.on('error', function (err) {
  console.log('Something went wrong with winston', err);
});


logger.info('CHILL WINSTON 2!', { seriously: true });

logger.on('finish', async (info) => {
  // All `info` log messages has now been logged
  console.log('Winston is finished, safe to exit');
  await cwTransport.kthxbye(function() {
    console.log('logs flushed');
    process.exit();
    console.log('bye');
  });

});


module.exports = logger;

const child = spawn('pwd');
child.stdout.on('data', (data) => {
  logger.log('info', `child stdout:\n${data}`);
  console.log('data logged');
});

child.stderr.on('data', (data) => {
  logger.log('error', `child stderr:\n${data}`);
});

child.on('exit', async (code) => {
  logger.info(`child process exited with code ${code}`);
  logger.end();
});
        logger.log('info', "hello world");



