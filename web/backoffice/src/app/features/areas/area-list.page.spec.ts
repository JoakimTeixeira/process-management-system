import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { createSpyObject, type SpyObject } from '../../../testing/spy-object';
import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { AreaListPageComponent } from './area-list.page';

interface AreaListPageTestInstance {
  areas: AreaListPageComponent['areas'];
  actionErrorMessage: AreaListPageComponent['actionErrorMessage'];
  confirmDeleteArea: AreaListPageComponent['confirmDeleteArea'];
}

describe('AreaListPageComponent', () => {
  let api: SpyObject<BackofficeApiService>;
  let dialogOpenSpy: unknown;
  let snackBar: SpyObject<MatSnackBar>;

  beforeEach(async () => {
    api = createSpyObject<BackofficeApiService>(['listAreas', 'deleteArea', 'listProcesses']);
    snackBar = createSpyObject<MatSnackBar>(['open']);
    dialogOpenSpy = vi
      .spyOn(MatDialog.prototype, 'open')
      .mockReturnValue({ afterClosed: () => of(true) } as never);

    api.listAreas.mockReturnValue(
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
    api.listProcesses.mockReturnValue(of([]));
    api.deleteArea.mockReturnValue(of(void 0));
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

  it('should load areas and confirm deletion before calling the api', async () => {
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
    expect(snackBar.open).toHaveBeenCalledWith(
      'Area "Change control" deleted successfully',
      'Close',
      expect.any(Object),
    );
    expect(component.actionErrorMessage()).toBeNull();
  });
});
