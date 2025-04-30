#!/bin/bash
set -e

REGISTRY=nithi1230
TAG=${1:-latest}

echo "Pushing images to Docker registry..."
docker push $REGISTRY/frontend:$TAG
docker push $REGISTRY/index:$TAG
docker push $REGISTRY/server:$TAG

echo "Deploying frontend with Helm..."
helm upgrade --install frontend deployment/helm/frontend --set image.repository=$REGISTRY/frontend --set image.tag=$TAG

echo "Deploying index microservice with Helm..."
helm upgrade --install index deployment/helm/index --set image.repository=$REGISTRY/index --set image.tag=$TAG

echo "Deploying server microservice with Helm..."
helm upgrade --install server deployment/helm/server --set image.repository=$REGISTRY/server --set image.tag=$TAG