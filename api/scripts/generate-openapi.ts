import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/app.factory';
import {
  assertOpenApiDocumentCurrent,
  serializeOpenApiDocument,
} from '../src/common/swagger/openapi-file';
import { createSwaggerDocument } from '../src/common/swagger/swagger-document';

const outputPath = resolve(__dirname, '..', 'openapi', 'openapi.json');

async function generateOpenApi(): Promise<void> {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DataSource)
    .useValue({ query: () => Promise.resolve([]) })
    .compile();
  const app = testingModule.createNestApplication();
  configureApplication(app);

  try {
    const generated = serializeOpenApiDocument(createSwaggerDocument(app));

    if (process.argv.includes('--check')) {
      if (!existsSync(outputPath)) {
        throw new Error(
          'OpenAPI contract is missing. Run npm run openapi:generate --prefix api.',
        );
      }

      assertOpenApiDocumentCurrent(readFileSync(outputPath, 'utf8'), generated);
      console.log('OpenAPI contract is current.');
      return;
    }

    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, generated, 'utf8');
    console.log(`Wrote ${outputPath}`);
  } finally {
    await app.close();
  }
}

void generateOpenApi();
