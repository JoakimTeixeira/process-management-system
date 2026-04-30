import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

import { BpmnXmlService } from './bpmn-xml.service';

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
  selector: 'app-bpmn-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './bpmn-viewer.component.html',
  styleUrl: './bpmn-viewer.component.scss',
})
export class BpmnViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  @Input() processVersionId: string | null = null;
  @Input() layout: 'default' | 'compact' = 'default';
  @ViewChild('canvas') private readonly canvas?: ElementRef<HTMLDivElement>;
  @ViewChild('stage') private readonly stage?: ElementRef<HTMLDivElement>;

  private readonly bpmnXmlService = inject(BpmnXmlService);
  private viewer: BpmnViewer | null = null;
  private loadRequestToken = 0;
  private wasStageFullscreen = false;

  protected loading = false;
  protected errorMessage: string | null = null;
  protected readonly canFullscreen =
    typeof document !== 'undefined' && !!document.documentElement.requestFullscreen;

  get showStatePanel(): boolean {
    return this.loading || !!this.errorMessage || !this.processVersionId;
  }

  ngAfterViewInit(): void {
    this.tryLoadDiagram();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['processVersionId']) {
      this.tryLoadDiagram();
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

  @HostListener('document:fullscreenchange')
  protected handleFullscreenChange(): void {
    const isStageFullscreen = this.isStageFullscreen();

    if (isStageFullscreen || this.wasStageFullscreen) {
      this.scheduleFitViewport();
    }

    this.wasStageFullscreen = isStageFullscreen;
  }

  private tryLoadDiagram(): void {
    if (!this.canvas?.nativeElement) {
      return;
    }

    if (!this.processVersionId) {
      this.loading = false;
      this.errorMessage = 'No published BPMN diagram is available for this view.';
      this.cdr.markForCheck();
      return;
    }

    const requestToken = ++this.loadRequestToken;
    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.viewer ??= new BpmnViewer({
      container: this.canvas.nativeElement,
    });

    this.bpmnXmlService
      .getXml(this.processVersionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (xml) => {
          if (requestToken !== this.loadRequestToken) {
            return;
          }

          try {
            if (this.viewer) {
              await this.viewer.importXML(xml);
              this.fitViewport();
            }
            this.loading = false;
            this.errorMessage = null;
            this.cdr.markForCheck();
          } catch {
            if (requestToken !== this.loadRequestToken) {
              return;
            }

            this.loading = false;
            this.errorMessage = 'The BPMN diagram could not be rendered.';
            this.cdr.markForCheck();
          }
        },
        error: () => {
          if (requestToken !== this.loadRequestToken) {
            return;
          }

          this.loading = false;
          this.errorMessage = 'The published BPMN diagram is not available.';
          this.cdr.markForCheck();
        },
      });
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
