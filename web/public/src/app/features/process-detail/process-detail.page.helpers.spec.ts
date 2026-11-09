import { convertToParamMap } from '@angular/router';

import {
  PublicProcessDetail,
  PublicProcessVersionView,
} from '../../core/models/public-portal.models';
import {
  buildProcessDetailQueryParams,
  buildProcessDetailTabDefinitions,
  buildProcessVersionOptions,
  countPublishedProcessProcedures,
  formatProcessHistoryDate,
  getCompareSubtitle,
  getCompareTitle,
  getCurrentDetailTabId,
  getProcessTabLabel,
  getProcessVersionForView,
  getPublishedProcessViewsSummary,
  getViewLabel,
  normalizeDetailViewSelection,
  readProcessDetailTabId,
  resolveAvailableProcessViews,
  showsProcessViewSelector,
} from './process-detail.page.helpers';

describe('process-detail.page.helpers', () => {
  const asIsVersion: PublicProcessVersionView = {
    id: 'v1',
    processId: 'p1',
    versionNumber: 1,
    architectureState: 'AS-IS',
    title: 'Current Incident Flow',
    changeDescription: 'Initial',
    reasonForChange: 'Baseline',
    procedures: [
      {
        id: 'proc-1',
        processVersionId: 'v1',
        code: '1.1',
        title: 'Log Incident',
        description: null,
        version: {
          versionNumber: 1,
          architectureState: 'AS-IS',
          title: 'Current Incident Flow',
        },
        process: { id: 'p1', code: '1', title: 'Incident Management' },
        area: { id: 'a1', code: 'A1', title: 'Service Operation' },
        utility: 'Capture',
        warranty: '24x7',
        outcome: 'Logged',
        policy: 'All incidents',
        activities: [],
        inputs: [],
        outputs: [],
      },
    ],
    bpmnAsset: {
      id: 'asset-1',
      caption: 'Diagram',
    },
  };

  const toBeVersion: PublicProcessVersionView = {
    ...asIsVersion,
    id: 'v2',
    versionNumber: 2,
    architectureState: 'TO-BE',
    title: 'Target Incident Flow',
    procedures: [],
    bpmnAsset: null,
  };

  const fullDetail: PublicProcessDetail = {
    process: {
      id: 'p1',
      code: '1',
      title: 'Incident Management',
      description: 'Manage incidents',
      area: { id: 'a1', code: 'A1', title: 'Service Operation' },
      itilPractice: { id: 'ip1', code: 'IM', name: 'Incident Management' },
    },
    versions: {
      asIs: asIsVersion,
      toBe: toBeVersion,
    },
  };

  it('should build tab definitions with badges for version and empty state', () => {
    const withVersion = buildProcessDetailTabDefinitions(asIsVersion, 3, 2);
    expect(withVersion.find((tab) => tab.id === 'diagram')?.badge).toBe('1');
    expect(withVersion.find((tab) => tab.id === 'procedures')?.badge).toBe('1');
    expect(withVersion.find((tab) => tab.id === 'compare')?.badge).toBe('2');

    const withoutVersion = buildProcessDetailTabDefinitions(null, 0, 1);
    expect(withoutVersion.find((tab) => tab.id === 'diagram')?.badge).toBe('0');
    expect(withoutVersion.find((tab) => tab.id === 'procedures')?.badge).toBe('0');
    expect(withoutVersion.find((tab) => tab.id === 'compare')?.badge).toBe('0');
  });

  it('should normalize active tab IDs, view selectors, and tab labels', () => {
    expect(getCurrentDetailTabId('default')).toBe('overview');
    expect(getCurrentDetailTabId('diagram')).toBe('diagram');

    expect(showsProcessViewSelector('overview')).toBe(true);
    expect(showsProcessViewSelector('diagram')).toBe(true);
    expect(showsProcessViewSelector('procedures')).toBe(true);
    expect(showsProcessViewSelector('history')).toBe(false);
    expect(showsProcessViewSelector('compare')).toBe(false);

    expect(getProcessTabLabel('overview')).toBe('Overview');
    expect(getProcessTabLabel('diagram')).toBe('Diagram');
    expect(getProcessTabLabel('procedures')).toBe('Procedures');
    expect(getProcessTabLabel('history')).toBe('History');
    expect(getProcessTabLabel('compare')).toBe('Compare');
  });

  it('should build version options and resolve version for view', () => {
    expect(buildProcessVersionOptions(null)).toEqual([]);
    expect(buildProcessVersionOptions(fullDetail)).toEqual([
      { id: 'as-is', label: 'Current State (v1)' },
      { id: 'to-be', label: 'Target State (v2)' },
    ]);

    expect(getProcessVersionForView(fullDetail, 'as-is')).toEqual(asIsVersion);
    expect(getProcessVersionForView(fullDetail, 'to-be')).toEqual(toBeVersion);
    expect(getProcessVersionForView(null, 'as-is')).toBeNull();
    expect(getProcessVersionForView(null, 'to-be')).toBeNull();
  });

  it('should format view labels, compare headers, procedure counts, and view summaries', () => {
    expect(getViewLabel('as-is')).toBe('Current State');
    expect(getViewLabel('to-be')).toBe('Target State');

    expect(getCompareTitle(asIsVersion, 'Fallback')).toBe('Current Incident Flow');
    expect(getCompareTitle(null, 'Fallback')).toBe('Fallback');
    expect(getCompareSubtitle(asIsVersion, 'Current State')).toBe('Current State | v1');
    expect(getCompareSubtitle(null, 'Current State')).toBe('Current State');

    expect(countPublishedProcessProcedures(null)).toBe(0);
    expect(countPublishedProcessProcedures(fullDetail)).toBe(1);

    expect(getPublishedProcessViewsSummary(null)).toBe('Unavailable');
    expect(getPublishedProcessViewsSummary(fullDetail)).toBe('Current State and Target State');
    expect(
      getPublishedProcessViewsSummary({
        ...fullDetail,
        versions: { asIs: null, toBe: null },
      }),
    ).toBe('No published views');
  });

  it('should format history dates and handle missing or invalid dates', () => {
    expect(formatProcessHistoryDate()).toBe('Not recorded');
    expect(formatProcessHistoryDate('not-a-date')).toBe('Not recorded');
    expect(formatProcessHistoryDate('2026-03-15T10:00:00.000Z')).toContain('2026');
  });

  it('should read tab IDs from query params or route data and build query params', () => {
    expect(
      readProcessDetailTabId({ tab: 'overview' }, convertToParamMap({ tab: 'procedures' })),
    ).toBe('procedures');
    expect(readProcessDetailTabId({ tab: 'history' }, convertToParamMap({}))).toBe('history');
    expect(readProcessDetailTabId({ tab: 'unknown' }, convertToParamMap({}))).toBe('default');

    expect(normalizeDetailViewSelection('to-be')).toBe('to-be');
    expect(normalizeDetailViewSelection('invalid', 'as-is')).toBe('as-is');

    expect(buildProcessDetailQueryParams('compare', 'as-is', 'as-is', 'to-be')).toEqual({
      left: 'as-is',
      right: 'to-be',
    });
    expect(buildProcessDetailQueryParams('history', 'as-is', 'as-is', 'to-be')).toBeUndefined();
    expect(buildProcessDetailQueryParams('diagram', 'to-be', 'as-is', 'to-be')).toEqual({
      view: 'to-be',
    });
  });

  it('should resolve available process views for single-view and dual-view processes', () => {
    const onlyToBe: PublicProcessDetail = {
      ...fullDetail,
      versions: { asIs: null, toBe: toBeVersion },
    };
    expect(resolveAvailableProcessViews(onlyToBe, 'as-is', 'as-is', 'to-be')).toEqual({
      selectedViewId: 'to-be',
      compareLeftViewId: 'to-be',
      compareRightViewId: 'to-be',
    });

    expect(resolveAvailableProcessViews(null, 'as-is', 'as-is', 'to-be')).toEqual({
      selectedViewId: 'as-is',
      compareLeftViewId: 'as-is',
      compareRightViewId: 'as-is',
    });

    expect(resolveAvailableProcessViews(fullDetail, 'to-be', 'to-be', 'to-be')).toEqual({
      selectedViewId: 'to-be',
      compareLeftViewId: 'to-be',
      compareRightViewId: 'as-is',
    });
  });
});

