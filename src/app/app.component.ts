import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // 1. Import CommonModule เพิ่ม
import { Map, NavigationControl } from 'maplibre-gl';

@Component({
  selector: 'app-root',
  standalone: true, // 2. ต้องเพิ่มบรรทัดนี้ เพื่อบอกว่าเป็น Standalone Component
  imports: [CommonModule], // 3. นำเข้า CommonModule ที่นี่แทน NgModule
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  map: Map | undefined;



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
      zoom: 5
    });

    this.map.addControl(new NavigationControl(), 'top-right');
  }

  ngOnDestroy() {
    this.map?.remove();
  }
}