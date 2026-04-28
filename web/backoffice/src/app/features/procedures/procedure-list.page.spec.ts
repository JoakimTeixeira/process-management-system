import { Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { ProcedureListPageComponent } from './procedure-list.page';

interface ProcedureListPageTestInstance {
  procedures: Signal<
    {
      id: string;
      processVersionId: string;
      processId?: string;
      code: string;
      title: string;
      utility: string | null;
      warranty: string | null;
      outcome: string | null;
      policy: string | null;
      activities: Record<string, unknown>[] | null;
      inputs: Record<string, unknown>[] | null;
      outputs: Record<string, unknown>[] | null;
      processCode?: string;
      processTitle?: string;
      versionNumber?: number;
      lifecycleState?: 'Draft' | 'In Review' | 'Approved' | 'Published' | 'Archived';
      architectureState?: 'AS-IS' | 'TO-BE';
    }[]
  >;
  isLoading: Signal<boolean>;
  errorMessage: Signal<string | null>;
  filteredProcedures: ProcedureListPageComponent['filteredProcedures'];
  processOptions: ProcedureListPageComponent['processOptions'];
  selectedAreaId: ProcedureListPageComponent['selectedAreaId'];
  selectedProcessId: ProcedureListPageComponent['selectedProcessId'];
  onAreaSelectionChange: ProcedureListPageComponent['onAreaSelectionChange'];
}

describe('ProcedureListPageComponent', () => {
  let api: jasmine.SpyObj<BackofficeApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj<BackofficeApiService>('BackofficeApiService', [
      'listAllProcedures',
      'listProcesses',
      'listAreas',
    ]);
    api.listProcesses.and.returnValue(
      of([
        {
          id: 'process-1',
          areaId: 'area-1',
          code: 'P.001',
          title: 'Change Control',
          description: 'Change process',
          teamId: 'team-1',
          teamName: 'Operations',
          ownerId: 'owner-1',
          ownerName: 'Alice Owner',
        },
        {
          id: 'process-2',
          areaId: 'area-2',
          code: 'P.002',
          title: 'Incident Intake',
          description: 'Incident process',
          teamId: 'team-1',
          teamName: 'Operations',
          ownerId: 'owner-2',
          ownerName: 'Bob Owner',
        },
      ]),
    );
    api.listAreas.and.returnValue(
      of([
        {
          id: 'area-1',
          code: 'A1',
          title: 'Change Area',
          description: null,
          teamId: 'team-1',
          teamName: 'Operations',
          ownerId: 'owner-1',
          ownerName: 'Alice Owner',
          itilPracticeId: 'practice-1',
          itilPractice: { id: 'practice-1', name: 'Change Enablement' },
        },
        {
          id: 'area-2',
          code: 'A2',
          title: 'Service Desk',
          description: null,
          teamId: 'team-1',
          teamName: 'Operations',
          ownerId: 'owner-2',
          ownerName: 'Bob Owner',
          itilPracticeId: 'practice-2',
          itilPractice: { id: 'practice-2', name: 'Incident Management' },
        },
      ]),
    );

    await TestBed.configureTestingModule({
      imports: [ProcedureListPageComponent],
      providers: [
        { provide: BackofficeApiService, useValue: api },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('loads procedures for the backoffice workspace', async () => {
    api.listAllProcedures.and.returnValue(
      of([
        {
          id: 'procedure-1',
          processVersionId: 'version-1',
          processId: 'process-1',
          processCode: 'P.001',
          processTitle: 'Change Control',
          versionNumber: 2,
          lifecycleState: 'In Review',
          architectureState: 'TO-BE',
          code: 'P.001.1',
          title: 'Assess change request',
          utility: 'Guide the triage flow',
          warranty: 'Consistent change handling',
          outcome: 'Request classified correctly',
          policy: 'Mandatory for standard changes',
          activities: [],
          inputs: [],
          outputs: [],
        },
      ]),
    );

    const fixture = TestBed.createComponent(ProcedureListPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component =
      fixture.componentInstance as unknown as ProcedureListPageTestInstance;

    expect(api.listAllProcedures).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
    expect(component.errorMessage()).toBeNull();
    expect(component.procedures()).toEqual([
      jasmine.objectContaining({
        id: 'procedure-1',
        processCode: 'P.001',
        versionNumber: 2,
      }),
    ]);
  });

  it('surfaces a functional load error without crashing', async () => {
    api.listAllProcedures.and.returnValue(
      throwError(() => new Error('Backend unavailable')),
    );

    const fixture = TestBed.createComponent(ProcedureListPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component =
      fixture.componentInstance as unknown as ProcedureListPageTestInstance;

    expect(component.isLoading()).toBeFalse();
    expect(component.procedures()).toEqual([]);
    expect(component.errorMessage()).toBe('Backend unavailable');
  });

  it('filters procedures by area and process', async () => {
    api.listAllProcedures.and.returnValue(
      of([
        {
          id: 'procedure-1',
          processVersionId: 'version-1',
          processId: 'process-1',
          processCode: 'P.001',
          processTitle: 'Change Control',
          versionNumber: 2,
          lifecycleState: 'In Review',
          architectureState: 'TO-BE',
          code: 'P.001.1',
          title: 'Assess change request',
          utility: 'Guide the triage flow',
          warranty: 'Consistent change handling',
          outcome: 'Request classified correctly',
          policy: 'Mandatory for standard changes',
          activities: [],
          inputs: [],
          outputs: [],
        },
        {
          id: 'procedure-2',
          processVersionId: 'version-2',
          processId: 'process-2',
          processCode: 'P.002',
          processTitle: 'Incident Intake',
          versionNumber: 1,
          lifecycleState: 'Published',
          architectureState: 'AS-IS',
          code: 'P.002.1',
          title: 'Capture incident',
          utility: 'Record incident details',
          warranty: 'Consistent intake',
          outcome: 'Incident logged',
          policy: 'Mandatory for all incidents',
          activities: [],
          inputs: [],
          outputs: [],
        },
      ]),
    );

    const fixture = TestBed.createComponent(ProcedureListPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component =
      fixture.componentInstance as unknown as ProcedureListPageTestInstance;

    expect(component.filteredProcedures().map((procedure) => procedure.id)).toEqual([
      'procedure-1',
      'procedure-2',
    ]);

    component.onAreaSelectionChange('area-1');
    fixture.detectChanges();

    expect(component.processOptions().map((process) => process.id)).toEqual([
      'process-1',
    ]);
    expect(component.filteredProcedures().map((procedure) => procedure.id)).toEqual([
      'procedure-1',
    ]);

    component.selectedProcessId.set('process-1');
    fixture.detectChanges();

    expect(component.filteredProcedures().map((procedure) => procedure.id)).toEqual([
      'procedure-1',
    ]);

    component.onAreaSelectionChange('area-2');
    fixture.detectChanges();

    expect(component.selectedProcessId()).toBe('');
    expect(component.filteredProcedures().map((procedure) => procedure.id)).toEqual([
      'procedure-2',
    ]);
  });
});
