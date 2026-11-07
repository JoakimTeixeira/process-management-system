import { createApplication } from './app.factory';
import {
  createSwaggerDocument,
  setupSwagger,
} from './common/swagger/swagger-document';
import { buildAppConfig } from './config/app.config';

async function bootstrap() {
  const { port } = buildAppConfig();
  const app = await createApplication();
  const swaggerDocument = createSwaggerDocument(app);

  setupSwagger(app, swaggerDocument);
  await app.listen(port);
}

void bootstrap();
