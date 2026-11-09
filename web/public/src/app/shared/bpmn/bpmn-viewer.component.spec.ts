import { Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { BpmnViewerComponent } from './bpmn-viewer.component';
import { BpmnXmlService } from './bpmn-xml.service';

interface BpmnViewerHarness {
  layout: Signal<'default' | 'compact'>;
  processVersionId: Signal<string | null>;
}

interface BpmnViewerAsyncHarness extends BpmnViewerHarness {
  viewer: {
    destroy(): void;
    get(name: string): unknown;
    importXML(xml: string): Promise<void>;
  } | null;
}

describe('BpmnViewerComponent', () => {
  const getXml = vi.fn();

  beforeEach(async () => {
    getXml.mockReset();

    await TestBed.configureTestingModule({
      imports: [BpmnViewerComponent],
      providers: [{ provide: BpmnXmlService, useValue: { getXml } }],
    }).compileComponents();
  });

  it('should use signal inputs while preserving the compact empty state', () => {
    const fixture = TestBed.createComponent(BpmnViewerComponent);
    const component = fixture.componentInstance as unknown as BpmnViewerHarness;

    fixture.componentRef.setInput('layout', 'compact');
    fixture.componentRef.setInput('processVersionId', null);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(typeof component.layout).toBe('function');
    expect(typeof component.processVersionId).toBe('function');
    expect(component.layout()).toBe('compact');
    expect(component.processVersionId()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Diagram preview');
    expect(fixture.nativeElement.textContent).toContain(
      'No published BPMN diagram is available for this view.',
    );
    expect(getXml).not.toHaveBeenCalled();
  });

  it('should load the latest diagram asynchronously and ignore a stale response', async () => {
    const firstResponse = new Subject<string>();
    const secondResponse = new Subject<string>();
    const canvas = {
      resized: vi.fn(),
      viewbox: vi.fn().mockReturnValue({
        inner: { width: 100, height: 100 },
        outer: { width: 100, height: 100 },
      }),
      zoom: vi.fn().mockReturnValue(1),
    };

    getXml.mockReturnValueOnce(firstResponse).mockReturnValueOnce(secondResponse);
    const importXML = vi.fn().mockResolvedValue(undefined);

    const fixture = TestBed.createComponent(BpmnViewerComponent);
    const component = fixture.componentInstance as unknown as BpmnViewerAsyncHarness;
    fixture.detectChanges();
    fixture.detectChanges();
    component.viewer = {
      destroy: vi.fn(),
      get: vi.fn().mockReturnValue(canvas),
      importXML,
    };
    fixture.componentRef.setInput('processVersionId', 'version-1');
    fixture.detectChanges();
    fixture.componentRef.setInput('processVersionId', 'version-2');
    fixture.detectChanges();

    firstResponse.next('<definitions id="stale" />');
    secondResponse.next('<definitions id="current" />');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getXml).toHaveBeenNthCalledWith(1, 'version-1');
    expect(getXml).toHaveBeenNthCalledWith(2, 'version-2');
    expect(importXML).toHaveBeenCalledTimes(1);
    expect(importXML).toHaveBeenCalledWith('<definitions id="current" />');
    expect(fixture.nativeElement.querySelector('.viewer-state')).toBeNull();
  });

  it('should enter and exit fullscreen from the toolbar', async () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    const exitFullscreen = vi.fn().mockResolvedValue(undefined);
    const resized = vi.fn();
    const zoom = vi.fn().mockReturnValue(1);
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

    const fixture = TestBed.createComponent(BpmnViewerComponent);
    const component = fixture.componentInstance as unknown as BpmnViewerAsyncHarness;
    fixture.detectChanges();
    const stage = fixture.nativeElement.querySelector('.viewer-stage') as HTMLElement;
    const fullscreenButton = fixture.nativeElement.querySelector(
      '[mattooltip="Fullscreen"]',
    ) as HTMLButtonElement;

    fullscreenButton.click();
    await Promise.resolve();
    expect(requestFullscreen).toHaveBeenCalledTimes(1);

    fullscreenElement = stage;
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
      importXML: vi.fn().mockResolvedValue(undefined),
    };
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(resized).toHaveBeenCalledTimes(1);
    expect(zoom).toHaveBeenCalledWith('fit-viewport', undefined);

    fullscreenButton.click();
    await Promise.resolve();
    expect(exitFullscreen).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });
});
