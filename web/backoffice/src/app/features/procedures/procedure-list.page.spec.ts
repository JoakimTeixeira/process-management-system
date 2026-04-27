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
}

describe('ProcedureListPageComponent', () => {
  let api: jasmine.SpyObj<BackofficeApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj<BackofficeApiService>('BackofficeApiService', [
      'listAllProcedures',
    ]);

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
});
