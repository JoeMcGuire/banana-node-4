from sanic import Sanic, response
import requests
import subprocess
import platform
import psutil
import multiprocessing
import time

initStart = time.time()

import app as user_src

# dependency free way to check if GPU is visible
gpu = False
out = subprocess.run("nvidia-smi", shell=True)
if out.returncode == 0: # success state on shell command
    gpu = True

# Create the http server app
server = Sanic("sd_server")

# Init
@server.route('/init', methods=["GET"])
def init(request):
    # We do the model load-to-GPU step on server startup
    # so the model object is available globally for reuse
    if gpu == True:
        user_src.init()
    return response.json({"status": "success"})


# Inference POST handler at '/' is called for every http call from Banana
@server.route('/', methods=["POST"]) 
def inference(request):
    if gpu == False:
        failResponse = { "message": "no gpu available" }
        return response.json(failResponse)

    try:
        model_inputs = response.json.loads(request.json)
    except:
        model_inputs = request.json

    output = user_src.inference(model_inputs)

    return response.json(output)


if __name__ == '__main__':
    server.run(host='0.0.0.0', port="8003", workers=1)
