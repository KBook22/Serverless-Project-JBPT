//initial Jenkinsfile for Serverless-Project-JBPT
pipeline {
  agent any

  environment {
    TAG         = "${BUILD_NUMBER}"
    NODE_IP     = "192.168.100.x"
    BACKEND_URL = "http://${NODE_IP}:30081"
  }

  stages {

    stage('Build Images') {
      steps {
        sh "docker build -f app/backend/Dockerfile -t backend:${TAG} ."
        sh "docker build -f app/frontend/Dockerfile --build-arg VITE_API_URL=${BACKEND_URL} -t frontend:${TAG} ."
      }
    }

    stage('Deploy to K8s') {
      steps {
        sh """
          kubectl apply -f k8s/app/postgres-secret.yaml
          kubectl apply -f k8s/app/postgres-pv.yaml
          kubectl apply -f k8s/app/postgres-pvc.yaml
          kubectl apply -f k8s/app/postgres-deployment.yaml
          kubectl apply -f k8s/app/postgres-service.yaml

          sed -i 's|backend:latest|backend:${TAG}|g'   k8s/app/backend-deployment.yaml
          sed -i 's|frontend:latest|frontend:${TAG}|g' k8s/app/frontend-deployment.yaml

          kubectl apply -f k8s/app/backend-deployment.yaml
          kubectl apply -f k8s/app/backend-service.yaml
          kubectl apply -f k8s/app/frontend-deployment.yaml
          kubectl apply -f k8s/app/frontend-service.yaml
        """
      }
    }

    stage('Verify') {
      steps {
        sh "kubectl rollout status deployment/postgres"
        sh "kubectl rollout status deployment/backend"
        sh "kubectl rollout status deployment/frontend"
      }
    }

  }
}