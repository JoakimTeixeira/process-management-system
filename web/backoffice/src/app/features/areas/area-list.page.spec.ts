import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { AreaListPageComponent } from './area-list.page';

interface AreaListPageTestInstance {
  areas: AreaListPageComponent['areas'];
  actionErrorMessage: AreaListPageComponent['actionErrorMessage'];
  confirmDeleteArea: AreaListPageComponent['confirmDeleteArea'];
}

describe('AreaListPageComponent', () => {
  let api: jasmine.SpyObj<BackofficeApiService>;
  let dialogOpenSpy: jasmine.Spy;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    api = jasmine.createSpyObj<BackofficeApiService>('BackofficeApiService', [
      'listAreas',
      'deleteArea',
      'listProcesses',
    ]);
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    dialogOpenSpy = spyOn(MatDialog.prototype, 'open').and.returnValue(
      { afterClosed: () => of(true) } as never,
    );

    api.listAreas.and.returnValue(
      of([
        {
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
        },
      ]),
    );
    api.listProcesses.and.returnValue(of([]));
    api.deleteArea.and.returnValue(of(void 0));
    await TestBed.configureTestingModule({
      imports: [AreaListPageComponent],
      providers: [
        { provide: BackofficeApiService, useValue: api },
        {
          provide: AuthService,
          useValue: { currentUser: () => ({ role: { name: 'EDITOR' } }) },
        },
        { provide: MatSnackBar, useValue: snackBar },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('loads areas and confirms deletion before calling the api', async () => {
    const fixture = TestBed.createComponent(AreaListPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as AreaListPageTestInstance;

    expect(api.listAreas).toHaveBeenCalled();
    expect(component.areas().map((area) => area.id)).toEqual(['area-1']);

    await component.confirmDeleteArea(component.areas()[0]);

    expect(dialogOpenSpy).toHaveBeenCalled();
    expect(api.deleteArea).toHaveBeenCalledWith('area-1');
    expect(component.areas().map((area) => area.id)).toEqual(['area-1']);
    expect(snackBar.open).toHaveBeenCalledWith('Area "Change control" deleted successfully', 'Close', jasmine.any(Object));
    expect(component.actionErrorMessage()).toBeNull();
  });
});
