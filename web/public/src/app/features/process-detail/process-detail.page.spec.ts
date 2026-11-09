import { Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { PublicPortalApiService } from '../../core/api/public-portal-api.service';
import {
  PublicProcessDetail,
  PublicProcessHistoryItem,
} from '../../core/models/public-portal.models';
import { BreadcrumbItem } from '../../shared/breadcrumbs/breadcrumbs.builder';
import { ProcessDetailPageComponent } from './process-detail.page';

interface ProcessDetailPageHarness {
  activeTabId: Signal<string>;
  breadcrumbs: Signal<BreadcrumbItem[]>;
  canCompareViews: Signal<boolean>;
  compareLeftViewId: Signal<string>;
  compareRightViewId: Signal<string>;
  detail: Signal<PublicProcessDetail | null>;
  historyItems: Signal<PublicProcessHistoryItem[]>;
  loading: Signal<boolean>;
  handleTabChange(tab: 'overview' | 'diagram' | 'procedures' | 'history' | 'compare'): void;
}

describe('ProcessDetailPageComponent', () => {
  const navigate = vi.fn().mockResolvedValue(true);
  const detail: PublicProcessDetail = {
    process: {
      id: 'process-1',
      code: 'PR-001',
      title: 'Incident Management',
      description: 'Restore service quickly.',
      area: { id: 'area-1', code: 'OPS', title: 'Operations' },
      itilPractice: { id: 'practice-1', code: 'IM', name: 'Incident Management' },
    },
    versions: {
      asIs: {
        id: 'version-1',
        processId: 'process-1',
        versionNumber: 1,
        architectureState: 'AS-IS',
        title: 'Current State',
        changeDescription: 'Baseline',
        reasonForChange: 'Current operation',
        procedures: [],
        bpmnAsset: null,
      },
      toBe: {
        id: 'version-2',
        processId: 'process-1',
        versionNumber: 2,
        architectureState: 'TO-BE',
        title: 'Target State',
        changeDescription: 'Improved workflow',
        reasonForChange: 'Reduce restoration time',
        procedures: [],
        bpmnAsset: null,
      },
    },
  };
  const historyItem: PublicProcessHistoryItem = {
    id: 'version-0',
    versionNumber: 0,
    lifecycleState: 'Archived',
    architectureState: 'AS-IS',
    title: 'Archived baseline',
    changeDescription: 'Original workflow',
    reasonForChange: 'Initial publication',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    derivedFromVersionId: null,
  };

  beforeEach(async () => {
    navigate.mockClear();

    await TestBed.configureTestingModule({
      imports: [ProcessDetailPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ processId: detail.process.id })),
            data: of({ tab: 'overview' }),
            queryParamMap: of(convertToParamMap({ tab: 'compare', left: 'as-is', right: 'as-is' })),
          },
        },
        { provide: Router, useValue: { navigate } },
        {
          provide: PublicPortalApiService,
          useValue: {
            getProcessDetail: vi.fn().mockReturnValue(of(detail)),
            getProcessVersions: vi.fn().mockReturnValue(of([historyItem])),
          },
        },
      ],
    }).compileComponents();
  });

  it('should load detail and history while normalizing duplicate compare selections', () => {
    const fixture = TestBed.createComponent(ProcessDetailPageComponent);
    const page = fixture.componentInstance as unknown as ProcessDetailPageHarness;

    fixture.componentInstance.ngOnInit();

    expect(page.loading()).toBe(false);
    expect(page.detail()).toEqual(detail);
    expect(page.historyItems()).toEqual([historyItem]);
    expect(page.activeTabId()).toBe('compare');
    expect(page.compareLeftViewId()).toBe('as-is');
    expect(page.compareRightViewId()).toBe('to-be');
    expect(page.canCompareViews()).toBe(true);
    expect(page.breadcrumbs().at(-1)?.label).toBe('Compare');
  });

  it('should navigate history without carrying view query parameters', () => {
    const fixture = TestBed.createComponent(ProcessDetailPageComponent);
    const page = fixture.componentInstance as unknown as ProcessDetailPageHarness;
    fixture.componentInstance.ngOnInit();

    page.handleTabChange('history');

    expect(navigate).toHaveBeenCalledWith(['/catalog/processes/process-1/history'], {
      queryParams: undefined,
      replaceUrl: true,
    });
  });
});
