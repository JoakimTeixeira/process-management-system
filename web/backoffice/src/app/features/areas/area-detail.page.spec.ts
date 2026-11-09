import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';

import { createSpyObject, type SpyObject } from '../../../testing/spy-object';
import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AreaRecord, ProcessRecord } from '../../core/models/backoffice.models';
import { AreaDetailPageComponent } from './area-detail.page';

interface AreaDetailPageTestInstance {
  area: AreaDetailPageComponent['area'];
  processes: AreaDetailPageComponent['processes'];
  isLoading: AreaDetailPageComponent['isLoading'];
}

describe('AreaDetailPageComponent', () => {
  let api: SpyObject<BackofficeApiService>;
  let areaResponse: Subject<AreaRecord>;
  let processesResponse: Subject<ProcessRecord[]>;

  beforeEach(async () => {
    api = createSpyObject<BackofficeApiService>(['getArea', 'listProcesses']);
    areaResponse = new Subject<AreaRecord>();
    processesResponse = new Subject<ProcessRecord[]>();
    api.getArea.mockReturnValue(areaResponse);
    api.listProcesses.mockReturnValue(processesResponse);

    await TestBed.configureTestingModule({
      imports: [AreaDetailPageComponent],
      providers: [provideRouter([]), { provide: BackofficeApiService, useValue: api }],
    }).compileComponents();
  });

  it('should keep the loading state visible until both area and process requests resolve', async () => {
    const fixture = TestBed.createComponent(AreaDetailPageComponent);
    fixture.componentRef.setInput('id', 'area-1');
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as AreaDetailPageTestInstance;

    expect(component.isLoading()).toBe(true);
    expect(fixture.nativeElement.querySelector('mat-progress-spinner')).not.toBeNull();
    expect(api.getArea).toHaveBeenCalledWith('area-1');
    expect(api.listProcesses).toHaveBeenCalledOnce();

    areaResponse.next({
      id: 'area-1',
      code: 'A1',
      title: 'Change control',
      description: 'Area description',
      ownerId: 'owner-1',
      ownerName: 'Alice Owner',
      teamId: 'team-1',
      teamName: 'Operations',
      itilPracticeId: 'practice-1',
      itilPractice: { id: 'practice-1', name: 'Change Enablement' },
    });
    areaResponse.complete();
    processesResponse.next([
      {
        id: 'process-1',
        areaId: 'area-1',
        code: 'P1',
        title: 'Included process',
        description: null,
        teamId: 'team-1',
        teamName: 'Operations',
        ownerId: 'owner-1',
        ownerName: 'Alice Owner',
      },
      {
        id: 'process-2',
        areaId: 'area-2',
        code: 'P2',
        title: 'Other area process',
        description: null,
        teamId: 'team-1',
        teamName: 'Operations',
        ownerId: 'owner-1',
        ownerName: 'Alice Owner',
      },
    ]);
    processesResponse.complete();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.area()?.id).toBe('area-1');
    expect(component.processes().map((process) => process.id)).toEqual(['process-1']);
    expect(fixture.nativeElement.querySelector('mat-progress-spinner')).toBeNull();
  });
});
