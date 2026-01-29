# Blink Terminal

## Introduction
Blink Terminal is a simple Node.JS web application that allows users to interact with a terminal using the application's backend.


## Running

### Local machine
To run the application locally, use npm:

```bash
npm install
node server.js
```

### Kubernetes
To run the application in Kubernetes, use the manifest in this repo:

```bash
kubectl create namespace blink
kubectl apply -n blink -f ./deploy/blink-terminal.yaml