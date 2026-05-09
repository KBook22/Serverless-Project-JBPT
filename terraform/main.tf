# ไฟล์สำหรับสร้างทรัพยากร
# ยังไม่ไฟนอล ต้องแก้
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

# Configure the Docker provider
provider "docker" {
    host = "unix:///var/run/docker.sock"
}

# Pull an image
resource "docker_image" "nginx" { //เหมือนนจะต้องแก้อะไรบางอย่างนะ
  name         = "nginx:latest" //ชื่อ image ที่ต้องการ pull
  keep_locally = false
}

#run a container 
resource "docker_container" "my_web_app" { //อันนี้เหมือนกัน
  image = docker_image.nginx.image_id //ชื่อ image
  name  = "QR-CODE" // =ชื่อ container

  ports {
    internal = 80
    external = 8000
  }
}

# 5. Output ค่าเพื่อเอาไปใช้ต่อใน Ansible หรือ Monitoring
output "container_name" {
  value = docker_container.my_web_app.name
}

output "access_url" {
  value = "http://localhost:8000"
}