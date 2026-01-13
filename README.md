
## 1. Prerequisites (สิ่งที่ต้องมี)

ก่อนเริ่มใช้งาน ตรวจสอบให้แน่ใจว่าคุณได้ติดตั้งเครื่องมือเหล่านี้แล้ว:

* [Node.js](https://nodejs.org/) (เวอร์ชัน LTS)
* [Angular CLI](https://angular.io/cli)

Link ASSET DATA : https://drive.google.com/file/d/1y2Cse4Dja6cyq2IL8nSZcDpE6eFAjhB8/view?usp=sharing

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


นี่คือเนื้อหาสำหรับไฟล์ `README.md` ที่ปรับปรุงใหม่ครับ โดยผมได้แก้ไข **Section 5** และ **Section 6** ให้ตรงกับ Logic ใน `app.component.ts` ของคุณ (เปลี่ยนจาก `drawAllLayers` ที่ลบแล้วสร้างใหม่ เป็น `setupAllLayers` ที่โหลดครั้งเดียวแล้วสลับ `visibility`)

คุณสามารถ Copy ส่วนนี้ไปทับ Section 5 และ 6 เดิมในไฟล์ README ได้เลยครับ

---

## 5. Custom Base Map (การกำหนดแผนที่พื้นฐาน)

ส่วนนี้จะจัดการเรื่อง Source ของแผนที่ (เช่น Google Hybrid หรือ OSM)

### 5.1 ประกาศตัวแปร Style

ในไฟล์ `src/app/app.component.ts` ให้ประกาศตัวแปร `basemapStyles` :

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

### 5.2 เรียกใช้ใน initMap

แก้ไขฟังก์ชัน `initMap` ให้ใช้ Style จากตัวแปรที่ประกาศไว้ และเรียก `setupAllLayers` เมื่อแผนที่โหลดเสร็จ

```typescript
initMap() {
  this.map = new Map({
    container: this.mapContainer.nativeElement,
    style: this.basemapStyles.ghyb, // เลือกใช้ Google Hybrid
    center: [100.5018, 13.7563],
    zoom: 10,
  });
  this.map.addControl(new NavigationControl(), 'top-right');

  // Event เมื่อแผนที่โหลดเสร็จ ให้เริ่มโหลด Layer อื่นๆ ต่อทันที
  this.map.on('load', () => {
    this.setupAllLayers();
  });
}

```

---

## 6. Advanced Layer Management (การจัดการ Layer แบบมีประสิทธิภาพ)

ส่วนนี้ใช้เทคนิค **"Load Once, Toggle Visibility"** คือโหลดข้อมูลทั้งหมดลงแผนที่เพียงครั้งเดียว แล้วใช้การซ่อน/แสดง (CSS Visibility) แทนการลบแล้ววาดใหม่ ซึ่งจะช่วยให้ประสิทธิภาพดีขึ้นมากเวลาผู้ใช้กดเปิด-ปิด Layer บ่อยๆ

### 6.1 เตรียม Configuration

ในไฟล์ `src/app/app.component.ts`

```typescript
// Interface
interface MapLayer {
  id: number;
  type: 'geojson' | 'csv' | 'api' | 'arcgis';
  name: string;
  name_en: string; // ใช้เป็น key สำหรับอ้างอิง ID ใน Map
  path?: string;
  visible: boolean;
  icon?: string;
}

// Data Config (ตัวอย่างข้อมูล)
layers: MapLayer[] = [
  { id: 1, type: 'geojson', name: 'เขต', name_en: 'district', path: 'assets/geodata/district.geojson', visible: true },
  { id: 2, type: 'geojson', name: 'ถนน', name_en: 'road', path: 'assets/geodata/bma_road.geojson', visible: true },
  { id: 3, type: 'geojson', name: 'ทางจักรยาน', name_en: 'bike_way', path: 'assets/geodata/bike_way.geojson', visible: true },
  { id: 4, type: 'geojson', name: 'โรงเรียน', name_en: 'bma_school', path: 'assets/geodata/bma_school.geojson', visible: true, icon: 'school.png' },
  { id: 5, type: 'geojson', name: 'อาคาร', name_en: 'bma_building', path: 'assets/geodata/bma_building.geojson', visible: true },
];

```

### 6.2 สร้างฟังก์ชัน `setupAllLayers`

ฟังก์ชันนี้จะทำงาน **ครั้งเดียว** ตอนโหลดหน้าเว็บ เพื่อ Loop สร้าง Source และ Layer ทั้งหมดเตรียมรอไว้

```typescript
async setupAllLayers() {
  if (!this.map) return;

  for (const layer of this.layers) {
    const sourceId = `${layer.name_en}-source`;
    const layerId = `${layer.name_en}-layer`;
    const visibilityState = layer.visible ? 'visible' : 'none'; // กำหนดค่าเริ่มต้น

    // 1. โหลด Icon (ถ้ามี)
    if (layer.icon) {
      try {
        await this.loadMapIcon(layer.name_en, `assets/images/${layer.icon}`);
      } catch (error) {
        console.error(`FAILED to load icon for ${layer.name_en}`, error);
      }
    }

    // 2. Add Source (ทำครั้งเดียว ไม่ต้อง remove ออก)
    if (layer.path && !this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, {
        type: 'geojson',
        data: layer.path
      });
    }

    console.log(`Setup layer: ${layer.name_en}`);

    // 3. กำหนด Style แยกตามประเภท (และใส่ layout: visibility)
    
    // ตัวอย่าง: เขต (มีเส้นขอบแยก)
    if (layer.name_en === 'district') {
      this.map.addLayer({
        id: `${layer.name_en}-outline-layer`,
        type: 'line',
        source: sourceId,
        layout: { 'visibility': visibilityState }, // <--- สำคัญ
        paint: { 'line-color': '#cc0000', 'line-width': 1 }
      });
      // (อาจจะมี district-layer แบบ fill ด้วยก็ได้ตามต้องการ)
    }

    // ตัวอย่าง: ถนน
    else if (layer.name_en === 'road') {
      this.map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: { 'visibility': visibilityState },
        paint: { 'line-color': '#fda00b', 'line-width': 3 }
      });
    }

    // ตัวอย่าง: โรงเรียน (Symbol/Icon)
    else if (layer.name_en === 'bma_school') {
      this.map.addLayer({
        id: layerId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'visibility': visibilityState,
          'icon-image': layer.name_en, // ชื่อเดียวกับที่โหลดใน loadMapIcon
          'icon-size': 0.15,
          'icon-allow-overlap': true,
          'text-field': ['get', 'name'],
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-size': 12
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
        }
      });
    }
    
    // ... (Layer ประเภทอื่นๆ เช่น fill-extrusion)
  }

  // 4. จัดลำดับ Layer (Z-Index)
  const layerOrder = [
    'district-layer',
    'district-outline-layer',
    'road-layer',
    'bike_way-layer',
    'bma_building-layer', // ตึกบังถนน
    'bma_school-layer'    // Icon อยู่บนสุด
  ];

  layerOrder.forEach(id => {
    if (this.map?.getLayer(id)) {
      this.map.moveLayer(id);
    }
  });
}

```

### 6.3 Helper Function (สำหรับโหลด Icon แบบ Angular)

ใช้ `new Image()` ซึ่งจัดการกับ Asset path ของ Angular ได้ดี

```typescript
loadMapIcon(iconName: string, iconPath: string): Promise<void> {
  return new Promise((resolve) => {
    if (!this.map) { resolve(); return; }
    if (this.map.hasImage(iconName)) { resolve(); return; }

    const img = new Image();
    img.onload = () => {
      if (!this.map?.hasImage(iconName)) {
        this.map?.addImage(iconName, img);
        console.log(`[Success] Loaded icon: ${iconName}`);
      }
      resolve();
    };
    img.onerror = (error) => {
      console.error(`[Error] Could not load image: ${iconPath}`, error);
      resolve();
    };
    img.src = iconPath;
  });
}

```

### 6.4 การ Toggle Layer (เปิด-ปิด)

เมื่อผู้ใช้คลิก Checkbox เราจะเรียกฟังก์ชันนี้เพื่อเปลี่ยน `visibility` ทันทีโดยไม่ต้องโหลดข้อมูลใหม่

```typescript
// ใน HTML: <input type="checkbox" (change)="toggleLayer(layer.id, $event)" [checked]="layer.visible">

toggleLayer(id: number, event: any) {
  if (!this.map) return;
  
  const layer = this.layers.find(l => l.id === id);
  if (layer) {
    layer.visible = event.target.checked;
    const visibility = layer.visible ? 'visible' : 'none';

    // กรณีพิเศษ: Layer ที่ซับซ้อน (เช่น District มีทั้งเส้นและพื้น)
    if (layer.name_en === 'district') {
       if (this.map.getLayer('district-outline-layer')) {
          this.map.setLayoutProperty('district-outline-layer', 'visibility', visibility);
       }
       if (this.map.getLayer('district-layer')) {
          this.map.setLayoutProperty('district-layer', 'visibility', visibility);
       }
    } 
    // กรณีทั่วไป
    else {
      const layerId = `${layer.name_en}-layer`;
      if (this.map.getLayer(layerId)) {
        this.map.setLayoutProperty(layerId, 'visibility', visibility);
      }
    }
  }
}

```
