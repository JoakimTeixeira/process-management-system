import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { PUBLIC_API_BASE_URL } from '../../core/api/public-api-base-url';

@Injectable({ providedIn: 'root' })
export class BpmnXmlService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = PUBLIC_API_BASE_URL;

  getXml(processVersionId: string) {
    return this.http.get(`${this.baseUrl}/public/process-versions/${processVersionId}/bpmn`, {
      responseType: 'text',
    });
  }
}
