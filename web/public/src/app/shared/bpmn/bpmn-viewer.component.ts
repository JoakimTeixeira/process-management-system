import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

import { BpmnXmlService } from './bpmn-xml.service';

interface BpmnCanvas {
  zoom(level?: number): number;
  zoom(value: 'fit-viewport'): void;
}

function isBpmnCanvas(obj: unknown): obj is BpmnCanvas {
  return typeof obj === 'object' && obj !== null && 'zoom' in obj;
}

@Component({
  selector: 'app-bpmn-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
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
    canvas.zoom(currentZoom + delta);
  }

  protected fitViewport(): void {
    const canvas = this.viewer?.get('canvas');

    if (canvas && isBpmnCanvas(canvas)) {
      canvas.zoom('fit-viewport');
    }
  }

  protected async toggleFullscreen(): Promise<void> {
    if (!this.stage?.nativeElement || !this.canFullscreen) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await this.stage.nativeElement.requestFullscreen();
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
}
