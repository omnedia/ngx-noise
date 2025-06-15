import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'om-noise',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ngx-noise.component.html',
  styleUrl: './ngx-noise.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxNoiseComponent implements AfterViewInit, OnDestroy {
  @ViewChild('OmNoiseWrapper') noiseWrapperRef!: ElementRef<HTMLElement>;
  @ViewChild('OmNoiseCanvas') noiseCanvasRef!: ElementRef<HTMLCanvasElement>;

  @Input()
  set patternSize(val: number) {
    this.patternSizeSignal.set(val);

    if (this.initialized) {
      this.setupCanvas();
    }
  }

  @Input()
  set patternScaleX(val: number) {
    this.patternScaleXSignal.set(val);

    if (this.initialized) {
      this.setupCanvas();
    }
  }

  @Input()
  set patternScaleY(val: number) {
    this.patternScaleYSignal.set(val);

    if (this.initialized) {
      this.setupCanvas();
    }
  }

  @Input()
  set patternRefreshInterval(val: number) {
    this.patternRefreshIntervalSignal.set(val);

    if (this.initialized) {
      this.setupCanvas();
    }
  }

  @Input()
  set patternAlpha(val: number) {
    this.patternAlphaSignal.set(val);

    if (this.initialized) {
      this.setupCanvas();
    }
  }

  @Input()
  set color(color: string) {
    this.parseCssColor(color);

    if (this.initialized) {
      this.setupCanvas();
    }
  }

  patternSizeSignal = signal(250);
  patternScaleXSignal = signal(1);
  patternScaleYSignal = signal(1);
  patternRefreshIntervalSignal = signal(2);
  patternAlphaSignal = signal(50);

  private colorRgb: [number, number, number] = [255, 255, 255];

  private patternCanvas?: HTMLCanvasElement;
  private patternData?: ImageData;
  private patternPixelDataLength?: number;
  private frame = 0;
  private animationFrameId?: number;

  private initialized = false;
  private running = false;

  isInView = signal(false);
  private intersectionObserver?: IntersectionObserver;
  private resizeListener?: () => void;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngAfterViewInit() {
    this.setupCanvas();

    if (isPlatformBrowser(this.platformId)) {
      this.intersectionObserver = new IntersectionObserver(([entry]) => {
        const wasInView = this.isInView();
        this.isInView.set(entry.isIntersecting);

        if (!wasInView && this.isInView()) {
          this.running = true;
          this.animate();
        }

        if (wasInView && !this.isInView()) {
          this.running = false;

          if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = undefined;
          }
        }
      });

      this.intersectionObserver.observe(this.noiseWrapperRef.nativeElement);
    }
  }

  ngOnDestroy() {
    this.running = false;
    if (this.resizeListener) window.removeEventListener('resize', this.resizeListener);

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  setupCanvas(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const canvas = this.noiseCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const patternSize = this.patternSizeSignal();
    this.patternCanvas = document.createElement('canvas');
    this.patternCanvas.width = patternSize;
    this.patternCanvas.height = patternSize;
    const patternCtx = this.patternCanvas.getContext('2d');
    if (!patternCtx) return;
    this.patternData = patternCtx.createImageData(patternSize, patternSize);
    this.patternPixelDataLength = patternSize * patternSize * 4;

    const resize = () => {
      const {width, height} = this.noiseWrapperRef.nativeElement.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(this.patternScaleXSignal(), this.patternScaleYSignal());
    };

    if (!this.resizeListener) {
      this.resizeListener = () => resize();
      window.addEventListener('resize', this.resizeListener);
    }

    resize();

    this.initialized = true;

    if (this.running) {
      return;
    }

    this.running = true;
    this.animate();
  }

  private parseCssColor(str: string): void {
    const ctx = document.createElement('canvas').getContext('2d')!;
    ctx.fillStyle = str;
    const computed = ctx.fillStyle as string;

    if (computed.startsWith('#') && computed.length === 7) {
      this.colorRgb = [
        parseInt(computed.slice(1, 3), 16),
        parseInt(computed.slice(3, 5), 16),
        parseInt(computed.slice(5, 7), 16)
      ];
      return;
    }

    const rgb = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (rgb) {
      this.colorRgb = [+rgb[1], +rgb[2], +rgb[3]];
      return;
    }

    const rgba = computed.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(.+)\)$/);
    if (rgba) {
      this.colorRgb = [+rgba[1], +rgba[2], +rgba[3]];
      return;
    }

    this.colorRgb = [255, 255, 255]; // fallback to white
  }


  private animate = () => {
    if (!this.running) return;

    if (this.frame % this.patternRefreshIntervalSignal() === 0) {
      this.updatePattern();
      this.drawGrain();
    }

    this.frame++;

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private drawGrain = () => {
    const canvas = this.noiseCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.patternCanvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = ctx.createPattern(this.patternCanvas, 'repeat')!;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  private updatePattern = () => {
    const patternCtx = this.patternCanvas?.getContext('2d');
    if (!patternCtx || !this.patternPixelDataLength || !this.patternData) return;

    const [r, g, b] = this.colorRgb;
    const alpha = this.patternAlphaSignal();
    for (let i = 0; i < this.patternPixelDataLength; i += 4) {
      const value = Math.random() * 255 / 255;
      this.patternData.data[i] = r * value;
      this.patternData.data[i + 1] = g * value;
      this.patternData.data[i + 2] = b * value;
      this.patternData.data[i + 3] = alpha;
    }
    patternCtx.putImageData(this.patternData, 0, 0);
  };
}
