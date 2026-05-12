# install docker in jenkins & install kubectl in jenkins
FROM jenkins/jenkins:2.554-jdk21
USER root

# ติดตั้ง docker
RUN apt-get update && apt-get install -y docker.io

# ติดตั้ง kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && chmod +x kubectl \
    && mv kubectl /usr/local/bin/

USER root