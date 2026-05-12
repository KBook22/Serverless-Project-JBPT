terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

# Provider สำหรับแต่ละ node
provider "docker" {
  alias = "node1"
  host  = "tcp://192.168.193.101:2375"
}

provider "docker" {
  alias = "node2"
  host  = "tcp://192.168.193.102:2375"
}

provider "docker" {
  alias = "node3"
  host  = "tcp://192.168.193.103:2375"
}

provider "docker" {
  alias = "node4"
  host  = "tcp://192.168.193.104:2375"
}