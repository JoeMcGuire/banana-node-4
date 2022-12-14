from sanic import Sanic, response
import requests
import subprocess
import platform
import psutil
import multiprocessing
import time
from requests.adapters import HTTPAdapter, Retry

initStart = time.time()

retryRequest = requests.Session()
retries = Retry(connect=25,
                backoff_factor=0.2)
retryRequest.mount('http://', HTTPAdapter(max_retries=retries))
init1 = retryRequest.get('http://localhost:8001/init')
init2 = retryRequest.get('http://localhost:8003/init')

# Create the http server app
server = Sanic("my_app")
initTime = time.time() - initStart
executionCount = 0

# Healthchecks verify that the environment is correct on Banana Serverless
@server.route('/healthcheck', methods=["GET"])
def healthcheck(request):
    # dependency free way to check if GPU is visible
    gpu = False
    out = subprocess.run("nvidia-smi", shell=True)
    if out.returncode == 0: # success state on shell command
        gpu = True

    return response.json({"state": "healthy", "gpu": gpu})

# Inference POST handler at '/' is called for every http call from Banana
@server.route('/', methods=["POST", "GET"]) 
def inference(request):
    global executionCount;
    executionCount += 1;
    start = time.time()
    try:
        payload = response.json.loads(request.json)
    except:
        payload = request.json

    command = payload.get('command', None)
    prompt = payload.get('prompt', None)
    if ((command == None) and (prompt == None)):
        return response.json({'message': "No command provided"})

    try:
        res = requests.post('http://localhost:8001/', json = payload, timeout=120)
        #res = requests.get('http://localhost:8001/healthcheck') #, json = model_inputs)
    except requests.exceptions.RequestException as e:  # This is the correct syntax
        return response.json({
            "error": "something went wrong with proxy",
            "e": e,
        })
        raise SystemExit(e)

    end = time.time()
    return response.json({
        "server": "python/sanic",
        "version": "Cloudwatch logging",
        "CpuArchitecture": platform.processor(),
        "MemoryGb": round(psutil.virtual_memory().total / (1024.0 ** 3)),
        "CpuCores": multiprocessing.cpu_count(),
        "InitTime": initTime,
        "ExecutionTime": end - start,
        "ExecutionCount": executionCount,
        "output": res.json(),
    })


if __name__ == '__main__':
    server.run(host='0.0.0.0', port="8000", workers=1)
