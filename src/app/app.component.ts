import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Map, NavigationControl } from 'maplibre-gl';

interface MapLayer {
  id: number;
  type: 'geojson' | 'csv' | 'api' | 'arcgis';
  name: string;
  name_en: string;
  path?: string;
  visible: boolean;
  icon?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  map: Map | undefined;

  basemapStyles: Record<'osm' | 'ghyb', any> = {
    // ... (คงเดิม)
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

  layers: MapLayer[] = [
    { id: 1, type: 'geojson', name: 'เขต', name_en: 'district', path: 'assets/geodata/district.geojson', visible: true },
    { id: 2, type: 'geojson', name: 'ถนน', name_en: 'road', path: 'assets/geodata/bma_road.geojson', visible: true },
    { id: 3, type: 'geojson', name: 'ทางจักรยาน', name_en: 'bike_way', path: 'assets/geodata/bike_way.geojson', visible: true },
    { id: 4, type: 'geojson', name: 'โรงเรียน', name_en: 'bma_school', path: 'assets/geodata/bma_school.geojson', visible: true, icon: 'school.png' },
    { id: 5, type: 'geojson', name: 'อาคาร', name_en: 'bma_building', path: 'assets/geodata/bma_building.geojson', visible: true },
  ];

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  initMap() {
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: this.basemapStyles.ghyb,
      center: [100.5018, 13.7563],
      zoom: 10,
    });
    this.map.addControl(new NavigationControl(), 'top-right');

    this.map.on('load', () => {
      // เปลี่ยนจาก drawAllLayers เป็น setupAllLayers (ทำครั้งเดียว)
      this.setupAllLayers();
    });
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  loadMapIcon(iconName: string, iconPath: string): Promise<void> {
    // ... (คงเดิม)
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

  // เปลี่ยนชื่อฟังก์ชัน และลบ Logic การ Remove ออก
  async setupAllLayers() {
    if (!this.map) return;

    // ไม่ต้องมี loop cleanup (removeLayer/removeSource) แล้ว เพราะเราจะทำแค่ครั้งเดียวตอน map load

    for (const layer of this.layers) {
      // *** เอาบรรทัด if (!layer.visible) continue; ออก ***
      // เราต้องโหลดทุก Layer เข้าไปก่อน แล้วค่อยไปสั่ง hide ใน property layout

      const sourceId = `${layer.name_en}-source`;
      const layerId = `${layer.name_en}-layer`;
      const visibilityState = layer.visible ? 'visible' : 'none'; // คำนวณค่าเริ่มต้น

      // โหลด Icon
      if (layer.icon) {
        try {
          await this.loadMapIcon(layer.name_en, `assets/images/${layer.icon}`);
        } catch (error) {
          console.error(`FAILED to load icon for ${layer.name_en}`, error);
        }
      }

      // Add Source (ทำครั้งเดียว ไม่ต้องเช็คซ้ำมากก็ได้เพราะรันใน on load)
      if (layer.path && !this.map.getSource(sourceId)) {
        this.map.addSource(sourceId, {
          type: 'geojson',
          data: layer.path
        });
      }

      console.log(`Setup layer: ${layer.name_en}`);

      // --- กำหนด Style ---
      if (layer.name_en === 'district') {
        // District Outline
        this.map.addLayer({
          id: `${layer.name_en}-outline-layer`,
          type: 'line',
          source: sourceId,
          layout: {
            'visibility': visibilityState // <--- ใส่บรรทัดนี้
          },
          paint: {
            'line-color': '#cc0000',
            'line-width': 1
          }
        });
      }

      else if (layer.name_en === 'road') {
        this.map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'visibility': visibilityState // <--- ใส่บรรทัดนี้
          },
          paint: {
            'line-color': '#fda00b',
            'line-width': 3
          }
        });
      }

      else if (layer.name_en === 'bike_way') {
        this.map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'visibility': visibilityState, // <--- ใส่บรรทัดนี้
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#2ecc71',
            'line-width': 2,
            'line-dasharray': [2, 2]
          }
        });
      }

      else if (layer.name_en === 'bma_school') {
        this.map.addLayer({
          id: layerId,
          type: 'symbol',
          source: sourceId,
          layout: {
            'visibility': visibilityState, // <--- ใส่บรรทัดนี้
            'icon-image': layer.name_en,
            'icon-size': 0.15,
            'icon-allow-overlap': true,
            'text-field': ['get', 'name'],
            'text-font': ['Sarabun-Regular'], // เช็คว่าโหลด font นี้มาจริงหรือยัง ถ้ายังให้เอาออกหรือใช้ default
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
      
      else if (layer.name_en === 'bma_building') {
        this.map.addLayer({
          id: layerId,
          type: 'fill-extrusion',
          source: sourceId,
          layout: {
             'visibility': visibilityState // <--- สำหรับ fill-extrusion ก็ใส่ใน layout ได้
          },
          paint: {
            'fill-extrusion-color': '#2282dc',
            'fill-extrusion-height': [
              'case',
              ['has', 'height'], ['get', 'height'],
              10
            ],
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.9
          }
        });
      }
    }

    // จัดลำดับ Layer (Z-Index)
    const layerOrder = [
      'district-layer', // ถ้ามี
      'district-outline-layer',
      'road-layer',
      'bike_way-layer',
      'bma_building-layer', // ตึกควรบังถนนและเส้น
      'bma_school-layer'    // icon ควรอยู่บนสุด
    ];

    layerOrder.forEach(id => {
      if (this.map?.getLayer(id)) {
        this.map.moveLayer(id);
      }
    });
  }

  // --- ฟังก์ชันใหม่: เปลี่ยนเฉพาะการมองเห็น ไม่โหลดใหม่ ---
  toggleLayer(id: number, event: any) {
    if (!this.map) return;
    
    const layer = this.layers.find(l => l.id === id);
    if (layer) {
      layer.visible = event.target.checked;
      const visibility = layer.visible ? 'visible' : 'none';

      // กรณีพิเศษ: District มีหลาย layer ย่อย หรือชื่อไม่ตรง pattern ปกติ
      if (layer.name_en === 'district') {
         // เช็คและ toggle ทีละตัวที่เกี่ยวข้อง
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
}