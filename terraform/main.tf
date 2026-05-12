terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.31.0"
    }
  }
}

# ชี้ไปที่ไฟล์ config ที่ Ansible สร้างไว้ให้ที่เครื่อง Master (node1)
provider "kubernetes" {
  config_path = "~/.kube/config"
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

# 1. สร้าง Deployment (ตัวสั่งรัน Pod)
resource "kubernetes_deployment" "grafana" {
  metadata {
    name = "grafana"
    labels = { app = "grafana" }
    namespace = "monitoring"
  }

  spec {
    replicas = 1 # สั่งรัน 1 ตัว (K8s จะเลือกเครื่องที่ว่างที่สุดให้เอง)
    selector {
      match_labels = { app = "grafana" }
    }
    template {
      metadata {
        labels = { app = "grafana" }
      }
      spec {
        node_selector = {
          "kubernetes.io/hostname" = "node1"
        }
        container {
          image = "grafana/grafana:latest"
          name  = "grafana"
          port {
            container_port = 3000
          }
          env {
            name  = "GF_SECURITY_ADMIN_PASSWORD"
            value = "admin1234" # รหัสผ่านเข้าใช้งาน
          }
        }
      }
    }
  }
}

resource "kubernetes_config_map" "prometheus_config" {
  metadata {
    name      = "prometheus-config"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
  }

  data = {
    "prometheus.yml" = <<EOF
global:
  scrape_interval: 5s
  evaluation_interval: 5s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'k8s-control-node'
    static_configs:
      - targets: ['192.168.193.101:9090'] # แก้ IP ให้ตรงกับโหนดจริง
    labels:
      role: 'control-plane'
      node: 'control-1'

  - job_name: 'k8s-worker-nodes'
    static_configs:
      - targets: ['192.168.193.102:9090']
        labels: { role: 'worker', node: 'worker-1' }
      - targets: ['192.168.1.103:9090']
        labels: { role: 'worker', node: 'worker-2' }
      - targets: ['192.168.1.104:9090']
        labels: { role: 'worker', node: 'worker-3' }
EOF
  }
}

# prometheus ไม่ต้องทำอะไร เพราะมันมี service อยู่แล้

# 2. สร้าง Service (ตัวเปิดทางให้คนนอกเข้าถึง)
resource "kubernetes_service" "grafana_service" {
  metadata {
    name = "grafana-service"
    namespace = "monitoring"
  }
  spec {
    selector = {
      app = kubernetes_deployment.grafana.metadata[0].name
    }
    port {
      port        = 3000
      target_port = 3000
      node_port   = 32000 # พอร์ตที่จะใช้เข้าหน้าเว็บจริง
    }
    type = "NodePort"
  }
}