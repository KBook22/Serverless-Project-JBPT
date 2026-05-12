//initial Jenkinsfile for Serverless-Project-JBPT
pipeline {
  agent any

  environment {
    TAG         = "${BUILD_NUMBER}"
    NODE_IP     = "192.168.100.x"
    BACKEND_URL = "http://${NODE_IP}:30081"
    DOCKERHUB_USER = "your-dockerhub-username"
  }

  triggers {
    pollSCM('H/5 * * * *')   // poll ทุก 5 นาที ถ้า main เปลี่ยนก็ build
  }

  stages {

    stage('Build Images') {
      steps {
        sh """
          docker build -f app/backend/Dockerfile \
            -t ${DOCKERHUB_USER}/jbpt-backend:${TAG} \
            -t ${DOCKERHUB_USER}/jbpt-backend:latest .

          docker build -f app/frontend/Dockerfile \
            --build-arg VITE_API_URL=${BACKEND_URL} \
            -t ${DOCKERHUB_USER}/jbpt-frontend:${TAG} \
            -t ${DOCKERHUB_USER}/jbpt-frontend:latest .
        """
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-credentials',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh """
            echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin

            docker push ${DOCKERHUB_USER}/jbpt-backend:${TAG}
            docker push ${DOCKERHUB_USER}/jbpt-backend:latest
            docker push ${DOCKERHUB_USER}/jbpt-frontend:${TAG}
            docker push ${DOCKERHUB_USER}/jbpt-frontend:latest
          """
        }
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

          kubectl set image deployment/backend \
            backend=${DOCKERHUB_USER}/jbpt-backend:${TAG}
          kubectl set image deployment/frontend \
            frontend=${DOCKERHUB_USER}/jbpt-frontend:${TAG}

          kubectl apply -f k8s/app/backend-service.yaml
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

  post {
    always {
      sh "docker logout"
    }
  }
}