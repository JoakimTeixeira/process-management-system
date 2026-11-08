import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { BackofficeBpmnViewerComponent } from './backoffice-bpmn-viewer.component';

interface BackofficeBpmnViewerHarness {
  viewer: {
    destroy(): void;
    get(name: string): unknown;
    importXML(xml: string): Promise<void>;
  } | null;
  zoom(delta: number): void;
  fitViewport(): void;
  toggleFullscreen(): Promise<void>;
  handleFullscreenChange(): void;
  showStatePanel: boolean;
}

describe('BackofficeBpmnViewerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackofficeBpmnViewerComponent],
    }).compileComponents();
  });

  it('exposes the title, subtitle, and empty-state inputs without constructing a viewer', async () => {
    const fixture = TestBed.createComponent(BackofficeBpmnViewerComponent);
    fixture.componentRef.setInput('title', 'Current BPMN');
    fixture.componentRef.setInput('subtitle', 'Process version v3 - Diagram preview');
    fixture.componentRef.setInput('emptyMessage', 'Choose a BPMN revision.');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(fixture.componentInstance.showStatePanel).toBe(true);
    expect(text).toContain('Current BPMN');
    expect(text).toContain('Process version v3 - Diagram preview');
    expect(text).toContain('Diagram unavailable');
    expect(text).toContain('Choose a BPMN revision.');
  });

  it('shows the empty message when xml is null and imports XML when provided', async () => {
    const fixture = TestBed.createComponent(BackofficeBpmnViewerComponent);
    const component = fixture.componentInstance as unknown as BackofficeBpmnViewerHarness;
    const canvas = {
      resized: vi.fn(),
      viewbox: vi.fn().mockReturnValue({
        inner: { width: 200, height: 100 },
        outer: { width: 100, height: 100 },
      }),
      zoom: vi.fn().mockReturnValue(1),
    };
    const importXML = vi.fn().mockResolvedValue(undefined);
    const destroy = vi.fn();

    fixture.detectChanges();
    expect(component.showStatePanel).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Select a BPMN asset to visualise.');

    component.viewer = {
      destroy,
      get: vi.fn().mockReturnValue(canvas),
      importXML,
    };

    fixture.componentRef.setInput('xml', '<definitions id="flow-1" />');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(importXML).toHaveBeenCalledWith('<definitions id="flow-1" />');
    expect(component.showStatePanel).toBe(false);

    component.zoom(0.2);
    expect(canvas.zoom).toHaveBeenCalledWith(1.2);

    component.zoom(-0.6);
    expect(canvas.zoom).toHaveBeenCalledWith('fit-viewport', undefined);

    fixture.destroy();
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('handles importXML errors and fullscreen toggling', async () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    const exitFullscreen = vi.fn().mockResolvedValue(undefined);
    let fullscreenElement: Element | null = null;

    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: exitFullscreen,
    });
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => fullscreenElement,
    });
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });

    const fixture = TestBed.createComponent(BackofficeBpmnViewerComponent);
    const component = fixture.componentInstance as unknown as BackofficeBpmnViewerHarness;
    const resized = vi.fn();
    const zoom = vi.fn().mockReturnValue(1);

    fixture.detectChanges();
    component.viewer = {
      destroy: vi.fn(),
      get: vi.fn().mockReturnValue({
        resized,
        viewbox: vi.fn().mockReturnValue({
          inner: { width: 100, height: 100 },
          outer: { width: 100, height: 100 },
        }),
        zoom,
      }),
      importXML: vi.fn().mockRejectedValue(new Error('Invalid XML')),
    };

    fixture.componentRef.setInput('xml', '<invalid />');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'The BPMN diagram could not be rendered.',
    );

    const stage = fixture.nativeElement.querySelector('.viewer-stage') as HTMLElement;
    await component.toggleFullscreen();
    expect(requestFullscreen).toHaveBeenCalledTimes(1);

    fullscreenElement = stage;
    component.handleFullscreenChange();
    expect(resized).toHaveBeenCalledTimes(1);

    await component.toggleFullscreen();
    expect(exitFullscreen).toHaveBeenCalledTimes(1);

    fullscreenElement = null;
    component.handleFullscreenChange();

    vi.unstubAllGlobals();
  });
});
