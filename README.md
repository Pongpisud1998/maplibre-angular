
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
import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // 1. Import CommonModule เพิ่ม
import { Map, NavigationControl } from 'maplibre-gl';

@Component({
  selector: 'app-root',
  standalone: true, //
  imports: [CommonModule], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  map: Map | undefined;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  initMap() {
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [100.5018, 13.7563],
      zoom: 10
    });

    this.map.addControl(new NavigationControl(), 'top-right');
  }

  ngOnDestroy() {
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


## 5. Custom Base Map
ก่อนอื่นให้ประกาศตัวแปร basemapStyle ขึ้นมาก่อน 
```typescript

  basemapStyles: Record<'osm' | 'ghyb', any> = {
    osm: {
      version: 8,
      glyphs: '/assets/glyphs/{fontstack}/{range}.pbf',
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256
        }
      },
      layers: [{ id: 'osm-layer', type: 'raster', source: 'osm-tiles' }]
    },
    ghyb: {
      version: 8,
      glyphs: '/assets/glyphs/{fontstack}/{range}.pbf',
      sources: {
        'google-hybrid': {
          type: 'raster',
          tiles: ['https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'],
          tileSize: 256
        }
      },
      layers: [{ id: 'google-layer', type: 'raster', source: 'google-hybrid' }]
    }
  };
```
หลังจากนั้นให้เรียกใช้ basemapStyle ใน function initMap
```
  initMap() {
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: this.basemapStyles.ghyb,
      center: [100.5018, 13.7563],
      zoom: 5
    });

    this.map.addControl(new NavigationControl(), 'top-right');
  }
```

