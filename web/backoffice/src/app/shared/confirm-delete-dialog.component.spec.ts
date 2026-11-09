import { TestBed } from '@angular/core/testing';

import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';

describe('ConfirmDeleteDialogComponent', () => {
  it('should compile its standalone component definition', async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDeleteDialogComponent],
    }).compileComponents();

    expect(ConfirmDeleteDialogComponent).toBeDefined();
  });
});
