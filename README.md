# 🚀 JBPT-QR Code — ENG23 3074

> ระบบแปลง URL หรือข้อความ เป็นรูปภาพ QR Code ช่วยเปลี่ยนลิงก์ที่ยาวและซับซ้อน ให้กลายเป็น QR Code ที่พร้อมดาวน์โหลดและนำไปใช้งานได้ทันที เพิ่มความสะดวกในการแชร์ และช่วยให้ผู้รับเข้าถึงเว็บไซต์ได้ง่ายๆ เพียงแค่สแกน

---

## 👥 สมาชิกในกลุ่ม

| รหัสนักศึกษา | ชื่อ-นามสกุล | ความรับผิดชอบ |
|-------------|-------------|---------------|
| B6600907 | นางสาววรัทยา ปัตตะเน | Terraform, Ansible |
| B6603892 | นายศุภณัฐ สิงหา | Docker, Monitoring |
| B6614690 | นายพิพัฒน์ อินสวรรค์ | Web Development |
| B6627065 | นายกิตติศักดิ์ ชิ้นทอง | Git, Jenkins, Kubernetes |

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
    │
    ▼  git push
 GitHub ──── webhook ────▶ Jenkins CI/CD
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
                 Build        Test      Docker Build
                                            │
                                            ▼
                                       Docker Hub
                                            │
                                    ┌───────┴───────┐
                                    ▼               ▼
                                Terraform        Ansible
                                    │               │
                                    └───────┬───────┘
                                            ▼
                                   Kubernetes Cluster
                                   ┌────────────────┐
                                   │  Pod 1  Pod 2  │
                                   │  [App]  [App]  │
                                   │                │
                                   │  Service (NodePort)  │
                                   └────────────────┘
                                            │
                              ┌─────────────┴──────────────┐
                              ▼                             ▼
                          Prometheus  ──────────────▶  Grafana
                        (scrape /metrics)            (dashboard)
```

---

## 📁 โครงสร้าง Repository

```
Serverless-Project-JBPT/
├── app/
│   ├── backend/                    # API server ด้วย Elysia.js บน Bun runtime
│   │   ├── src/
│   │   │   ├── index.ts            # จุดเริ่มต้น — ตั้งค่า Elysia, CORS, logger, routes
│   │   │   ├── config.ts           # เชื่อมต่อ PostgreSQL และรัน migration อัตโนมัติ
│   │   │   └── modules/
│   │   │       └── qr/
│   │   │           ├── index.ts    # Route handlers: GET /qr/history, POST /qr/upsert
│   │   │           ├── model.ts    # กำหนด schema ของ request body และ TypeScript types
│   │   │           └── service.ts  # logic หลัก: normalize, hash SHA-256, upsert ลง DB
│   │   ├── package.json            # dependencies ของ Bun (elysia, postgres, logixlysia)
│   │   └── tsconfig.json
│   ├── frontend/                   # UI ด้วย React 19 + Vite + Tailwind CSS
│   │   ├── src/
│   │   │   ├── App.tsx             # component หลักของแอป
│   │   │   ├── components/
│   │   │   │   ├── QrGenerator.tsx # layout หลัก (2 คอลัมน์: input + preview)
│   │   │   │   ├── InputTabs.tsx   # แท็บเลือกประเภท URL หรือข้อความธรรมดา
│   │   │   │   └── QrPreview.tsx   # แสดง QR Code และปุ่มดาวน์โหลด
│   │   │   ├── hooks/
│   │   │   │   └── useQrCode.ts    # จัดการ state และ logic การดาวน์โหลด
│   │   │   └── services/
│   │   │       └── api.ts          # ส่ง HTTP request ไปหา backend
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── database/
│       └── migration/
│           └── 001_inti.sql        # สร้างตาราง qr_codes และ index บน hash
├── compose.yaml                    # Docker Compose สำหรับรัน PostgreSQL (port 5435)
├── .env.example                    # ตัวอย่างค่า environment variables
├── Jenkinsfile                     # กำหนด CI/CD pipeline ทุก stage
├── terraform/
│   ├── main.tf                     # กำหนด resource ที่จะ provision
│   ├── variables.tf                # ตัวแปร input
│   └── outputs.tf                  # ค่า output หลัง apply
├── ansible/
│   ├── inventory                   # รายชื่อ host เป้าหมาย
│   └── playbook.yml                # tasks สำหรับ configure environment
├── k8s/
│   ├── deployment.yaml             # กำหนด Pods และ replicas
│   └── service.yaml                # เปิดพอร์ตให้เข้าถึงแอปจากภายนอก
├── monitoring/
│   ├── prometheus.yml              # ตั้งค่า scrape target
│   └── grafana-dashboard.json      # Dashboard ที่ export จาก Grafana
└── README.md
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

### 1. Clone Repository
```bash
git clone https://github.com/KBook22/Serverless-Project-JBPT.git
cd Serverless-Project-JBPT
```

### 2. ตั้งค่า Environment Variables
```bash
# คัดลอกไฟล์ตัวอย่างแล้วแก้ไขตามต้องการ
cp .env.example .env
```

ค่า default ใน `.env.example`:
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5435
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=jbptdb

VITE_API_URL=http://localhost:3000
```

### 3. รัน Database (PostgreSQL ผ่าน Docker Compose)
```bash
docker compose up -d
# PostgreSQL จะรันที่ localhost:5435
```

### 4. รัน Backend
```bash
cd app/backend
bun install
bun run dev
# API server รันที่ http://localhost:3000
# Migration จะรันอัตโนมัติตอน startup
```

### 5. รัน Frontend
```bash
cd app/frontend
bun install
bun run dev
# UI รันที่ http://localhost:5173
```

---

## 🗄️ Database Schema

ตาราง `qr_codes` — เก็บประวัติ QR Code ที่สร้างทั้งหมด

```sql
CREATE TABLE IF NOT EXISTS qr_codes (
  id             SERIAL PRIMARY KEY,
  input_type     VARCHAR(10) NOT NULL CHECK (input_type IN ('url', 'plaintext')),
  content        TEXT NOT NULL,
  hash           VARCHAR(64) UNIQUE NOT NULL,  -- SHA-256 ของ content ที่ normalize แล้ว
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_qr_codes_hash ON qr_codes(hash);
```

- **Deduplication:** ถ้า content เดิมถูกสร้างซ้ำ จะ increment `download_count` แทนการ insert ใหม่ (ON CONFLICT DO UPDATE)
- **Normalization:** URL จะถูก trim, lowercase, และตัด trailing slash ก่อน hash

---

## 🧪 API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | คำอธิบาย | Request Body |
|--------|----------|----------|--------------|
| `GET` | `/health` | Health check — ตรวจ DB connection | — |
| `GET` | `/qr/history` | ดึง QR Code ทั้งหมด เรียงตาม download_count | — |
| `POST` | `/qr/upsert` | สร้าง QR Code ใหม่ หรือ increment download count | `{ content, input_type }` |

### POST `/qr/upsert` — Request Body
```json
{
  "content": "https://example.com",
  "input_type": "url"
}
```
> `input_type` รับค่าได้ 2 แบบ: `"url"` หรือ `"plaintext"`

### ตัวอย่าง Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "input_type": "url",
    "content": "https://example.com",
    "hash": "a9b2c3...",
    "download_count": 3,
    "created_at": "2026-05-08T10:00:00.000Z",
    "created": false
  }
}
```

---

## 🔄 CI/CD Pipeline (Jenkins)

### ลำดับการทำงานของ Pipeline

```
Checkout ──▶ Build ──▶ Test ──▶ Docker Build ──▶ Push to Hub ──▶ Deploy
```

| Stage | คำอธิบาย |
|-------|----------|
| **Checkout** | ดึงโค้ดล่าสุดจาก GitHub |
| **Build** | ติดตั้ง dependencies (`bun install`) |
| **Test** | รัน unit test |
| **Docker Build** | สร้าง Docker image สำหรับ backend และ frontend |
| **Push to Hub** | อัปโหลด image ขึ้น Docker Hub |
| **Deploy** | รัน Terraform + Ansible แล้ว apply Kubernetes manifests |

### วิธีตั้งค่า Jenkins
1. ติดตั้ง Jenkins และเปิดที่ `http://localhost:8080`
2. ติดตั้ง plugin: **Git**, **Pipeline**, **Docker Pipeline**
3. เพิ่ม credentials สำหรับ Docker Hub (ชื่อ `dockerhub-credentials`)
4. สร้าง Pipeline job ใหม่ และชี้ไปที่ repository นี้
5. ตั้งค่า Webhook ใน GitHub:
   - ไปที่ **Settings → Webhooks → Add webhook**
   - Payload URL: `http://[jenkins-host]:8080/github-webhook/`
   - Content type: `application/json`
   - ติ๊ก trigger: **Just the push event**

---

## 🏗️ Infrastructure as Code

### Terraform — Provision Infrastructure
```bash
cd terraform
terraform init      # ดาวน์โหลด provider plugins
terraform plan      # ตรวจสอบว่าจะสร้างอะไรบ้าง
terraform apply     # สร้าง resource จริง
```

### Ansible — Configure Environment
```bash
cd ansible
ansible-playbook -i inventory playbook.yml
```

> ⚠️ **หมายเหตุ:** ใน pipeline จริง Jenkins จะเรียก Terraform และ Ansible อัตโนมัติในขั้นตอน Deploy ไม่ต้องรันด้วยมือ

---

## ☸️ Kubernetes Deployment

### Apply Manifests ด้วยตัวเอง
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### ตรวจสอบสถานะ
```bash
kubectl get pods -n [namespace]
kubectl get svc  -n [namespace]
```

### เข้าถึงแอปพลิเคชัน
```
http://localhost:30080
```

---

## 📊 Monitoring

### Prometheus — เก็บ Metrics
- ไฟล์ config: `monitoring/prometheus.yml`
- Scrape ทุก **15 วินาที**
- Target endpoint: `http://[app-host]:[port]/metrics`

รัน Prometheus:
```bash
prometheus --config.file=monitoring/prometheus.yml
# เปิด UI ที่ http://localhost:9090
```

### Grafana — แสดง Dashboard
- ไฟล์ dashboard: `monitoring/grafana-dashboard.json`
- Data source: Prometheus (`http://localhost:9090`)

วิธี import dashboard:
1. เปิด Grafana ที่ `http://localhost:3000`
2. ไปที่ **Dashboards → Import**
3. อัปโหลดไฟล์ `grafana-dashboard.json`

### Panels ใน Dashboard

| Panel | Metric (PromQL) | แสดงข้อมูลอะไร |
|-------|-----------------|----------------|
| Request Rate | `rate(http_requests_total[1m])` | จำนวน request ต่อวินาที |
| Error Rate | `rate(http_requests_total{status=~"5.."}[1m])` | จำนวน error 5xx ต่อวินาที |
| Latency (p95) | `histogram_quantile(0.95, ...)` | response time ที่ percentile 95 |
| Pod Health | `up{job="jbpt-qr"}` | service ขึ้นหรือล่ม (1/0) |

---

## 🌿 Branching Strategy

```
main        ──── โค้ดที่พร้อม production, protected branch
dev         ──── รวมโค้ดก่อน merge ขึ้น main
feature/*   ──── พัฒนา feature แต่ละอัน (เช่น feature/add-login)
```

| Branch | Protected | คำอธิบาย |
|--------|-----------|----------|
| `main` | ✅ | trigger pipeline อัตโนมัติเมื่อ merge |
| `dev` | ✅ | ทดสอบก่อน merge ขึ้น main |
| `feature/*` | ❌ | พัฒนาแยกกันแล้วค่อย merge เข้า dev |

---

## 🐛 ปัญหาที่พบบ่อย (Troubleshooting)

**Backend ขึ้น error ต่อ database ไม่ได้**
```bash
# ตรวจว่า docker compose รัน postgres อยู่
docker compose ps
# ตรวจว่า .env ใช้ port ตรงกับ compose.yaml (default: 5435)
```

**Frontend เรียก API ไม่ได้ (CORS / connection refused)**
```bash
# ตรวจว่า VITE_API_URL ใน .env ตรงกับ port ที่ backend รัน
# default backend port: 3000
echo $VITE_API_URL  # ควรได้ http://localhost:3000
```

**Pods ค้างอยู่ที่ `Pending` ไม่ยอม Running**
```bash
kubectl describe pod [pod-name] -n [namespace]
# ดูที่ Events: อาจเกิดจาก resource ไม่พอ หรือ image pull error
```

**Jenkins pipeline ล้มเหลวตอน Docker Build**
```bash
# ตรวจว่า Docker daemon รันอยู่
sudo systemctl start docker
# เพิ่ม jenkins user เข้า docker group
sudo usermod -aG docker jenkins
```

**Prometheus แสดง target เป็น DOWN**
```bash
# ตรวจว่าแอปเปิด /metrics ได้จริง
curl http://localhost:3000/health
# ตรวจ prometheus.yml ว่า host:port ตรงกับแอปจริง
```

---

## 📚 เอกสารอ้างอิง

- [Elysia.js Documentation](https://elysiajs.com/)
- [Bun Documentation](https://bun.sh/docs)
- [React Documentation](https://react.dev/)
- [qrcode.react](https://github.com/zpao/qrcode.react)
- [Jenkinsfile Declarative Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Terraform Documentation](https://developer.hashicorp.com/terraform/docs)
- [Ansible Documentation](https://docs.ansible.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

---

## 📄 ข้อมูลการส่งงาน

- วิชา: **ENG23 3074 — Serverless and Cloud Architectures**
- อาจารย์ผู้สอน: **ผู้ช่วยศาสตราจารย์ ดร.นันทวุฒิ คะอังกุ (AFHEA)**
- สำนักวิชาวิศวกรรมศาสตร์ สาขาวิชาวิศวกรรมคอมพิวเตอร์
