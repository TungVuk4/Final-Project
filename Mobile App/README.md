# 📱 FashionStyle Mobile App — Hướng Dẫn Toàn Tập

> **Mục tiêu:** Tạo một ứng dụng Android/iOS hiển thị đúng website FashionStyle của bạn.

---

## 📋 Yêu Cầu Trước Khi Bắt Đầu

Cài đặt các phần mềm sau (nếu chưa có):

| Phần mềm | Tải ở đâu | Để làm gì |
|---|---|---|
| **Node.js 18+** | https://nodejs.org | Chạy React Native |
| **Android Studio** | https://developer.android.com/studio | Tạo máy ảo Android (Emulator) |
| **JDK 17** | https://adoptium.net | Android cần Java |

---

## 🛠️ BƯỚC 1 — Tạo Project React Native Mới

> ✅ **Đã hoàn thành!** Project đã được khởi tạo sẵn tại:
> `d:\Final Project\FashionStyleApp`

Nếu muốn tạo lại từ đầu:

```powershell
cd "d:\Final Project"
npx @react-native-community/cli@latest init FashionStyleApp
```

---

## 📂 BƯỚC 2 — Copy File Source Code Vào Project

Copy các file đã có sẵn vào project:

```powershell
# Copy file App.tsx (ghi đè file App.tsx mặc định)
Copy-Item "d:\Final Project\Mobile App\App.tsx"   "d:\Final Project\FashionStyleApp\App.tsx" -Force

# Copy file config.ts
Copy-Item "d:\Final Project\Mobile App\config.ts"  "d:\Final Project\FashionStyleApp\config.ts" -Force
```

> ✅ **Đã hoàn thành!** 2 file này đã được copy sẵn vào `FashionStyleApp`.

---

## 📦 BƯỚC 3 — Cài Thư Viện WebView

```powershell
cd "d:\Final Project\FashionStyleApp"
npm install react-native-webview
```

> ✅ **Đã hoàn thành!** `react-native-webview` đã được cài.

---

## ⚙️ BƯỚC 4 — Cấu Hình Máy Ảo Android (Emulator)

1. Mở **Android Studio**
2. Vào menu **Tools → Device Manager**
3. Nhấn **Create Virtual Device**
4. Chọn máy ảo (VD: `Pixel 7`, API 34) → nhấn **Finish**
5. Nhấn nút **▶ Start** để bật máy ảo lên

> ✅ Khi màn hình máy ảo hiện ra là OK.

---

## 🚀 BƯỚC 5 — Chạy App Trên Máy Ảo

> Mở **2 cửa sổ PowerShell riêng biệt**.

**Cửa sổ 1 — Khởi động Metro Bundler (bộ biên dịch JS):**
```powershell
cd "d:\Final Project\FashionStyleApp"
npx react-native start
```
Chờ đến khi thấy dòng `Metro waiting on...` là OK.

**Cửa sổ 2 — Cài và chạy App lên máy ảo:**
```powershell
cd "d:\Final Project\FashionStyleApp"
npx react-native run-android
```
> Lần đầu chạy sẽ mất **5–10 phút** để build. Những lần sau nhanh hơn.

✅ **Kết quả:** App mở trên máy ảo và hiển thị website FashionStyle của bạn!

---

## 🌐 BƯỚC 6 — Chạy Trên Điện Thoại Thật (Tùy Chọn)

Vì điện thoại thật không thể truy cập `localhost`, cần tạo **Public URL** bằng ngrok.

### 6.1 — Cài ngrok

```powershell
# Tải bản Windows tại: https://ngrok.com/download
# Giải nén → copy ngrok.exe vào C:\Windows\System32 (để dùng ở bất kỳ đâu)

# Đăng ký tài khoản miễn phí tại https://ngrok.com
# Lấy Auth Token trong Dashboard → chạy lệnh sau:
ngrok config add-authtoken <DÁN_AUTH_TOKEN_CỦA_BẠN_VÀO_ĐÂY>
```

### 6.2 — Tạo 2 Tunnel (Mở 2 cửa sổ Terminal)

```powershell
# Cửa sổ 1: Tunnel cho Web chính (Port 5173)
ngrok http 5173

# Cửa sổ 2: Tunnel cho Backend API (Port 8080)  
ngrok http 8080
```

Ngrok sẽ hiện 2 URL dạng `https://abc123.ngrok-free.app`. **Copy lại** 2 URL đó.

### 6.3 — Cập Nhật config.ts

Mở file `d:\Final Project\MobileApp\config.ts` và thay URL:

```typescript
// Thay dòng này bằng URL ngrok của Port 5173
export const WEB_URL = 'https://abc123.ngrok-free.app';

// Thay dòng này bằng URL ngrok của Port 8080
export const API_URL  = 'https://xyz789.ngrok-free.app';
```

### 6.4 — Cập Nhật Web Chính Để Gọi Đúng Backend

Mở `d:\Final Project\Page Web Chinh\src\axios\custom.ts`, tìm `baseURL` và đổi tạm thành:

```typescript
baseURL: 'https://xyz789.ngrok-free.app/api',
```

> ⚠️ Nhớ đổi lại `http://localhost:8080/api` sau khi test xong trên điện thoại.

### 6.5 — Cắm Điện Thoại Và Chạy

```powershell
# Bật USB Debugging trên điện thoại:
# Cài đặt → Giới thiệu về điện thoại → Nhấn "Số bản dựng" 7 lần
# → Tuỳ chọn nhà phát triển → Bật "USB Debugging"

# Cắm cáp USB vào máy tính → chọn "Transfer files"
# Kiểm tra điện thoại được nhận diện:
adb devices

# Chạy app lên điện thoại:
cd "d:\Final Project\FashionStyleApp"
npx react-native run-android
```

---

## ❓ Lỗi Thường Gặp

| Lỗi | Cách sửa |
|---|---|
| `SDK location not found` | Mở Android Studio → SDK Manager → Copy đường dẫn SDK → Tạo file `local.properties` trong `android/` với nội dung `sdk.dir=C:\\Users\\TEN\\AppData\\Local\\Android\\Sdk` |
| `Metro bundler not running` | Đảm bảo Cửa sổ 1 đang chạy `npx react-native start` |
| `Could not connect to development server` | Tắt Firewall tạm thời, hoặc đảm bảo máy tính và điện thoại cùng WiFi |
| App hiện trắng / không load | Kiểm tra `config.ts` — URL có đúng không? Web Chính có đang chạy không? |

---

## 📊 Tóm Tắt Luồng Chạy

```
1. Chạy Backend:       cd "Backend Project"             &&  npm run dev   (Port 8080)
2. Chạy Web Chính:     cd "Page Web Chinh"              &&  npm run dev   (Port 5173)
3. Chạy Metro:         cd "d:\Final Project\FashionStyleApp"  &&  npx react-native start
4. Chạy App Android:   cd "d:\Final Project\FashionStyleApp"  &&  npx react-native run-android
```

> 💡 Lần đầu tiên build Android mất 5–10 phút là bình thường. Hãy chờ kiên nhẫn!

---

## 🎨 TÍNH NĂNG NÂNG CAO — Splash Screen (Màn Hình Khởi Động)

> Hiển thị Logo của hàng khi mở App, tự động biến mất sau khi Website tải xong.

### A. Cài Thư Viện

```powershell
npm install react-native-bootsplash
```

### B. Tạo Assets Tự Động

Chuẩn bị file `logo.png` (tối thiểu 500×500px), sau đó chạy:

```powershell
npx react-native generate-bootsplash logo.png `
  --background-color="#ffffff" `
  --logo-width=200 `
  --assets-output=assets/bootsplash `
  --flavor=main
```

> ✅ Lệnh này tự copy ảnh vào đúng thư mục `android/res/` và `ios/` — không cần làm thủ công.

---

### C. Cấu Hình Android

#### C1. Mở file: `android/app/src/main/res/values/styles.xml`

Thêm theme Splash trong thẻ `<resources>`:

```xml
<resources>
    <!-- Theme mặc định App (giữ nguyên) -->
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>
    </style>

    <!-- ✅ Thêm đoạn này — Theme Splash trắng #ffffff -->
    <style name="BootTheme" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">#ffffff</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/bootsplash_logo</item>
        <item name="postSplashScreenTheme">@style/AppTheme</item>
    </style>
</resources>
```

#### C2. Mở file `android/app/src/main/java/.../MainActivity.kt`

```kotlin
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.zoontek.rnbootsplash.RNBootSplash  // ✅ Thêm import này

class MainActivity : ReactActivity() {
  override fun getMainComponentName(): String = "MobileApp"

  // ✅ Thêm hàm này để đăng ký Splash
  override fun onCreate(savedInstanceState: Bundle?) {
    RNBootSplash.init(this, R.style.BootTheme)
    super.onCreate(savedInstanceState)
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
```

---

### D. Cấu Hình iOS (chỉ trên macOS)

1. Mở **Xcode** → File `LaunchScreen.storyboard`.
2. Xóa hết nội dung mặc định (label chữ "MobileApp").
3. Thêm **UIImageView** vào giữa màn hình, chọn file `bootsplash_logo.png`.
4. Đặt **Background Color** = `#ffffff`.
5. Thêm constraints: **Centered H + V**, Width = **200pt**.
6. Chạy `cd ios && pod install && cd ..`

---

### E. Cập Nhật App.tsx — Tích Hợp Logic Ẩn Splash

Mở `App.tsx`, thêm import và sựa hàm `onLoad`:

```typescript
import RNBootSplash from 'react-native-bootsplash'; // ✅ Thêm dòng này

// Bên trong component App:
// ✅ Hàm này được gọi khi WebView tải xong — Splash sẽ tắt
const handleWebViewLoaded = () => {
  RNBootSplash.hide({ fade: true }); // fade: true = ẩn mượt mà
};

// Thêm prop onLoad vào WebView:
<WebView
  ...
  onLoad={handleWebViewLoaded}  {/* ✅ Gọn Splash sau khi web tải */}
/>
```

---

### F. Kết Quả Chuỗi Khởi Động

```
Nhấn icon App
      ↓
Splash Screen hiện ra (Logo trên nền trắng #ffffff)
      ↓
WebView tải website ngầm bên dưới
      ↓
Website tải xong → onLoad() được gọi
      ↓
RNBootSplash.hide() → Splash mờ dần biến mất ✅
      ↓
Website FashionStyle hiện ra đầy đủ ✨
```

> 💡 **Tip báo cáo:** Splash Screen giải quyết vấn đề **"màn hình trắng"** khi WebView đang khởi tạo — đây là điểm trừ phổ biến nhất của kiến trúc WebView. `react-native-bootsplash` giải quyết nó chuyên nghiệp nhất.
