import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  input,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

interface BpmnCanvas {
  zoom(level?: number): number;
  zoom(value: 'fit-viewport', center?: { x: number; y: number }): number;
  viewbox(): BpmnViewbox;
  resized(): void;
}

interface BpmnViewbox {
  inner: {
    width: number;
    height: number;
  };
  outer: {
    width: number;
    height: number;
  };
}

function isBpmnCanvas(obj: unknown): obj is BpmnCanvas {
  return typeof obj === 'object' && obj !== null && 'zoom' in obj;
}

@Component({
  selector: 'app-backoffice-bpmn-viewer',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './backoffice-bpmn-viewer.component.html',
  styleUrl: './backoffice-bpmn-viewer.component.scss',
  host: {
    '(document:fullscreenchange)': 'handleFullscreenChange()',
  },
})
export class BackofficeBpmnViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly xml = input<string | null>(null);
  readonly title = input('Visualize the BPMN diagram');
  readonly subtitle = input('Use the controls to fit, zoom, and inspect the latest model.');
  readonly emptyMessage = input('Select a BPMN asset to visualise.');
  @ViewChild('canvas') private readonly canvas?: ElementRef<HTMLDivElement>;
  @ViewChild('stage') private readonly stage?: ElementRef<HTMLDivElement>;

  private viewer: BpmnViewer | null = null;
  private renderRequestToken = 0;
  private wasStageFullscreen = false;

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canFullscreen =
    typeof document !== 'undefined' && !!document.documentElement.requestFullscreen;

  get showStatePanel(): boolean {
    return this.loading() || !!this.errorMessage() || !this.xml();
  }

  ngAfterViewInit(): void {
    void this.renderDiagram();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['xml']) {
      void this.renderDiagram();
    }
  }

  ngOnDestroy(): void {
    this.viewer?.destroy();
    this.viewer = null;
  }

  protected zoom(delta: number): void {
    const canvas = this.viewer?.get('canvas');

    if (!canvas || !isBpmnCanvas(canvas)) {
      return;
    }

    const currentZoom = canvas.zoom();
    const nextZoom = currentZoom + delta;
    const fitZoom = this.getFitViewportZoom(canvas);

    if (delta < 0 && fitZoom !== null && nextZoom <= fitZoom + 0.001) {
      this.fitViewport();
      return;
    }

    canvas.zoom(nextZoom);
  }

  protected fitViewport(): void {
    const canvas = this.viewer?.get('canvas');
    const center = this.getViewportCenter();

    if (canvas && isBpmnCanvas(canvas)) {
      canvas.zoom('fit-viewport', center);
    }
  }

  protected async toggleFullscreen(): Promise<void> {
    if (!this.stage?.nativeElement || !this.canFullscreen) {
      return;
    }

    if (this.isStageFullscreen()) {
      await document.exitFullscreen();
      return;
    }

    await this.stage.nativeElement.requestFullscreen();
  }

  protected handleFullscreenChange(): void {
    const isStageFullscreen = this.isStageFullscreen();

    if (isStageFullscreen || this.wasStageFullscreen) {
      this.scheduleFitViewport();
    }

    this.wasStageFullscreen = isStageFullscreen;
  }

  private async renderDiagram(): Promise<void> {
    if (!this.canvas?.nativeElement) {
      return;
    }

    const xml = this.xml();

    if (!xml) {
      this.loading.set(false);
      this.errorMessage.set(this.emptyMessage());
      return;
    }

    const requestToken = ++this.renderRequestToken;
    this.loading.set(true);
    this.errorMessage.set(null);

    this.viewer ??= new BpmnViewer({
      container: this.canvas.nativeElement,
    });

    try {
      await this.viewer.importXML(xml);

      if (requestToken !== this.renderRequestToken) {
        return;
      }

      this.fitViewport();
      this.loading.set(false);
      this.errorMessage.set(null);
    } catch {
      if (requestToken !== this.renderRequestToken) {
        return;
      }

      this.loading.set(false);
      this.errorMessage.set('The BPMN diagram could not be rendered.');
    }
  }

  private getViewportCenter(): { x: number; y: number } | undefined {
    const stage = this.stage?.nativeElement;

    if (!stage || !stage.clientWidth || !stage.clientHeight) {
      return undefined;
    }

    return {
      x: stage.clientWidth / 2,
      y: stage.clientHeight / 2,
    };
  }

  private getFitViewportZoom(canvas: BpmnCanvas): number | null {
    const viewbox = canvas.viewbox();
    const { inner, outer } = viewbox;

    if (!inner.width || !inner.height || !outer.width || !outer.height) {
      return null;
    }

    return Math.min(1, outer.width / inner.width, outer.height / inner.height);
  }

  private scheduleFitViewport(): void {
    const rerenderViewport = () => {
      const canvas = this.viewer?.get('canvas');

      if (canvas && isBpmnCanvas(canvas)) {
        canvas.resized();
      }

      this.fitViewport();
    };

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => requestAnimationFrame(rerenderViewport));
      return;
    }

    rerenderViewport();
  }

  private isStageFullscreen(): boolean {
    return !!this.stage?.nativeElement && document.fullscreenElement === this.stage.nativeElement;
  }
}
