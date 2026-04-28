import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

interface BpmnCanvas {
  zoom(level?: number): number;
  zoom(value: 'fit-viewport'): void;
}

function isBpmnCanvas(obj: unknown): obj is BpmnCanvas {
  return typeof obj === 'object' && obj !== null && 'zoom' in obj;
}

@Component({
  selector: 'app-backoffice-bpmn-viewer',
  imports: [CommonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="viewer-card">
      <div class="viewer-toolbar">
        <div>
          <p class="viewer-kicker">Diagram</p>
          <span class="viewer-title">{{ title }}</span>
          <p class="viewer-subtitle">{{ subtitle }}</p>
        </div>
        <div class="viewer-actions">
          <button class="viewer-action-button" type="button" (click)="fitViewport()">
            Fit
          </button>
          <button class="viewer-action-button" type="button" (click)="zoom(-0.1)">-</button>
          <button class="viewer-action-button" type="button" (click)="zoom(0.1)">+</button>
          <button
            class="viewer-action-button"
            type="button"
            (click)="toggleFullscreen()"
            [disabled]="!canFullscreen"
          >
            Fullscreen
          </button>
        </div>
      </div>

      <div class="viewer-stage" #stage>
        <div class="viewer-shell" #canvas [class.viewer-hidden]="showStatePanel"></div>

        @if (showStatePanel) {
          <div class="viewer-state">
            @if (loading) {
              <mat-spinner diameter="36"></mat-spinner>
            } @else {
              <div class="viewer-state__message">
                <strong>Diagram unavailable</strong>
                <span>{{ errorMessage }}</span>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }

      .viewer-card {
        display: grid;
        gap: 1rem;
        min-width: 0;
      }

      .viewer-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .viewer-kicker {
        margin: 0;
        color: var(--portal-muted);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .viewer-title {
        display: block;
        margin-top: 0.25rem;
        color: var(--portal-ink);
        font-weight: 600;
      }

      .viewer-subtitle {
        margin: 0.25rem 0 0;
        color: var(--portal-muted);
        font-size: 0.875rem;
        line-height: 1.5;
      }

      .viewer-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .viewer-action-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 3rem;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--portal-border);
        border-radius: 0.75rem;
        background: var(--portal-surface);
        color: var(--portal-muted);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition:
          border-color 160ms ease,
          background-color 160ms ease,
          color 160ms ease;
      }

      .viewer-action-button:hover:not(:disabled) {
        border-color: #0f6cbd;
        background: #eff6ff;
        color: #0f6cbd;
      }

      .viewer-action-button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .viewer-stage {
        position: relative;
        min-height: 560px;
        border: 1px solid var(--portal-border);
        border-radius: 1rem;
        background: var(--portal-surface-alt);
        overflow: hidden;
      }

      .viewer-shell,
      .viewer-state {
        position: absolute;
        inset: 0;
      }

      .viewer-shell {
        background: #ffffff;
      }

      .viewer-state {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        text-align: center;
        background: rgba(248, 249, 250, 0.94);
      }

      .viewer-state__message {
        display: grid;
        gap: 0.5rem;
        max-width: 26rem;
      }

      .viewer-state__message strong {
        color: var(--portal-ink);
        font-size: 1.125rem;
      }

      .viewer-state__message span {
        color: var(--portal-muted);
        line-height: 1.6;
      }

      .viewer-hidden {
        visibility: hidden;
      }

      @media (max-width: 720px) {
        .viewer-toolbar {
          align-items: flex-start;
          flex-direction: column;
        }

        .viewer-stage {
          min-height: 420px;
        }
      }
    `,
  ],
})
export class BackofficeBpmnViewerComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  private readonly cdr = inject(ChangeDetectorRef);
  @Input() xml: string | null = null;
  @Input() title = 'Visualize the BPMN diagram';
  @Input() subtitle = 'Use the controls to fit, zoom, and inspect the latest model.';
  @Input() emptyMessage = 'Select a BPMN asset to visualise.';
  @ViewChild('canvas') private readonly canvas?: ElementRef<HTMLDivElement>;
  @ViewChild('stage') private readonly stage?: ElementRef<HTMLDivElement>;

  private viewer: BpmnViewer | null = null;
  private renderRequestToken = 0;

  protected loading = false;
  protected errorMessage: string | null = null;
  protected readonly canFullscreen =
    typeof document !== 'undefined' && !!document.documentElement.requestFullscreen;

  get showStatePanel(): boolean {
    return this.loading || !!this.errorMessage || !this.xml;
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

  private async renderDiagram(): Promise<void> {
    if (!this.canvas?.nativeElement) {
      return;
    }

    if (!this.xml) {
      this.loading = false;
      this.errorMessage = this.emptyMessage;
      this.cdr.markForCheck();
      return;
    }

    const requestToken = ++this.renderRequestToken;
    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.viewer ??= new BpmnViewer({
      container: this.canvas.nativeElement,
    });

    try {
      await this.viewer.importXML(this.xml);

      if (requestToken !== this.renderRequestToken) {
        return;
      }

      this.fitViewport();
      this.loading = false;
      this.errorMessage = null;
      this.cdr.markForCheck();
    } catch {
      if (requestToken !== this.renderRequestToken) {
        return;
      }

      this.loading = false;
      this.errorMessage = 'The BPMN diagram could not be rendered.';
      this.cdr.markForCheck();
    }
  }
}
