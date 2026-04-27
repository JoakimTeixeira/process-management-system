import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { PublicPortalApiService } from './public-portal-api.service';

describe('PublicPortalApiService', () => {
  let service: PublicPortalApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PublicPortalApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should build public catalog query parameters for search, area, and architectures', () => {
    service
      .listProcesses({
        search: ' Change ',
        areaId: 'area-1',
        architectures: ['AS-IS', 'TO-BE'],
      })
      .subscribe();

    const request = httpMock.expectOne((req) => {
      return (
        req.url === 'http://localhost:3000/public/processes' &&
        req.params.get('search') === 'Change' &&
        req.params.get('areaId') === 'area-1' &&
        req.params.get('architectures') === 'AS-IS,TO-BE'
      );
    });

    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('should build catalog search parameters for the home search', () => {
    service.searchCatalog({ search: ' operations ' }).subscribe();

    const request = httpMock.expectOne((req) => {
      return (
        req.url === 'http://localhost:3000/public/search' &&
        req.params.get('search') === 'operations'
      );
    });

    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('should build public procedure search query parameters', () => {
    service.searchProcedures({ search: ' Review ' }).subscribe();

    const request = httpMock.expectOne((req) => {
      return (
        req.url === 'http://localhost:3000/public/procedures' &&
        req.params.get('search') === 'Review'
      );
    });

    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('should call the expected public endpoints', () => {
    service.listAreas().subscribe();
    const areasRequest = httpMock.expectOne('http://localhost:3000/public/areas');
    expect(areasRequest.request.method).toBe('GET');
    areasRequest.flush([]);

    service.getProcessDetail('process-1').subscribe();
    const processRequest = httpMock.expectOne('http://localhost:3000/public/processes/process-1');
    expect(processRequest.request.method).toBe('GET');
    processRequest.flush({});

    service.getProcessVersions('process-1').subscribe();
    const versionsRequest = httpMock.expectOne(
      'http://localhost:3000/public/processes/process-1/versions',
    );
    expect(versionsRequest.request.method).toBe('GET');
    versionsRequest.flush([]);

    service.getProcedureDetail('procedure-1').subscribe();
    const procedureRequest = httpMock.expectOne(
      'http://localhost:3000/public/procedures/procedure-1',
    );
    expect(procedureRequest.request.method).toBe('GET');
    procedureRequest.flush({});

    service.getGlossary().subscribe();
    const glossaryRequest = httpMock.expectOne('http://localhost:3000/public/glossary');
    expect(glossaryRequest.request.method).toBe('GET');
    glossaryRequest.flush({});
  });
});
