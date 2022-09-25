from sanic import Sanic, response
import requests
import subprocess
import platform
import psutil
import multiprocessing
import time


initStart = time.time()

#import app as user_src

# We do the model load-to-GPU step on server startup
# so the model object is available globally for reuse
#user_src.init()

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

    model_inputs = {'hello': 'world'}
    #res = requests.get('http://localhost:8000/healthcheck')
    #res = requests.get('http://localhost:8000/healthcheck') #, json = model_inputs)

   # image_byte_string = res.json()["image_base64"]

    end = time.time()
    return response.json({
        "message": "hello world",
        "CpuArchitecture": platform.processor(),
        "MemoryGb": round(psutil.virtual_memory().total / (1024.0 ** 3)),
        "CpuCores": multiprocessing.cpu_count(),
        "InitTime": round(initTime),
        "ExecutionTime": round(end - start),
        "ExecutionCount": executionCount,
    #    "output": res.json(),
    })


if __name__ == '__main__':
    server.run(host='0.0.0.0', port="8000", workers=1)