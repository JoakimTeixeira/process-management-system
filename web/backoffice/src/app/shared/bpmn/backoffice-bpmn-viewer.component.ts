import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

interface BackofficeCanvasAdapter {
  zoom(level?: number | 'fit-viewport', center?: { x: number; y: number }): number;
  viewbox(): {
    inner: { width: number; height: number };
    outer: { width: number; height: number };
  };
  resized(): void;
}

@Component({
  selector: 'app-backoffice-bpmn-viewer',
  imports: [MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './backoffice-bpmn-viewer.component.html',
  styleUrl: './backoffice-bpmn-viewer.component.scss',
  host: {
    '(document:fullscreenchange)': 'handleFullscreenChange()',
  },
})
export class BackofficeBpmnViewerComponent implements OnDestroy {
  readonly xml = input<string | null>(null);
  readonly title = input('Visualize the BPMN diagram');
  readonly subtitle = input('Use the controls to fit, zoom, and inspect the latest model.');
  readonly emptyMessage = input('Select a BPMN asset to visualise.');
  private readonly canvas = viewChild<ElementRef<HTMLDivElement>>('canvas');
  private readonly stage = viewChild<ElementRef<HTMLDivElement>>('stage');

  private viewer: BpmnViewer | null = null;
  private renderSequence = 0;
  private hadStageFullscreen = false;

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  private readonly statePanelVisible = computed(
    () => this.loading() || Boolean(this.errorMessage()) || !this.xml(),
  );
  protected readonly canFullscreen =
    typeof document !== 'undefined' && typeof document.documentElement.requestFullscreen === 'function';

  constructor() {
    effect(() => {
      const container = this.canvas()?.nativeElement;
      const sourceXml = this.xml();
      const fallbackMessage = this.emptyMessage();
      if (container) {
        void this.renderMarkup(container, sourceXml, fallbackMessage);
      }
    });
  }

  get showStatePanel(): boolean {
    return this.statePanelVisible();
  }

  ngOnDestroy(): void {
    this.viewer?.destroy();
    this.viewer = null;
  }

  protected zoom(delta: number): void {
    const adapter = this.resolveCanvas();
    if (!adapter) {
      return;
    }

    const targetLevel = adapter.zoom() + delta;
    const { inner, outer } = adapter.viewbox();
    const fitRatio =
      inner.width > 0 && inner.height > 0 && outer.width > 0 && outer.height > 0
        ? Math.min(1, outer.width / inner.width, outer.height / inner.height)
        : null;

    if (delta < 0 && fitRatio !== null && targetLevel <= fitRatio + 0.001) {
      this.fitViewport();
      return;
    }

    adapter.zoom(targetLevel);
  }

  protected fitViewport(): void {
    const adapter = this.resolveCanvas();
    if (!adapter) {
      return;
    }
    const element = this.stage()?.nativeElement;
    const center =
      element && element.clientWidth > 0 && element.clientHeight > 0
        ? { x: element.clientWidth / 2, y: element.clientHeight / 2 }
        : undefined;
    adapter.zoom('fit-viewport', center);
  }

  protected async toggleFullscreen(): Promise<void> {
    const stageElement = this.stage()?.nativeElement;
    if (!stageElement || !this.canFullscreen) {
      return;
    }
    if (document.fullscreenElement === stageElement) {
      await document.exitFullscreen();
    } else {
      await stageElement.requestFullscreen();
    }
  }

  protected handleFullscreenChange(): void {
    const stageElement = this.stage()?.nativeElement;
    const active = Boolean(stageElement && document.fullscreenElement === stageElement);
    if (active || this.hadStageFullscreen) {
      const refresh = () => {
        this.resolveCanvas()?.resized();
        this.fitViewport();
      };
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => requestAnimationFrame(refresh));
      } else {
        refresh();
      }
    }
    this.hadStageFullscreen = active;
  }

  private resolveCanvas(): BackofficeCanvasAdapter | null {
    const candidate = this.viewer?.get('canvas');
    return typeof candidate === 'object' && candidate !== null && 'zoom' in candidate
      ? (candidate as BackofficeCanvasAdapter)
      : null;
  }

  private async renderMarkup(
    container: HTMLDivElement,
    sourceXml: string | null,
    fallbackMessage: string,
  ): Promise<void> {
    if (!sourceXml) {
      this.loading.set(false);
      this.errorMessage.set(fallbackMessage);
      return;
    }

    const token = ++this.renderSequence;
    this.loading.set(true);
    this.errorMessage.set(null);
    this.viewer ??= new BpmnViewer({ container });

    try {
      await this.viewer.importXML(sourceXml);
      if (token === this.renderSequence) {
        this.fitViewport();
        this.loading.set(false);
        this.errorMessage.set(null);
      }
    } catch {
      if (token === this.renderSequence) {
        this.loading.set(false);
        this.errorMessage.set('The BPMN diagram could not be rendered.');
      }
    }
  }
}
