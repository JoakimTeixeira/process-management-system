import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { AccessControlUtil } from '../../core/governance/access-control.util';
import { getHttpErrorMessage } from '../../core/http/http-error-message';
import { AreaRecord, ProcedureRecord, ProcessRecord } from '../../core/models/backoffice.models';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-procedure-list-page',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './procedure-list.page.html',
  styleUrl: './procedure-list.page.scss',
})
export class ProcedureListPageComponent implements OnInit {
  private readonly api = inject(BackofficeApiService);
  private readonly accessControl = inject(AccessControlUtil);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly procedures = signal<ProcedureRecord[]>([]);
  protected readonly processes = signal<ProcessRecord[]>([]);
  protected readonly areas = signal<AreaRecord[]>([]);
  protected readonly selectedAreaId = signal('');
  protected readonly selectedProcessId = signal('');
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canEdit = computed(() => this.accessControl.hasRole('EDITOR'));
  protected readonly currentUserRole = computed(() => this.accessControl.currentUserRole());
  protected readonly areaOptions = computed(() =>
    [...this.areas()].sort((left, right) => left.title.localeCompare(right.title)),
  );
  protected readonly processOptions = computed(() =>
    [...this.processes()]
      .filter((process) => !this.selectedAreaId() || process.areaId === this.selectedAreaId())
      .sort((left, right) => left.title.localeCompare(right.title)),
  );
  protected readonly filteredProcedures = computed(() => {
    const selectedAreaId = this.selectedAreaId();
    const selectedProcessId = this.selectedProcessId();
    const processAreaById = new Map(
      this.processes().map((process) => [process.id, process.areaId] as const),
    );

    return this.procedures().filter((procedure) => {
      if (selectedProcessId.length > 0 && procedure.processId !== selectedProcessId) {
        return false;
      }

      if (selectedAreaId.length === 0) {
        return true;
      }

      return procedure.processId
        ? processAreaById.get(procedure.processId) === selectedAreaId
        : false;
    });
  });
  protected readonly displayedColumns = ['code', 'process', 'version', 'lifecycle', 'actions'];

  ngOnInit(): void {
    void this.loadProcedures();
  }

  protected onAreaSelectionChange(areaId: string): void {
    this.selectedAreaId.set(areaId);

    if (
      this.selectedProcessId().length > 0 &&
      !this.processOptions().some((process) => process.id === this.selectedProcessId())
    ) {
      this.selectedProcessId.set('');
    }
  }



  private async loadProcedures(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const [procedures, processes, areas] = await Promise.all([
        firstValueFrom(this.api.listAllProcedures()),
        firstValueFrom(this.api.listProcesses()),
        firstValueFrom(this.api.listAreas()),
      ]);
      this.procedures.set(procedures);
      this.processes.set(processes);
      this.areas.set(areas);
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load procedures.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
