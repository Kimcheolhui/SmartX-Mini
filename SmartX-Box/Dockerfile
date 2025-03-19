FROM ubuntu:20.04

WORKDIR /SmartX-Mini

RUN apt-get update && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

COPY . /SmartX-Mini

CMD ["/bin/bash"]
