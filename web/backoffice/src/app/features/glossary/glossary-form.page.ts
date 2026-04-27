import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BackofficeApiService } from '../../core/api/backoffice-api.service';
import { getHttpErrorMessage } from '../../core/http/http-error-message';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-glossary-form-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }

      .page {
        max-width: 48rem;
      }

      .form-card {
        overflow: hidden;
      }
    `,
  ],
  template: `
    <section class="page">
      <section class="bo-page-intro">
        <div class="bo-page-intro__copy">
          <h1>{{ pageTitle() }}</h1>
        </div>
      </section>

      @if (isLoading()) {
        <section class="center-state bo-state-card">
          <mat-progress-spinner mode="indeterminate" />
        </section>
      } @else {
        <mat-card class="form-card" appearance="outlined">
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="submit()">
              <mat-form-field appearance="outline">
                <mat-label>Term</mat-label>
                <input matInput formControlName="term" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Definition</mat-label>
                <textarea matInput rows="4" formControlName="definition"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Category</mat-label>
                <input matInput formControlName="category" />
              </mat-form-field>

              <mat-checkbox formControlName="isPreferred">Preferred term</mat-checkbox>

              @if (errorMessage(); as errorMessage) {
                <p class="error-message">{{ errorMessage }}</p>
              }

              <div class="bo-form-actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="isSaving()">
                  <mat-icon>save</mat-icon>
                  Save term
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </section>
  `,
})
export class GlossaryFormPageComponent {
  readonly id = input<string>();

  private readonly api = inject(BackofficeApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly pageTitle = computed(() => (this.id() ? 'Edit glossary term' : 'Create glossary term'));

  protected readonly form = this.fb.group({
    term: ['', [Validators.required]],
    definition: ['', [Validators.required]],
    category: [''],
    isPreferred: [true],
  });

  constructor() {
    effect(() => {
      void this.loadPage(this.id());
    });
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    try {
      const payload = {
        term: this.form.controls.term.getRawValue(),
        definition: this.form.controls.definition.getRawValue(),
        category: this.form.controls.category.getRawValue() || null,
        isPreferred: this.form.controls.isPreferred.getRawValue(),
      };

      if (this.id()) {
        await firstValueFrom(this.api.updateGlossaryTerm(this.id()!, payload));
        this.toast.success('Glossary term updated successfully');
      } else {
        await firstValueFrom(this.api.createGlossaryTerm(payload));
        this.toast.success('Glossary term created successfully');
      }

      await this.router.navigateByUrl('/glossary');
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to save the glossary term.'));
      this.toast.error('Failed to save glossary term');
    } finally {
      this.isSaving.set(false);
    }
  }

  private async loadPage(termId: string | undefined): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const glossary = await firstValueFrom(this.api.getGlossary());
      const term = termId ? glossary.terms.find((t) => t.id === termId) : null;

      this.form.reset({
        term: term?.term ?? '',
        definition: term?.definition ?? '',
        category: term?.category ?? '',
        isPreferred: term?.isPreferred ?? true,
      });
    } catch (error) {
      this.errorMessage.set(getHttpErrorMessage(error, 'Unable to load the glossary term.'));
    } finally {
      this.isLoading.set(false);
    }
  }
}
