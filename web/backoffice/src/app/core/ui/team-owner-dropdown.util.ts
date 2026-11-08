import {
  assertInInjectionContext,
  computed,
  DestroyRef,
  effect,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';
import { OwnerOption, TeamOption } from '../models/backoffice.models';
import { BreadcrumbService } from '../navigation/breadcrumb.service';

export function bindFormPageLifecycle(
  destroyRef: DestroyRef,
  breadcrumbs: BreadcrumbService,
  breadcrumbOwner: symbol,
  onLoad: () => void,
): void {
  assertInInjectionContext(bindFormPageLifecycle);

  destroyRef.onDestroy(() => {
    breadcrumbs.clearOverride(breadcrumbOwner);
  });

  effect(() => {
    onLoad();
  });
}

export interface TeamOwnerDropdownState {
  owners: WritableSignal<OwnerOption[]>;
  teams: WritableSignal<TeamOption[]>;
  selectedTeamId: WritableSignal<string>;
  ownerLoadError: WritableSignal<string | null>;
  filteredOwners: Signal<OwnerOption[]>;
  initialize: (
    initialTeamId?: string,
    onTeamChange?: (teamId: string) => void | Promise<void>,
  ) => () => void;
  resetLoadState: () => void;
  bindTeamAndLoadOwners: (initialTeamId: string) => Promise<void>;
  loadOwnersForTeam: (teamId: string) => Promise<void>;
}

export function createTeamOwnerDropdown(
  teamControl: FormControl<string>,
  ownerControl: FormControl<string>,
  listOwnerOptions?: (teamId: string) => Observable<OwnerOption[]>,
): TeamOwnerDropdownState {
  const owners = signal<OwnerOption[]>([]);
  const teams = signal<TeamOption[]>([]);
  const selectedTeamId = signal('');
  const ownerLoadError = signal<string | null>(null);
  let cleanupSubscription: (() => void) | null = null;
  let ownerOptionsRequestId = 0;

  const filteredOwners = computed(() => {
    const currentTeamId = selectedTeamId();
    const allOwners = owners();
    if (!currentTeamId) {
      return [];
    }
    return allOwners.filter(
      (owner) => owner.teamId === currentTeamId && owner.isActive,
    );
  });

  if (listOwnerOptions) {
    assertInInjectionContext(createTeamOwnerDropdown);
    effect(() => {
      const currentTeam = teamControl.value;
      const currentOwner = ownerControl.value;
      const availableOwners = filteredOwners();

      if (currentTeam && currentOwner) {
        const ownerExists = availableOwners.some(
          (owner) => owner.id === currentOwner,
        );
        if (!ownerExists) {
          ownerControl.setValue('');
        }
      }
    });
  }

  const initialize = (
    initialTeamId?: string,
    onTeamChange?: (teamId: string) => void | Promise<void>,
  ): (() => void) => {
    const startingTeamId = initialTeamId || '';
    selectedTeamId.set(startingTeamId);

    if (startingTeamId) {
      ownerControl.enable({ emitEvent: false });
    } else {
      ownerControl.disable({ emitEvent: false });
      ownerControl.setValue('', { emitEvent: false });
    }

    const teamSubscription = teamControl.valueChanges.subscribe((teamId = '') => {
      selectedTeamId.set(teamId);
      owners.set([]);

      if (teamId) {
        ownerControl.enable({ emitEvent: false });
        void onTeamChange?.(teamId);
      } else {
        ownerControl.disable({ emitEvent: false });
        ownerControl.setValue('', { emitEvent: false });
      }
    });

    return () => {
      teamSubscription.unsubscribe();
    };
  };

  const resetLoadState = (): void => {
    ownerLoadError.set(null);
    ownerOptionsRequestId += 1;
    owners.set([]);
  };

  const loadOwnersForTeam = async (teamId: string): Promise<void> => {
    const requestId = ++ownerOptionsRequestId;
    ownerLoadError.set(null);
    owners.set([]);

    if (!teamId || !listOwnerOptions) {
      return;
    }

    try {
      const loadedOwners = await firstValueFrom(listOwnerOptions(teamId));
      if (
        requestId !== ownerOptionsRequestId ||
        selectedTeamId() !== teamId
      ) {
        return;
      }
      owners.set(loadedOwners);
    } catch {
      if (
        requestId !== ownerOptionsRequestId ||
        selectedTeamId() !== teamId
      ) {
        return;
      }
      ownerLoadError.set('Unable to load owners for the selected team.');
    }
  };

  const bindTeamAndLoadOwners = async (initialTeamId: string): Promise<void> => {
    cleanupSubscription?.();
    cleanupSubscription = initialize(initialTeamId, (teamId) =>
      loadOwnersForTeam(teamId),
    );
    if (initialTeamId) {
      await loadOwnersForTeam(initialTeamId);
    }
  };

  return {
    owners,
    teams,
    selectedTeamId,
    ownerLoadError,
    filteredOwners,
    initialize,
    resetLoadState,
    bindTeamAndLoadOwners,
    loadOwnersForTeam,
  };
}
