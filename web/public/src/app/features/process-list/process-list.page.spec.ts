import { Signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { PublicPortalApiService } from '../../core/api/public-portal-api.service';
import { ArchitectureState, PublicProcedureSummary } from '../../core/models/public-portal.models';
import { ProcessListPageComponent } from './process-list.page';

interface ProcessListPageHarness {
  activeTabId: Signal<'processes' | 'procedures'>;
  errorMessage: Signal<string | null>;
  filteredProcedures: Signal<PublicProcedureSummary[]>;
  loading: Signal<boolean>;
  pageTitle: Signal<string>;
  searchTerm: WritableSignal<string>;
  selectedArchitecture: WritableSignal<ArchitectureState | ''>;
  selectedAreaId: WritableSignal<string>;
  selectedProcessId: WritableSignal<string>;
  handleSearchInput(event: Event): void;
}

describe('ProcessListPageComponent', () => {
  const navigate = vi.fn().mockResolvedValue(true);
  const area = { id: 'area-1', code: 'OPS', title: 'Operations' };
  const process = {
    id: 'process-1',
    code: 'PR-001',
    title: 'Incident Management',
    description: 'Restore service quickly.',
    area,
    itilPractice: { id: 'practice-1', code: 'IM', name: 'Incident Management' },
    availableArchitectures: ['AS-IS', 'TO-BE'] as ArchitectureState[],
  };
  const procedure: PublicProcedureSummary = {
    id: 'procedure-1',
    processVersionId: 'version-2',
    code: 'PROC-001',
    title: 'Escalate incident',
    description: 'Escalate high-impact incidents.',
    version: { versionNumber: 2, architectureState: 'TO-BE', title: 'Target State' },
    process: { id: process.id, code: process.code, title: process.title },
    area,
    utility: 'Restore service',
    warranty: 'Within target time',
    outcome: 'Incident resolved',
    policy: 'Escalate major incidents',
    activities: [],
    inputs: [],
    outputs: [],
  };

  beforeEach(async () => {
    navigate.mockClear();

    await TestBed.configureTestingModule({
      imports: [ProcessListPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(
              convertToParamMap({
                search: 'escalate',
                areaId: area.id,
                architecture: 'TO-BE',
                processId: process.id,
              }),
            ),
            data: of({ defaultCatalogTab: 'procedures', pageTitle: 'Procedures' }),
          },
        },
        { provide: Router, useValue: { navigate } },
        {
          provide: PublicPortalApiService,
          useValue: {
            listAreas: vi.fn().mockReturnValue(of([area])),
            listProcesses: vi.fn().mockReturnValue(of([process])),
            listProcedures: vi.fn().mockReturnValue(of([procedure])),
          },
        },
      ],
    }).compileComponents();
  });

  it('should load route-backed filters and clear a process selection before options arrive', () => {
    const fixture = TestBed.createComponent(ProcessListPageComponent);
    const page = fixture.componentInstance as unknown as ProcessListPageHarness;

    fixture.componentInstance.ngOnInit();

    expect(page.loading()).toBe(false);
    expect(page.errorMessage()).toBeNull();
    expect(page.activeTabId()).toBe('procedures');
    expect(page.pageTitle()).toBe('Procedures');
    // Current behavior: route state is validated before the async process options are populated.
    expect(page.selectedProcessId()).toBe('');
    expect(page.filteredProcedures()).toEqual([procedure]);
  });

  it('should replace the current URL with the page current filter state when search changes', () => {
    const fixture = TestBed.createComponent(ProcessListPageComponent);
    const page = fixture.componentInstance as unknown as ProcessListPageHarness;
    fixture.componentInstance.ngOnInit();

    page.handleSearchInput({ target: { value: '  review  ' } } as unknown as Event);

    expect(navigate).toHaveBeenCalledWith(['/catalog/procedures'], {
      queryParams: {
        search: 'review',
        areaId: area.id,
        architecture: 'TO-BE',
        processId: null,
        tab: null,
      },
      replaceUrl: true,
    });
  });
});
