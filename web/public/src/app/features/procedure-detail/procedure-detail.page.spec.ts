import { Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { PublicPortalApiService } from '../../core/api/public-portal-api.service';
import { PublicProcedureDetail } from '../../core/models/public-portal.models';
import { BreadcrumbItem } from '../../shared/breadcrumbs/breadcrumbs.builder';
import { ProcedureDetailPageComponent } from './procedure-detail.page';

interface ProcedureDetailPageHarness {
  breadcrumbs: Signal<BreadcrumbItem[]>;
  detail: Signal<PublicProcedureDetail | null>;
  loading: Signal<boolean>;
  readActivityField(
    activity: Record<string, unknown>,
    field: 'resource' | 'serviceAction' | 'workInstruction',
  ): string;
}

describe('ProcedureDetailPageComponent', () => {
  const detail: PublicProcedureDetail = {
    procedure: {
      id: 'procedure-1',
      processVersionId: 'version-2',
      code: 'PROC-001',
      title: 'Escalate incident',
      description: 'Escalate a major incident.',
      version: { versionNumber: 2, architectureState: 'TO-BE', title: 'Target State' },
      process: { id: 'process-1', code: 'PR-001', title: 'Incident Management' },
      area: { id: 'area-1', code: 'OPS', title: 'Operations' },
      utility: 'Restore service',
      warranty: 'Within target time',
      outcome: 'Incident resolved',
      policy: 'Escalate major incidents',
      activities: [{ resource: 'Service desk' }],
      inputs: ['Incident record'],
      outputs: ['Escalation record'],
    },
    version: {
      id: 'version-2',
      versionNumber: 2,
      architectureState: 'TO-BE',
      title: 'Target State',
    },
    process: { id: 'process-1', code: 'PR-001', title: 'Incident Management' },
    area: { id: 'area-1', code: 'OPS', title: 'Operations' },
    itilPractice: { id: 'practice-1', code: 'IM', name: 'Incident Management' },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcedureDetailPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: detail.procedure.id }),
              queryParamMap: convertToParamMap({
                origin: 'process',
                originProcessId: detail.process.id,
                view: 'to-be',
              }),
            },
          },
        },
        {
          provide: PublicPortalApiService,
          useValue: { getProcedureDetail: vi.fn().mockReturnValue(of(detail)) },
        },
      ],
    }).compileComponents();
  });

  it('loads procedure detail and preserves process-origin breadcrumb context', () => {
    const fixture = TestBed.createComponent(ProcedureDetailPageComponent);
    const page = fixture.componentInstance as unknown as ProcedureDetailPageHarness;

    fixture.componentInstance.ngOnInit();

    expect(page.loading()).toBe(false);
    expect(page.detail()).toEqual(detail);
    expect(page.breadcrumbs()[1]).toEqual({ label: 'Processes', link: '/catalog/processes' });
    expect(page.breadcrumbs()[3]).toMatchObject({
      link: '/catalog/processes/process-1',
      queryParams: { tab: 'procedures', view: 'to-be' },
    });
  });

  it('reads canonical and legacy activity fields and supplies an empty value label', () => {
    const fixture = TestBed.createComponent(ProcedureDetailPageComponent);
    const page = fixture.componentInstance as unknown as ProcedureDetailPageHarness;

    expect(page.readActivityField({ serviceAction: 'Notify owner' }, 'serviceAction')).toBe(
      'Notify owner',
    );
    expect(page.readActivityField({ work_instruction: 'Open bridge' }, 'workInstruction')).toBe(
      'Open bridge',
    );
    expect(page.readActivityField({}, 'resource')).toBe('Not specified.');
  });
});
