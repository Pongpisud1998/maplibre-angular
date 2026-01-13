
## 1. Prerequisites (สิ่งที่ต้องมี)

ก่อนเริ่มใช้งาน ตรวจสอบให้แน่ใจว่าคุณได้ติดตั้งเครื่องมือเหล่านี้แล้ว:

* [Node.js](https://nodejs.org/) (เวอร์ชัน LTS)
* [Angular CLI](https://angular.io/cli)

## 2. Installation (การติดตั้ง)

หลังจากสร้างโปรเจกต์ด้วยคำสั่ง `ng new maplibre-angular` แล้ว ให้ทำตามขั้นตอนดังนี้:

### 2.1 ติดตั้ง Library MapLibre GL

รันคำสั่งนี้ใน Terminal เพื่อติดตั้ง package:

```bash
npm install maplibre-gl

```

### 2.2 ตั้งค่า CSS (สำคัญ)

แผนที่จะไม่แสดงผลหากขาดไฟล์ CSS ของ MapLibre ให้เข้าไปที่ไฟล์ `angular.json` แล้วเพิ่ม path ในส่วนของ `styles`:

```json
"architect": {
  "build": {
    "options": {
      "styles": [
        "src/styles.scss",
        "node_modules/maplibre-gl/dist/maplibre-gl.css"
      ],
      // ...
    }
  }
}

```

*(หมายเหตุ: หากมีการแก้ไขไฟล์ `angular.json` ต้องหยุดและรัน `ng serve` ใหม่)*

---

## 3. Usage Example (ตัวอย่างการใช้งาน)

ตัวอย่างการสร้าง Component แผนที่อย่างง่าย

### 3.1 สร้าง Container ใน HTML

ไฟล์: `src/app/app.component.html`

```html
<div class="map-container" #map></div>

```

### 3.2 กำหนดขนาดแผนที่

ไฟล์: `src/app/app.component.scss` (ต้องกำหนดความสูง ไม่งั้นแผนที่จะไม่ขึ้น)

```scss
.map-container {
  width: 100%;
  height: 100vh; /* เต็มความสูงหน้าจอ */
  position: absolute;
  top: 0;
  left: 0;
}

```

### 3.3 เขียน Logic การเรียกแผนที่

ไฟล์: `src/app/app.component.ts`

```typescript
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Map, NavigationControl } from 'maplibre-gl';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  map: Map | undefined;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  ngAfterViewInit() {
    // เริ่มต้นสร้างแผนที่
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      // ใช้ Demo Style ของ MapLibre (ไม่ต้องใช้ Key)
      style: 'https://demotiles.maplibre.org/style.json', 
      center: [100.5018, 13.7563], // พิกัดเริ่มต้น (กรุงเทพฯ)
      zoom: 10
    });

    // เพิ่มปุ่ม Zoom เข้า/ออก
    this.map.addControl(new NavigationControl(), 'top-right');
  }

  ngOnDestroy() {
    // ล้างค่าเมื่อ Component ถูกทำลายเพื่อป้องกัน Memory Leak
    this.map?.remove();
  }
}

```

---

## 4. Development Server

รันโปรเจกต์เพื่อดูผลลัพธ์:

```bash
ng serve

```

เปิด Browser ไปที่ `http://localhost:4200/` คุณควรจะเห็นแผนที่แสดงขึ้นมา

---

## Resources

* [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js/docs/)
* [Angular Documentation](https://angular.io/docs)

---

### สิ่งที่เพิ่มเติมให้ใน README นี้:

1. **CSS Setup:** ขั้นตอนนี้สำคัญที่สุด เพราะมือใหม่มักลืม import CSS ทำให้แผนที่พัง
2. **Lifecycle Hook (`ngAfterViewInit`):** แนะนำให้เรียกแผนที่ใน `ngAfterViewInit` แทน `ngOnInit` เพื่อให้มั่นใจว่า DOM (Element `<div>`) ถูกสร้างเสร็จแล้ว
3. **Cleanup (`ngOnDestroy`):** เพิ่ม Best practice ในการ remove map เพื่อไม่ให้กิน Ram เวลาสลับหน้า
