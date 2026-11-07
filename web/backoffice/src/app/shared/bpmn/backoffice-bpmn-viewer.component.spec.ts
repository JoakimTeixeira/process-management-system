import { TestBed } from '@angular/core/testing';

import { BackofficeBpmnViewerComponent } from './backoffice-bpmn-viewer.component';

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
});
