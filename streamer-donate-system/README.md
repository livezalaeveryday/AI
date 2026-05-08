# Streamer Donate System

ระบบรับบริจาคสำหรับ Streamer ไลฟ์สด พร้อมการโอนเงินเข้าบัญชีโดยตรง, ตรวจสอบการโอนอัตโนมัติ, และระบบแจ้งเตือน Overlay

## 🎯 คุณสมบัติหลัก

### สำหรับผู้ชม (User Interface)
1. **Login ด้วย YouTube** - เข้าสู่ระบบอัตโนมัติด้วยบัญชี YouTube
2. **หน้าบริจาค** - กรอกจำนวนเงิน, เลือกธนาคาร, ใส่ข้อความ
3. **แสดงข้อมูลบัญชี** - แสดงเลขบัญชีและธนาคารของ Streamer
4. **ยืนยันการโอน** - อัพโหลดสลิปหรือตรวจสอบอัตโนมัติ
5. **ประวัติการบริจาค** - ดูประวัติการบริจาคของตัวเอง

### สำหรับ Streamer (Admin Dashboard)
1. **ตั้งค่าบัญชีธนาคาร** - เพิ่ม/แก้ไข เลขบัญชีและธนาคาร
2. **จัดการการบริจาค** - ตรวจสอบและยืนยันการโอนเงิน
3. **ดูสถิติ** - ยอดรวม, จำนวนครั้ง, ผู้บริจาคท็อป
4. **ตั้งค่า Overlay** - ปรับแต่งการแสดงผลบนหน้าจอไลฟ์
5. **จัดการข้อความ** - ตอบกลับหรือซ่อนข้อความที่ไม่เหมาะสม

### ระบบอัตโนมัติ
1. **ตรวจสอบการโอน** - เชื่อมต่อกับ API ธนาคาร (จำลอง)
2. **Overlay แจ้งเตือน** - แสดงชื่อ, จำนวนเงิน, ข้อความ บน OBS
3. **บันทึกประวัติ** - เก็บข้อมูลการบริจาคทั้งหมด
4. **WebSocket Real-time** - แจ้งเตือนทันทีเมื่อมีการบริจาค

## 🏗️ สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ User Page   │  │ Admin Panel  │  │ Overlay Display  │   │
│  │ (Donate)    │  │ (Dashboard)  │  │ (OBS Browser)    │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ WebSocket & REST API
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Node.js)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Auth (YT)   │  │ Payment Check│  │ Notification     │   │
│  │ OAuth 2.0   │  │ (Bank API)   │  │ (WebSocket)      │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Database    │  │ File Upload  │  │ Admin Controls   │   │
│  │ (MongoDB)   │  │ (Slips)      │  │ (Settings)       │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ YouTube     │  │ Bank APIs    │  │ Cloud Storage    │   │
│  │ OAuth       │  │ (Mock/Real)  │  │ (Slip Images)    │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📁 โครงสร้างโปรเจค

```
streamer-donate-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js       # YouTube OAuth
│   │   │   ├── donationController.js   # จัดการการบริจาค
│   │   │   ├── adminController.js      # Dashboard & Settings
│   │   │   └── paymentController.js    # ตรวจสอบการโอน
│   │   ├── models/
│   │   │   ├── User.js                 # User schema
│   │   │   ├── Donation.js             # Donation schema
│   │   │   └── BankAccount.js          # Bank config
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── donations.js
│   │   │   ├── admin.js
│   │   │   └── payment.js
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT verification
│   │   │   └── upload.js               # File upload
│   │   ├── services/
│   │   │   ├── youtubeService.js       # YouTube API
│   │   │   ├── bankService.js          # Bank integration
│   │   │   └── notificationService.js  # WebSocket events
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── oauth.js
│   │   └── app.js
│   ├── uploads/                        # Slip images
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── overlay.html                # Overlay page for OBS
│   ├── src/
│   │   ├── components/
│   │   │   ├── DonateForm.jsx          # ฟอร์มบริจาค
│   │   │   ├── BankSelector.jsx        # เลือกธนาคาร
│   │   │   ├── DonationHistory.jsx     # ประวัติการบริจาค
│   │   │   ├── AdminDashboard.jsx      # Dashboard
│   │   │   ├── BankSettings.jsx        # ตั้งค่าธนาคาร
│   │   │   ├── OverlayPreview.jsx      # พรีวิว Overlay
│   │   │   └── YouTubeLogin.jsx        # ปุ่ม Login
│   │   ├── pages/
│   │   │   ├── UserPage.jsx            # หน้าผู้ใช้
│   │   │   ├── AdminPage.jsx           # หน้า Admin
│   │   │   └── OverlayPage.jsx         # หน้า Overlay
│   │   ├── services/
│   │   │   ├── api.js                  # API calls
│   │   │   └── websocket.js            # WebSocket connection
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Auth state
│   │   ├── App.jsx
│   │   └── index.jsx
│   └── package.json
│
└── README.md
```

## 🔧 เทคโนโลยีที่ใช้

### Backend
- **Node.js + Express** - Web framework
- **MongoDB + Mongoose** - Database
- **Passport.js** - YouTube OAuth
- **Socket.io** - Real-time notifications
- **Multer** - File upload (slips)
- **JWT** - Authentication
- **Axios** - HTTP client for bank APIs

### Frontend
- **React** - UI framework
- **React Router** - Navigation
- **Socket.io-client** - WebSocket
- **TailwindCSS** - Styling
- **React Query** - Data fetching
- **Zustand/Context** - State management

## 🔐 กระบวนการทำงาน

### 1. การบริจาค (Donation Flow)
```
1. User คลิก Login with YouTube
2. Redirect ไป YouTube OAuth → กลับมาพร้อม Token
3. User เลือกจำนวนเงิน + ธนาคาร + พิมพ์ข้อความ
4. ระบบแสดงเลขบัญชีให้โอน
5. User โอนเงินจริงผ่านแอปธนาคาร
6. User อัพโหลดสลิป หรือ ระบบตรวจสอบอัตโนมัติ
7. Backend ตรวจสอบกับ Bank API (หรือ manual approve)
8. เมื่อผ่านการตรวจสอบ → บันทึกฐานข้อมูล
9. ส่ง WebSocket event → Overlay แสดงทันที
10. User เห็นสถานะ "สำเร็จ" ในประวัติ
```

### 2. การตรวจสอบการโอน (Payment Verification)
**วิธีที่ 1: อัตโนมัติ (Bank API)**
- เชื่อมต่อกับ Open Banking API (เช่น KBank, SCB, BBL)
- ตรวจสอบยอดเงินเข้าแบบ real-time
- Match จำนวนเงินและเวลา

**วิธีที่ 2: กึ่งอัตโนมัติ (Slip Upload)**
- User อัพโหลดรูปสลิป
- Admin ตรวจสอบและกดอนุมัติ
- หรือใช้ OCR อ่านสลิปอัตโนมัติ

**วิธีที่ 3: ผสมผสาน**
- ธนาคารใหญ่ → ใช้ API อัตโนมัติ
- ธนาคารเล็ก → ใช้ slip upload + manual

### 3. Overlay สำหรับ OBS
```html
<!-- OBS Browser Source -->
URL: http://yourdomain.com/overlay?streamerId=xxx
Resolution: 1920x1080
FPS: 60
```

**ฟีเจอร์ Overlay:**
- แสดงชื่อผู้บริจาค (YouTube name/avatar)
- จำนวนเงิน (มี animation)
- ข้อความที่ฝากมา
- เอฟเฟกต์เสียง (optional)
- Custom theme/color
- Auto-hide หลัง 10-30 วินาที

## 🛡️ ความปลอดภัย

1. **YouTube OAuth 2.0** - ไม่เก็บ password
2. **JWT Tokens** - Session management
3. **HTTPS** - Encryption ทุกการสื่อสาร
4. **Input Validation** - ป้องกัน XSS/Injection
5. **File Upload Security** - ตรวจสอบไฟล์สลิป
6. **Rate Limiting** - ป้องกัน spam
7. **Admin Authentication** - แยกสิทธิ์ชัดเจน

## 📊 ฐานข้อมูล (Schema)

### User
```javascript
{
  youtubeId: String,
  displayName: String,
  avatarUrl: String,
  email: String,
  createdAt: Date
}
```

### Donation
```javascript
{
  userId: ObjectId,
  streamerId: ObjectId,
  amount: Number,
  currency: String, // THB
  bankCode: String, // KBANK, SCB, etc.
  message: String,
  status: String, // pending, verified, rejected
  slipImage: String,
  transactionRef: String,
  isShownOnOverlay: Boolean,
  createdAt: Date,
  verifiedAt: Date
}
```

### BankAccount
```javascript
{
  streamerId: ObjectId,
  bankCode: String,
  bankName: String,
  accountNumber: String,
  accountName: String,
  isActive: Boolean,
  isPrimary: Boolean
}
```

## 🎨 UI Components ที่ต้องมี

### User Side
- [x] YouTube Login Button
- [x] Donation Amount Selector (preset + custom)
- [x] Bank Account Display (QR code + account number)
- [x] Message Input (with character limit)
- [x] Slip Upload / Auto-verify toggle
- [x] Donation History List
- [x] Status Badge (pending/verified)

### Admin Side
- [x] Dashboard Statistics (total, today, top donors)
- [x] Bank Account Management (CRUD)
- [x] Pending Donations List (approve/reject)
- [x] All Donations Table (filter, search, export)
- [x] Overlay Settings (theme, duration, sound)
- [x] Blocked Users List
- [x] Revenue Reports (daily/weekly/monthly)

### Overlay
- [x] Animated Donation Card
- [x] Avatar + Name + Amount + Message
- [x] Progress Bar / Goal Tracker (optional)
- [x] Recent Donations Ticker
- [x] Custom CSS Themes

## 🚀 ขั้นตอนการพัฒนา

### Phase 1: Core System (สัปดาห์ 1-2)
1. ตั้งค่า Project Structure
2. YouTube OAuth Integration
3. Database Schema & Models
4. Basic Donation CRUD
5. Manual Slip Upload

### Phase 2: Payment Verification (สัปดาห์ 3)
1. Mock Bank API Integration
2. Auto-verification Logic
3. Admin Approval Workflow
4. Status Updates via WebSocket

### Phase 3: Overlay & Real-time (สัปดาห์ 4)
1. WebSocket Setup
2. Overlay HTML/CSS/JS
3. Animation Effects
4. OBS Testing

### Phase 4: Admin Dashboard (สัปดาห์ 5)
1. Statistics & Charts
2. Bank Account Management
3. Donation Management Table
4. Export Features

### Phase 5: Polish & Deploy (สัปดาห์ 6)
1. UI/UX Improvements
2. Error Handling
3. Security Hardening
4. Production Deployment
5. Documentation

## 🔌 API Endpoints

### Authentication
```
GET  /api/auth/youtube          # Redirect to YouTube
GET  /api/auth/youtube/callback # OAuth callback
POST /api/auth/logout           # Logout
GET  /api/auth/me               # Get current user
```

### Donations
```
POST   /api/donations           # Create donation
GET    /api/donations           # Get user's donations
GET    /api/donations/:id       # Get donation details
PUT    /api/donations/:id/slip  # Upload slip
GET    /api/donations/public    # Public recent donations
```

### Admin
```
GET    /api/admin/stats         # Dashboard stats
GET    /api/admin/donations     # All donations (filterable)
PUT    /api/admin/donations/:id # Approve/reject
GET    /api/admin/banks         # Get bank accounts
POST   /api/admin/banks         # Add bank account
PUT    /api/admin/banks/:id     # Update bank account
DELETE /api/admin/banks/:id     # Delete bank account
GET    /api/admin/users         # All users
PUT    /api/admin/users/:id     # Block/unblock user
```

### Payment
```
POST   /api/payment/verify      # Manual verify (admin)
GET    /api/payment/check/:id   # Check payment status
WEBHOOK /api/payment/webhook    # Bank webhook
```

## 💡 ฟีเจอร์เพิ่มเติม (Future Enhancements)

1. **Multiple Payment Methods**
   - PromptPay QR
   - Credit Card
   - TrueMoney Wallet
   - PayPal

2. **Gamification**
   - Badges for top donors
   - Leaderboard
   - Donation goals/milestones

3. **Advanced Analytics**
   - Peak donation times
   - Donor retention
   - Revenue forecasting

4. **Multi-Streamer Support**
   - Team donations
   - Split payments
   - Charity campaigns

5. **Mobile App**
   - React Native app
   - Push notifications
   - Quick donate widgets

6. **AI Features**
   - Fraud detection
   - Auto-moderation for messages
   - Smart suggestions for amounts

## 📝 การติดตั้งและใช้งาน

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# แก้ไขค่าใน .env (YouTube credentials, DB URI, etc.)
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### OBS Setup
1. เพิ่ม Browser Source
2. URL: `http://localhost:3000/overlay?streamerId=xxx`
3. Width: 1920, Height: 1080
4. Refresh browser เมื่อต้องการทดสอบ

## ⚠️ ข้อควรระวัง

1. **กฎหมายการเงิน** - ตรวจสอบกฎหมายเกี่ยวกับการรับบริจาคในประเทศไทย
2. **ภาษี** - รายได้จากการบริจาคอาจต้องเสียภาษี
3. **PDPA** - การเก็บข้อมูลผู้ใช้ต้องเป็นไปตาม PDPA
4. **Terms of Service** - YouTube API มีข้อกำหนดการใช้งาน
5. **Bank API Limits** - แต่ละธนาคารมี rate limit ต่างกัน

## 📄 License

MIT License - สามารถนำไปพัฒนาต่อได้ฟรี

---

**หมายเหตุ**: ระบบนี้เป็นโครงสร้างพื้นฐาน สำหรับการใช้งานจริงควรปรึกษาผู้เชี่ยวชาญด้านความปลอดภัยและการปฏิบัติตามกฎหมายทางการเงิน
