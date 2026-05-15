# 🚀 JBPT-QR Code — ENG23 3074

> ระบบแปลง URL หรือข้อความ เป็นรูปภาพ QR Code ช่วยเปลี่ยนลิงก์ที่ยาวและซับซ้อน ให้กลายเป็น QR Code ที่พร้อมดาวน์โหลดและนำไปใช้งานได้ทันที เพิ่มความสะดวกในการแชร์ และช่วยให้ผู้รับเข้าถึงเว็บไซต์ได้ง่ายๆ เพียงแค่สแกน

---

## 👥 สมาชิกในกลุ่ม

| รหัสนักศึกษา | ชื่อ-นามสกุล | ความรับผิดชอบ |
|-------------|-------------|---------------|
| B6600907 | นางสาววรัทยา ปัตตะเน | Terraform, Ansible |
| B6603892 | นายศุภณัฐ สิงหา | Kubernetes, Monitoring |
| B6614690 | นายพิพัฒน์ อินสวรรค์ | Web Development |
| B6627065 | นายกิตติศักดิ์ ชิ้นทอง | Git, Jenkins, Docker |

---

## 📌 ภาพรวมโปรเจค

### แอปพลิเคชัน
- **ชื่อ:** JBPT-QR Code
- **ประเภท:** Full-Stack Web App
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend:** Elysia.js (Bun runtime) + TypeScript
- **Database:** PostgreSQL 15
- **คำอธิบาย:** ผู้ใช้วาง URL หรือข้อความธรรมดาแล้วแอปสร้าง QR Code ทันที รองรับการดาวน์โหลดเป็นรูปภาพ และบันทึก download count ลงฐานข้อมูลผ่าน upsert (dedup ด้วย SHA-256 hash)

### Architecture Diagram
```
  Developer
      │ git push
      ▼
   GitHub  ────────────────────────▶ Jenkins (รันใน K8s)
                                            │
          ┌─────────────────────────────────┼──────────────────────┐
          ▼                                 ▼                      ▼
   [1] Build Images                 [2] Push to Hub        [3] Deploy to K8s
   backend + frontend               Docker Hub                     │
          │                               │                 kubectl apply
          └───────────────────────────────┘                        │
                       image pull                                   ▼
                            │                    ┌─────────────────────────────┐
                            └───────────────────▶│      Kubernetes Cluster     │
                                                 │  Node1 (101) ControlPlane   │
                                                 │  Node2-4 (102-104) Workers  │
                                                 │                             │
                                                 │  [Frontend]  :30080         │
                                                 │       │                     │
                                                 │  [Backend]   :30081         │
                                                 │       │  HPA 1-10 pods      │
                                                 │  [PostgreSQL] ClusterIP     │
                                                 └──────────────┬──────────────┘
                                                                │
                                              [4] Update Prometheus Config
                                              [5] Verify rollout status
                                                                │
                                                 ┌──────────────▼─────────────┐
                                                 │    Monitoring (Node1)      │
                                                 │  Prometheus  :9090         │
                                                 │    ◀─ Node Exporter :9100  │
                                                 │       (Node1, Node2-4)     │
                                                 │    ◀─ Backend :30081       │
                                                 │  Grafana     :3000         │
                                                 │  CPU/RAM/Network/API       │
                                                 └────────────────────────────┘

  Ansible   ── SSH ──────▶ Node1-4 : ติดตั้ง K8s (kubeadm), Docker, NFS
  Terraform ── TCP:2375 ──▶ Node1-4 : run Node Exporter, Prometheus, Grafana
```

---

## ⚙️ สิ่งที่ต้องติดตั้งก่อน (Prerequisites)

ตรวจสอบให้แน่ใจว่าติดตั้งทุก tool ครบก่อนรันโปรเจค

| Tool | Version | หน้าที่ |
|------|---------|---------|
| Git | ≥ 2.x | จัดการ source code |
| Bun | ≥ 1.x | JavaScript runtime สำหรับ backend + frontend |
| Docker | ≥ 24.x | รัน PostgreSQL และสร้าง container |
| Node.js | ≥ 20.x | ใช้ร่วมกับ Vite สำหรับ frontend (ถ้าไม่ใช้ Bun) |
| Jenkins | ≥ 2.4xx | ระบบ CI/CD automation |
| Terraform | ≥ 1.x | Provision infrastructure |
| Ansible | ≥ 2.15 | Configure environment |
| kubectl | ≥ 1.28 | สั่งงาน Kubernetes cluster |
| Minikube / K3s | latest | Kubernetes แบบ local |
| Prometheus | ≥ 2.x | เก็บ metrics |
| Grafana | ≥ 10.x | แสดง dashboard |

---

## 🏃 วิธีรันโปรเจค (Quick Start)

```bash
# 1. Clone & ตั้งค่า env
git clone https://github.com/KBook22/Serverless-Project-JBPT.git
cp .env.example .env          # แก้ไขค่าตามต้องการ (default พร้อมใช้งาน)

# 2. รัน Database
docker compose up -d          # PostgreSQL :5435

# 3. รัน Backend
cd app/backend && bun install && bun run dev   # API :3000, migration อัตโนมัติ

# 4. รัน Frontend
cd app/frontend && bun install && bun run dev  # UI :5173
```

---

## 🗄️ Database Schema

ตาราง `qr_codes` — คอลัมน์หลัก: `id`, `input_type` (url/plaintext), `content`, `hash` (SHA-256, UNIQUE), `download_count`, `created_at`

- ถ้า content ซ้ำ → `download_count` เพิ่มขึ้น 1 (upsert แทน insert ใหม่)
- URL จะถูก normalize (lowercase, trim, ตัด trailing slash) ก่อน hash

---

## 🧪 API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `GET` | `/health` | ตรวจสอบการเชื่อมต่อ DB |
| `GET` | `/qr/history` | ดึง QR Code ทั้งหมด เรียงตาม download_count |
| `POST` | `/qr/upsert` | สร้าง QR Code ใหม่ หรือ increment download count |

> Body ของ POST: `{ "content": "...", "input_type": "url" | "plaintext" }`

---

## 📁 โครงสร้าง Repository 

```
Serverless-Project-JBPT/
├── app/
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── config.ts
│   │       ├── metrics.ts
│   │       └── modules/qr/
│   │           ├── index.ts
│   │           ├── model.ts
│   │           └── service.ts
│   ├── frontend/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── App.tsx
│   │       ├── components/
│   │       │   ├── InputTabs.tsx
│   │       │   ├── QrGenerator.tsx
│   │       │   └── QrPreview.tsx
│   │       ├── hooks/useQrCode.ts
│   │       └── services/api.ts
│   └── database/
│       └── migration/
│           └── 001_inti.sql
├── Jenkinsfile
├── compose.yaml
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── node1.tf
│   ├── node2.tf
│   ├── node3.tf
│   └── node4.tf
├── ansible/
│   ├── inventory.ini
│   ├── k8sinstall-playbook.yml
│   ├── dockerplaybook.yml
│   ├── config-tcp-docker-playbook.yml
│   ├── install-nfs-playbook.yml
│   └── hellowolrdplaybook.yml
├── k8s/
│   ├── app/
│   │   ├── backend-deployment.yaml
│   │   ├── backend-service.yaml
│   │   ├── backend-hpa.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── frontend-service.yaml
│   │   ├── postgres-deployment.yaml
│   │   ├── postgres-service.yaml
│   │   ├── postgres-pv.yaml
│   │   ├── postgres-pvc.yaml
│   │   └── postgres-secret.yaml
│   └── jenkins/
│       ├── Dockerfile
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── pv.yaml
│       ├── pvc.yaml
│       ├── rbac.yaml
│       ├── sa.yaml
│       └── secret.yaml
└── monitoring/
    ├── prometheus.yml
    ├── control_plane_compose.yml
    └── worker_compose.yaml
```

---

## CI/CD Pipeline (Jenkins)

Jenkins ทำหน้าที่เป็น Automation Server ที่รับ Webhook จาก GitHub เมื่อมีการ push โค้ดใหม่ขึ้น Branch `main` แล้วรัน Pipeline อัตโนมัติ 5 Stage

**ไฟล์:** `Jenkinsfile`

### ตัวแปร Environment ใน Pipeline

| ตัวแปร | ค่า | คำอธิบาย |
|--------|-----|----------|
| `TAG` | `${BUILD_NUMBER}` | หมายเลข Build ใช้เป็น Docker image tag |
| `NODE_IP` | `192.168.193.104` | IP ของ Worker node สำหรับเรียก Backend |
| `BACKEND_URL` | `http://192.168.193.104:30081` | URL ที่ Frontend ใช้ติดต่อ Backend |
| `DOCKERHUB_USER` | `kittisakbook` | ชื่อ Account Docker Hub |

Pipeline ตั้ง trigger แบบ `pollSCM('* * * * *')` คือ Jenkins จะ poll GitHub ทุก 1 นาที ถ้าพบว่า Branch `main` มีการเปลี่ยนแปลงก็จะเริ่ม Build ทันที

---

### Stage 1 — Build Images

```
docker build -f app/backend/Dockerfile  → kittisakbook/jbpt-backend:<BUILD_NUMBER>
                                         → kittisakbook/jbpt-backend:latest

docker build -f app/frontend/Dockerfile → kittisakbook/jbpt-frontend:<BUILD_NUMBER>
                                         → kittisakbook/jbpt-frontend:latest
```

- สร้าง Docker Image ทั้ง Backend และ Frontend ในขั้นตอนเดียว
- แต่ละ Image จะถูก tag 2 ครั้ง คือด้วย `BUILD_NUMBER` (เก็บ version) และ `latest` (ใช้ deploy)
- Frontend จะถูกส่ง `VITE_API_URL` เข้าไปตอน build เพื่อให้รู้ว่า Backend อยู่ที่ไหน

---

### Stage 2 — Push to Docker Hub

- ใช้ Credentials ชื่อ `dockerhub-credentials` ที่เก็บใน Jenkins Credentials Store
- Login เข้า Docker Hub ด้วย `--password-stdin` (ปลอดภัยกว่าการใส่ password ตรงๆ)
- Push ทั้ง 4 Image (backend:TAG, backend:latest, frontend:TAG, frontend:latest) ขึ้น Docker Hub
- หลัง pipeline เสร็จ (post always) จะ `docker logout` ออกเสมอ

---

### Stage 3 — Deploy to K8s

Apply Kubernetes Manifest ตามลำดับนี้:

```
1. postgres-secret.yaml     → ข้อมูลลับ (ชื่อ DB, user, password)
2. postgres-pv.yaml         → PersistentVolume สำหรับเก็บข้อมูล
3. postgres-pvc.yaml        → PersistentVolumeClaim ขอใช้ PV
4. postgres-deployment.yaml → รัน PostgreSQL Pod
5. postgres-service.yaml    → เปิด Service ให้ Backend เรียกใช้

6. sed แทน image tag ใน backend-deployment.yaml และ frontend-deployment.yaml
   จาก :latest → :<BUILD_NUMBER>

7. backend-deployment.yaml  → รัน Backend Pod
8. backend-service.yaml     → เปิด NodePort ให้เข้าถึง Backend
9. backend-hpa.yaml         → เปิด Auto Scaling สำหรับ Backend
10. frontend-deployment.yaml → รัน Frontend Pod
11. frontend-service.yaml   → เปิด NodePort ให้เข้าถึง Frontend
```

การแทน tag ด้วย `sed` ก่อน apply ทำให้แน่ใจว่า K8s จะดึง Image version ที่ถูก build ใน round นี้เสมอ

---

### Stage 4 — Update Prometheus Config

- ใช้ SSH Key Credentials ชื่อ `node1-ssh-key` เพื่อ SSH เข้าไปที่ Node1 (Control Plane)
- Copy ไฟล์ `monitoring/prometheus.yml` ไปวางที่ `/etc/prometheus/prometheus.yml` บน Node1
- ส่ง HTTP POST ไปที่ `http://192.168.193.101:9090/-/reload` เพื่อสั่งให้ Prometheus โหลด Config ใหม่โดยไม่ต้อง Restart
- ถ้า HTTP Response ไม่ใช่ `200` Pipeline จะหยุดและแจ้ง Error ทันที

---

### Stage 5 — Verify

ตรวจสอบว่า Pod ทุกตัวถูก Deploy สำเร็จ:

```bash
kubectl rollout status deployment/postgres
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend
```

คำสั่งนี้จะรอจนกว่า Deployment จะเสร็จ (ทุก Pod พร้อม) หรือ Timeout แล้วจึงแจ้งผล

---

## Infrastructure as Code

### Terraform

Terraform ทำหน้าที่ **provision Docker Containers** บนแต่ละ Node โดยใช้ Provider `kreuzwerker/docker` ซึ่งสั่งงานผ่าน Docker API ทาง TCP โดยตรง ไม่ต้อง SSH

**ไฟล์:** `terraform/main.tf`, `terraform/node1.tf` – `node4.tf`

#### main.tf — กำหนด Provider

```hcl
provider "docker" {
  alias = "node1"
  host  = "tcp://192.168.193.101:2375"   # Control Plane
}
provider "docker" {
  alias = "node2"
  host  = "tcp://192.168.193.102:2375"   # Worker 1
}
provider "docker" {
  alias = "node3"
  host  = "tcp://192.168.193.103:2375"   # Worker 2
}
provider "docker" {
  alias = "node4"
  host  = "tcp://192.168.193.104:2375"   # Worker 3
}
```

Terraform เชื่อมต่อกับ Docker Daemon บนแต่ละ Node ผ่าน Port 2375 (TCP ที่ไม่มี TLS) และสั่ง pull/run Container ได้เลย

#### node1.tf — Control Plane (Prometheus + Grafana + Node Exporter)

| Container | Image | Port | คำอธิบาย |
|-----------|-------|------|----------|
| `prometheus` | `prom/prometheus:latest` | 9090 | เก็บ Metrics จากทุก Node |
| `grafana` | `grafana/grafana:latest` | 3000 | แสดง Dashboard |
| `node-exporter` | `prom/node-exporter:latest` | 9100 | เก็บ Metrics ของ Node1 เอง |

- Prometheus ถูกเปิดด้วย flag `--web.enable-lifecycle` เพื่อให้ reload config ผ่าน HTTP POST ได้
- Prometheus mount `/etc/prometheus/prometheus.yml` จาก Host เข้าไปใน Container
- Node Exporter mount `/proc`, `/sys`, `/` จาก Host เพื่อให้เห็น metrics ของ OS จริง

#### node2.tf, node3.tf, node4.tf — Worker Nodes (Node Exporter เท่านั้น)

Worker แต่ละตัวรัน `node-exporter` Container อย่างเดียว (port 9100) เพื่อรายงาน CPU, RAM, Network ของ Node นั้นให้ Prometheus บน Node1 ดึงไปแสดง

---

### Ansible

Ansible ทำหน้าที่ **configure** ระบบปฏิบัติการและ **ติดตั้ง Software** บนแต่ละ Node ก่อนที่ Kubernetes และ Application จะรัน Ansible ไม่ต้อง SSH ผ่าน GUI แต่ใช้ inventory ระบุ host และ playbook กำหนด task ที่ต้องทำ

**ไฟล์:** `ansible/inventory.ini`, `ansible/*.yml`

#### inventory.ini — รายชื่อ Node เป้าหมาย

```ini
[control_plane]
node1  ansible_host=192.168.193.101  ansible_user=node01

[workers]
node2  ansible_host=192.168.193.102  ansible_user=node02
node3  ansible_host=192.168.193.103  ansible_user=node03
node4  ansible_host=192.168.193.104  ansible_user=node04

[cluster:children]   # รวม control_plane + workers ไว้ใน group เดียว
control_plane
workers
```

#### k8sinstall-playbook.yml — ติดตั้ง Kubernetes Cluster (4 Phase)

**Phase 1 — Prepare all nodes** (รันบนทุก Node ใน group `cluster`)
- โหลด Kernel module `overlay` และ `br_netfilter` ที่ Kubernetes ต้องการ
- ตั้ง sysctl params เพื่อเปิด IP forwarding และ bridge network
- ปิด Swap ทั้ง runtime และ fstab (Kubernetes บังคับ)
- ติดตั้ง `containerd.io` จาก Docker repository พร้อม config `SystemdCgroup = true`
- ติดตั้ง `kubeadm`, `kubelet`, `kubectl` เวอร์ชัน 1.31 และ lock ไม่ให้ upgrade อัตโนมัติ

**Phase 2 — Initialize control plane** (รันเฉพาะ node1)
- รัน `kubeadm init` พร้อม `--pod-network-cidr=192.168.0.0/16` (subnet ของ Calico)
- Copy `admin.conf` ไปไว้ที่ `~/.kube/config` เพื่อใช้ `kubectl`
- ติดตั้ง **Calico CNI** ผ่าน Tigera Operator (วิธี official ล่าสุด)
- สร้าง `kubeadm join` token แล้วเก็บไว้ใน Ansible fact เพื่อส่งต่อ Phase ถัดไป

**Phase 3 — Join workers** (รันบน node2, node3, node4)
- รัน `kubeadm join` ด้วย token ที่ได้จาก Phase 2 เพื่อเข้าร่วม Cluster

**Phase 4 — Verify cluster health** (รันบน node1)
- รอให้ทุก Node พร้อม (`kubectl wait --for=condition=Ready nodes --all`)
- แสดง `kubectl get nodes -o wide` และ `kubectl get pods -A`

#### dockerplaybook.yml — ติดตั้ง Docker บนทุก Node

ติดตั้ง package เหล่านี้บนทุก Node ใน group `cluster`:
- `docker-ce`, `docker-ce-cli`, `containerd.io`
- `docker-buildx-plugin`, `docker-compose-plugin`
- เปิด Docker service และเพิ่ม user ปัจจุบันเข้า group `docker`

#### Playbook อื่น ๆ

| Playbook | หน้าที่ |
|----------|--------|
| `config-tcp-docker-playbook.yml` | เปิด Docker API ทาง TCP (port 2375) เพื่อให้ Terraform สั่งงานได้ |
| `install-nfs-playbook.yml` | ติดตั้ง NFS สำหรับ Persistent Volume แบบ shared storage |
| `hellowolrdplaybook.yml` | Playbook ทดสอบพื้นฐาน |

---

## Kubernetes (K8s)

Kubernetes รัน Application ทั้งหมดบน Cluster ที่ประกอบด้วย Node ทางกายภาพ 4 เครื่อง (1 Control Plane + 3 Workers) โดย Manifest ทั้งหมดแบ่งออกเป็น 2 กลุ่ม

**ไฟล์:** `k8s/app/`, `k8s/jenkins/`

### k8s/app/ — Application Workloads

#### PostgreSQL

| ไฟล์ | คำอธิบาย |
|------|---------|
| `postgres-secret.yaml` | เก็บ `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` แบบ base64 |
| `postgres-pv.yaml` | PersistentVolume บน Host Path เพื่อเก็บข้อมูล DB ไม่ให้หายเมื่อ Pod ถูกลบ |
| `postgres-pvc.yaml` | PersistentVolumeClaim ที่ Deployment ใช้ขอพื้นที่จาก PV |
| `postgres-deployment.yaml` | รัน PostgreSQL Pod พร้อม mount PVC และดึง Secret |
| `postgres-service.yaml` | ClusterIP Service ชื่อ `postgres-svc` ให้ Backend เรียกผ่านชื่อนี้ได้ |

#### Backend (Elysia.js / Bun)

**`backend-deployment.yaml`**
- Image: `kittisakbook/jbpt-backend:latest`
- Port: 8000
- Resource limits: CPU request 100m / limit 200m
- Environment variables ดึงจาก `postgres-secret` ทั้งหมด (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`)

**`backend-service.yaml`** — NodePort Service เปิดให้เข้าถึง Backend จากภายนอก Cluster ที่ port 30081

**`backend-hpa.yaml`** — HorizontalPodAutoscaler (Auto Scaling)
- Min replicas: 1
- Max replicas: 10
- ขยาย Pod อัตโนมัติเมื่อ CPU เกิน **50%**

#### Frontend (React / Nginx)

| ไฟล์ | คำอธิบาย |
|------|---------|
| `frontend-deployment.yaml` | รัน Frontend Pod ด้วย Image `kittisakbook/jbpt-frontend:latest` |
| `frontend-service.yaml` | NodePort Service เปิด port 30080 ให้เข้าถึง UI จากภายนอก |

### k8s/jenkins/ — Jenkins Running Inside K8s

Jenkins รันอยู่ใน Kubernetes Cluster เดียวกัน เพื่อให้ใช้ `kubectl` deploy Application ได้โดยตรงจากภายใน Cluster

| ไฟล์ | คำอธิบาย |
|------|---------|
| `Dockerfile` | Jenkins Image ที่ติดตั้ง kubectl, docker เพิ่มเติม |
| `deployment.yaml` | รัน Jenkins Pod |
| `service.yaml` | NodePort Service เปิด port ให้เข้าถึง Jenkins Web UI |
| `pv.yaml` | PersistentVolume เก็บ Jenkins data |
| `pvc.yaml` | PersistentVolumeClaim สำหรับ Jenkins |
| `sa.yaml` | ServiceAccount สำหรับ Jenkins |
| `secret.yaml` | Secret เก็บ Jenkins credentials |
| `rbac.yaml` | กำหนดสิทธิ์ให้ Jenkins สั่งงาน Kubernetes ได้ |

**`rbac.yaml`** — ClusterRole ที่ให้ Jenkins มีสิทธิ์:
- จัดการ `deployments`, `services`, `secrets`, `persistentvolumes`, `persistentvolumeclaims`, `pods`
- จัดการ `horizontalpodautoscalers`
- Actions: get, list, create, update, patch, delete, apply, watch

---

## Monitoring

ระบบ Monitoring ประกอบด้วย 2 ส่วนหลัก คือ Prometheus สำหรับเก็บ Metrics และ Grafana สำหรับแสดง Dashboard

### โครงสร้าง Monitoring

```
Node1 (Control Plane / 192.168.193.101)
  ├── Prometheus  :9090  ← ศูนย์กลางเก็บ metrics
  ├── Grafana     :3000  ← แสดง Dashboard
  └── Node Exporter :9100 ← metrics ของ Node1

Node2 (Worker 1 / 192.168.193.102)
  └── Node Exporter :9100 ← metrics ของ Node2

Node3 (Worker 2 / 192.168.193.103)
  └── Node Exporter :9100 ← metrics ของ Node3

Node4 (Worker 3 / 192.168.193.104)
  └── Node Exporter :9100 ← metrics ของ Node4
  └── Backend NodePort :30081 ← app metrics
```

### prometheus.yml — การตั้งค่า Scrape

```yaml
global:
  scrape_interval: 5s        # ดึง metrics ทุก 5 วินาที
  evaluation_interval: 5s    # ประเมิน alert rules ทุก 5 วินาที
```

**Scrape Jobs ทั้งหมด:**

| Job Name | Target | Role | คำอธิบาย |
|----------|--------|------|---------|
| `prometheus` | `localhost:9090` | monitoring | Prometheus scrape ตัวเอง |
| `k8s-control-node` | `192.168.193.101:9100` | control-plane | Metrics ของ Node1 (CPU, RAM, Disk, Network) |
| `k8s-worker-nodes` | `192.168.193.102:9100` | worker | Metrics ของ Node2 |
| `k8s-worker-nodes` | `192.168.193.103:9100` | worker | Metrics ของ Node3 |
| `k8s-worker-nodes` | `192.168.193.104:9100` | worker | Metrics ของ Node4 |
| `jbpt-backend` | `192.168.193.104:30081` | app | Application metrics จาก Backend API |

### control_plane_compose.yml — รัน Monitoring Stack บน Node1

```yaml
services:
  prometheus:  port 9090   # mount prometheus.yml จาก host
  grafana:     port 3000   # admin user: admin / password: adminZ01
```

รัน Prometheus และ Grafana บน Node1 ด้วย Docker Compose ข้อมูลทั้งหมดถูกเก็บใน Docker Volume (`prometheus_data`, `grafana_data`)

### worker_compose.yaml — รัน Node Exporter บน Worker Nodes

รัน Prometheus container บน Worker nodes (port 9090) สำหรับ Node Exporter เพื่อส่ง metrics ให้ Prometheus หลักบน Node1

### Grafana Dashboard แสดงข้อมูล

- **CPU Usage** — การใช้งาน CPU ของแต่ละ Node
- **RAM Usage** — การใช้หน่วยความจำของแต่ละ Node
- **Network I/O** — ปริมาณ Traffic เข้า/ออกของแต่ละ Node
- **Backend API (Pod) Metrics** — สถานะและ performance ของ Backend Service

วิธี import Dashboard:
1. เปิด Grafana ที่ `http://192.168.193.101:3000`
2. ไปที่ **Dashboards → Import**
3. อัปโหลด `monitoring/grafana-dashboard.json`

---

## สรุปความสัมพันธ์ระหว่าง Component

```
GitHub (push)
    │
    ▼ webhook / pollSCM
Jenkins (k8s/jenkins/)
    │
    ├── Stage 1: docker build → image
    ├── Stage 2: docker push → Docker Hub
    ├── Stage 3: kubectl apply → K8s Cluster
    │               │
    │               ├── PostgreSQL (PV + PVC + Secret)
    │               ├── Backend (HPA: 1-10 pods, CPU 50%)
    │               └── Frontend (NodePort 30080)
    ├── Stage 4: scp prometheus.yml → Node1 + reload
    └── Stage 5: kubectl rollout status (verify)

Terraform ─── TCP 2375 ──▶ Docker Daemon บน Node1-4
    ├── Node1: prometheus + grafana + node-exporter
    └── Node2-4: node-exporter เท่านั้น

Ansible ─── SSH ──▶ Node1-4
    ├── ติดตั้ง Docker (dockerplaybook.yml)
    ├── เปิด TCP port 2375 (config-tcp-docker-playbook.yml)
    ├── ติดตั้ง K8s Cluster (k8sinstall-playbook.yml)
    │   ├── Phase 1: containerd + kubeadm บนทุก Node
    │   ├── Phase 2: kubeadm init + Calico CNI บน Node1
    │   ├── Phase 3: kubeadm join บน Node2-4
    │   └── Phase 4: verify cluster
    └── ติดตั้ง NFS (install-nfs-playbook.yml)

Prometheus (Node1:9090) ──scrape 5s──▶ Node Exporter บน Node1-4 (:9100)
                         ──scrape 5s──▶ Backend API (:30081/metrics)
Grafana (Node1:3000) ──query──▶ Prometheus
```

---

## ข้อมูล Network

| Node | IP | Role | Services |
|------|----|------|---------|
| node1 | 192.168.193.101 | Control Plane | Prometheus:9090, Grafana:3000, NodeExporter:9100 |
| node2 | 192.168.193.102 | Worker | NodeExporter:9100 |
| node3 | 192.168.193.103 | Worker | NodeExporter:9100 |
| node4 | 192.168.193.104 | Worker | NodeExporter:9100, Backend NodePort:30081 |

| Port | Service | เข้าถึงจากภายนอกได้ที่ |
|------|---------|----------------------|
| 30080 | Frontend UI | `http://192.168.193.104:30080` |
| 30081 | Backend API | `http://192.168.193.104:30081` |
| 9090 | Prometheus | `http://192.168.193.101:9090` |
| 3000 | Grafana | `http://192.168.193.101:3000` |
