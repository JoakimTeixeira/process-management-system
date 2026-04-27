import { computed, signal, Signal, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OwnerOption, TeamOption } from '../models/backoffice.models';

export interface TeamOwnerDropdownState {
  owners: WritableSignal<OwnerOption[]>;
  teams: WritableSignal<TeamOption[]>;
  selectedTeamId: WritableSignal<string>;
  filteredOwners: Signal<OwnerOption[]>;
  initialize: (
    initialTeamId?: string,
    onTeamChange?: (teamId: string) => void | Promise<void>,
  ) => () => void;
}

/**
 * Shared logic for team/owner dropdown filtering
 *
 * Usage:
 * 1. Call createTeamOwnerDropdown with your form controls
 * 2. Set owners and teams signals with your data
 * 3. Call initialize() with optional initial team ID - returns a cleanup function
 * 4. Use the signals in your template
 * 5. Call the cleanup function when component is destroyed
 * 6. Set up an effect in your component to clear owner when not in filtered list
 *
 * @param teamControl - The FormControl for team selection
 * @param ownerControl - The FormControl for owner selection
 * @returns Object with signals and initialize method
 */
export function createTeamOwnerDropdown(
  teamControl: FormControl<string>,
  ownerControl: FormControl<string>,
): TeamOwnerDropdownState {
  const owners = signal<OwnerOption[]>([]);
  const teams = signal<TeamOption[]>([]);
  const selectedTeamId = signal('');

  const filteredOwners = computed(() => {
    const currentTeamId = selectedTeamId();
    const allOwners = owners();
    if (!currentTeamId) {
      return [];
    }
    return allOwners.filter((owner) => owner.teamId === currentTeamId);
  });

  const initialize = (
    initialTeamId?: string,
    onTeamChange?: (teamId: string) => void | Promise<void>,
  ): () => void => {
    const startingTeamId = initialTeamId || '';
    selectedTeamId.set(startingTeamId);

    if (startingTeamId) {
      ownerControl.enable({ emitEvent: false });
    } else {
      ownerControl.disable({ emitEvent: false });
      ownerControl.setValue('', { emitEvent: false });
    }

    const teamSubscription = teamControl.valueChanges.subscribe((teamId) => {
      const nextTeamId = teamId || '';
      selectedTeamId.set(nextTeamId);
      owners.set([]);

      if (nextTeamId) {
        ownerControl.enable({ emitEvent: false });
        void onTeamChange?.(nextTeamId);
      } else {
        ownerControl.disable({ emitEvent: false });
        ownerControl.setValue('', { emitEvent: false });
      }
    });

    return () => {
      teamSubscription.unsubscribe();
    };
  };

  return {
    owners,
    teams,
    selectedTeamId,
    filteredOwners,
    initialize,
  };
}
