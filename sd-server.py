from sanic import Sanic, response
import requests
import subprocess
import platform
import psutil
import multiprocessing
import time

initStart = time.time()

# Create the http server app
server = Sanic("sd_server")


import app as user_src

# We do the model load-to-GPU step on server startup
# so the model object is available globally for reuse
user_src.init()


# Inference POST handler at '/' is called for every http call from Banana
@server.route('/', methods=["POST"]) 
def inference(request):
    try:
        model_inputs = response.json.loads(request.json)
    except:
        model_inputs = request.json

    output = user_src.inference(model_inputs)

    return response.json(output)


if __name__ == '__main__':
    server.run(host='0.0.0.0', port="8003", workers=1)
