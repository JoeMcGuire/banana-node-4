# Must use a Cuda version 11+
FROM pytorch/pytorch:1.11.0-cuda11.3-cudnn8-runtime

WORKDIR /

# Install git
RUN apt-get update && apt-get install -y git

# Install python packages
RUN pip3 install --upgrade pip
ADD requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

# Install node
RUN apt-get install -y nodejs
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs
COPY ./node_modules ./node_modules

# We add the banana boilerplate here
ADD server.py .
EXPOSE 8000
ADD server.mjs .
EXPOSE 8001


# Add your huggingface auth key here
ENV HF_AUTH_TOKEN=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

# Add your model weight files
# (in this case we have a python script)
ADD download.py .
RUN python3 download.py

# Add your custom app code, init() and inference()
ADD app.py .

#CMD python3 -u server.py

CMD node server.mjs & python3 -u server.py
