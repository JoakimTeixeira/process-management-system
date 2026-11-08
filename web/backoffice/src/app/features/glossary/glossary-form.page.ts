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
  templateUrl: './glossary-form.page.html',
  styleUrl: './glossary-form.page.scss',
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
