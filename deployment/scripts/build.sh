#!/bin/bash
set -e

REGISTRY=nithi1230
TAG=${1:-latest}

echo "Building frontend..."
docker build -t $REGISTRY/frontend:$TAG ./project

echo "Building index microservice..."
docker build -t $REGISTRY/index:$TAG "./Microservice Backend/Login"

echo "Building server microservice..."
docker build -t $REGISTRY/server:$TAG "./Microservice Backend/Server"