# SketchTimer - เว็บแอปฝึกวาดภาพตามแบบจับเวลา (Lab 8)

โปรเจกต์ Mini Front-end Project รายวิชา **968-362 Front-end Development** พัฒนาด้วย **Vue 3 (Composition API) + Quasar Framework + Pinia + Axios + Vue Router + MockAPI.io**

## ฟีเจอร์ที่ครบตามเงื่อนไข Lab 8
- **Vue Router & Route Guards (`src/router/index.js`, `src/router/routes.js`)**: มี 4 หน้า (`HomePage`, `PracticePage`, `MyPresetsPage`, `LoginPage`) พร้อม Global Navigation Guard ป้องกันหน้า `/presets` ให้เข้าได้เฉพาะผู้ที่ Login แล้ว
- **Pinia + Persisted State (`src/stores/auth-store.js`, `src/stores/preset-store.js`)**: แยก Store จัดการ Authentication (เก็บสถานะ Login ด้วย `pinia-plugin-persistedstate`) และจัดการข้อมูล Preset ภาพวาด
- **REST API ผ่าน MockAPI.io + Axios Interceptor (`src/boot/axios.js`)**: ทำ CRUD (`GET`, `POST`, `PUT`, `DELETE`) จริง พร้อมแนบ `Authorization: Bearer <token>` ผ่าน Request Interceptor
- **ระบบฝึกวาดภาพ (Present Mode)**: เลือกรูปทรงเรขาคณิต, ท่าทาง (Pose), หรือ Preset ที่อัปโหลดเอง พร้อมตัวจับเวลา **30 วินาที / 1 นาที / 5 นาที**, ปุ่มพักเวลา, กลับภาพซ้าย-ขวา (Flip), โหมดขาวดำ และตารางช่วยเล็ง 3x3
- **พร้อม Deploy ขึ้น Vercel**: มีไฟล์ `vercel.json` (SPA Rewrite), `.gitignore` และใช้ Environment Variables `QCLI_API_URL`, `QCLI_APP_TITLE`

---

## ขั้นตอนที่ 1: สร้าง Public Mock API บน MockAPI.io
1. เข้าเว็บไซต์ https://mockapi.io แล้ว Login ด้วย GitHub หรือ Google
2. กดสร้าง Project ใหม่ ชื่อ `sketchtimer-api` และตั้ง **API Prefix** เป็น `/api`
3. คัดลอก **API Endpoint** ของคุณ (เช่น `https://6a77676163e9caf860c38507.mockapi.io/api`)
4. สร้าง **Resource ที่ 1** ชื่อ `users` และกำหนด Schema ดังนี้ (ลบฟิลด์ default ที่ไม่ใช้ออก):
   - `id`: Object ID
   - `name`: String
   - `username`: String
   - `password`: String
   - `role`: String
5. สร้าง **Resource ที่ 2** ชื่อ `presets` และกำหนด Schema ดังนี้:
   - `id`: Object ID
   - `title`: String
   - `category`: String
   - `duration`: Number
   - `imageUrl`: String
   - `notes`: String
   - `owner`: String

---

## ขั้นตอนที่ 2: ติดตั้งและรันบนเครื่อง (Local Development)
1. แตกไฟล์ `sketchtimer-app.zip` แล้วเปิดโฟลเดอร์ `sketchtimer-app` ใน VS Code
2. เปิดไฟล์ `.env` และเปลี่ยน `QCLI_API_URL` เป็น Endpoint จาก MockAPI.io ของคุณ:
   ```env
   QCLI_API_URL=https://YOUR_PROJECT_ID.mockapi.io/api
   QCLI_APP_TITLE=SketchTimer - ฝึกวาดภาพจับเวลา
   ```
3. รันคำสั่งใน Terminal (Command Prompt):
   ```bash
   npm install
   npm run dev
   ```
4. ทดลองสมัครสมาชิกที่หน้า **เข้าสู่ระบบ > สมัครสมาชิก** แล้วลองเพิ่ม แก้ไข ลบ และกด **Present** ที่หน้า **Preset ของฉัน**

---

## ขั้นตอนที่ 3: ทดสอบ Build และ Push ขึ้น GitHub
1. ทดสอบ Build เพื่อเช็กว่าไม่มี Error:
   ```bash
   npm run build
   npm run serve
   ```
2. สร้าง Repository ใหม่บน GitHub (เช่น `sketchtimer-app`) โดยไม่ต้องเลือก README / .gitignore
3. รันคำสั่ง Push จากโฟลเดอร์โปรเจกต์ (ไฟล์ `.env`, `node_modules/`, `dist/` จะถูกข้ามอัตโนมัติตาม `.gitignore`):
   ```bash
   git init
   git add .
   git commit -m "first commit: SketchTimer Lab 8"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/sketchtimer-app.git
   git push -u origin main
   ```

---

## ขั้นตอนที่ 4: Deploy ขึ้น Vercel
1. เข้า https://vercel.com แล้วเลือก **Add New > Project** และกด **Import** Repository `sketchtimer-app`
2. ตั้งค่าโปรเจกต์ตามบทที่ 8:
   - **Framework Preset**: `Other`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/spa`
   - **Install Command**: `npm install`
3. เปิดส่วน **Environment Variables** แล้วเพิ่ม 2 ค่า:
   - `QCLI_API_URL` = `https://YOUR_PROJECT_ID.mockapi.io/api`
   - `QCLI_APP_TITLE` = `SketchTimer - ฝึกวาดภาพจับเวลา`
4. กด **Deploy** รอจนสถานะเป็น Ready แล้วทดสอบเปิดลิงก์ใช้งานจริง (ทดลอง Refresh หน้า `/presets` และ `/practice` เพื่อเช็กว่า `vercel.json` ทำงานถูกต้อง)
