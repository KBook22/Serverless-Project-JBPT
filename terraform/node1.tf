# Pull images
resource "docker_image" "prometheus_node1" {
  provider = docker.node1
  name     = "prom/prometheus:latest"
}

resource "docker_image" "node_exporter_node1" {
  provider = docker.node1
  name     = "prom/node-exporter:latest"
}

# Upload prometheus.yml เป็น config file บน host
resource "docker_container" "prometheus" {
  provider = docker.node1
  name     = "prometheus"
  image    = docker_image.prometheus_node1.image_id

  ports {
    internal = 9090
    external = 9090
  }

  volumes {
    host_path      = "/etc/prometheus/prometheus.yml"
    container_path = "/etc/prometheus/prometheus.yml"
    read_only      = true
  }

  restart = "unless-stopped"
}

resource "docker_container" "node_exporter_node1" {
  provider = docker.node1
  name     = "node-exporter"
  image    = docker_image.node_exporter_node1.image_id

  ports {
    internal = 9100
    external = 9100
  }

  # ให้ node_exporter เห็น host filesystem จริง
  volumes {
    host_path      = "/proc"
    container_path = "/host/proc"
    read_only      = true
  }

  volumes {
    host_path      = "/sys"
    container_path = "/host/sys"
    read_only      = true
  }

  volumes {
    host_path      = "/"
    container_path = "/rootfs"
    read_only      = true
  }

  command = [
    "--path.procfs=/host/proc",
    "--path.sysfs=/host/sys",
    "--path.rootfs=/rootfs"
  ]

  restart = "unless-stopped"
}
resource "docker_image" "grafana_node1" {
  provider = docker.node1
  name     = "grafana/grafana:latest"
}

resource "docker_volume" "grafana_data" {
  provider = docker.node1
  name     = "grafana_data"
}

resource "docker_container" "grafana" {
  provider = docker.node1
  name     = "grafana"
  image    = docker_image.grafana_node1.image_id

  ports {
    internal = 3000
    external = 3000
  }

  env = [
    "GF_SECURITY_ADMIN_USER=admin",
    "GF_SECURITY_ADMIN_PASSWORD=admin"
  ]

  volumes {
    volume_name    = docker_volume.grafana_data.name
    container_path = "/var/lib/grafana"
  }

  restart = "unless-stopped"
}