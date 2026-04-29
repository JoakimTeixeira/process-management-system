import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { TeamListPageComponent } from './team-list.page';

interface TeamListPageTestInstance {
  teams: TeamListPageComponent['teams'];
  isLoading: TeamListPageComponent['isLoading'];
  errorMessage: TeamListPageComponent['errorMessage'];
}

describe('TeamListPageComponent', () => {
  let api: jasmine.SpyObj<BackofficeApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj<BackofficeApiService>('BackofficeApiService', ['listTeams']);
    api.listTeams.and.returnValue(
      of([
        { id: 'team-1', code: 'OPS', name: 'Operations', description: 'Ops team', isActive: true },
        { id: 'team-2', code: 'HR', name: 'Human Resources', description: 'HR team', isActive: false },
      ]),
    );

    await TestBed.configureTestingModule({
      imports: [TeamListPageComponent],
      providers: [
        { provide: BackofficeApiService, useValue: api },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('loads teams for the administration list', async () => {
    const fixture = TestBed.createComponent(TeamListPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as TeamListPageTestInstance;

    expect(api.listTeams).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
    expect(component.errorMessage()).toBeNull();
    expect(component.teams().map((team) => team.code)).toEqual(['OPS', 'HR']);
  });
});
