resource "docker_image" "node_exporter_node2" {
  provider = docker.node2
  name     = "prom/node-exporter:latest"
}

resource "docker_container" "node_exporter_node2" {
  provider = docker.node2
  name     = "node-exporter"
  image    = docker_image.node_exporter_node2.image_id

  ports {
    internal = 9100
    external = 9100
  }

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