import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateProcedureDto } from './create-procedure.dto';
import { UpdateProcedureDto } from './update-procedure.dto';

describe('Procedure DTO validation', () => {
  it('rejects create payloads without activities, inputs, and outputs', async () => {
    const dto = plainToInstance(CreateProcedureDto, {
      title: 'Validate request',
      utility: 'Ensure the request is complete',
      warranty: 'Consistent intake',
      outcome: 'Validated request',
      policy: 'Follow intake policy',
      activities: [],
      inputs: [],
      outputs: [],
    });

    const errors = await validate(dto);
    const failingProperties = errors.map((error) => error.property);

    expect(failingProperties).toContain('activities');
    expect(failingProperties).toContain('inputs');
    expect(failingProperties).toContain('outputs');
  });

  it('rejects update payloads that try to clear activities, inputs, or outputs', async () => {
    const dto = plainToInstance(UpdateProcedureDto, {
      activities: [],
      inputs: ['   '],
      outputs: [],
    });

    const errors = await validate(dto);
    const failingProperties = errors.map((error) => error.property);

    expect(failingProperties).toContain('activities');
    expect(failingProperties).toContain('inputs');
    expect(failingProperties).toContain('outputs');
  });

  it('accepts complete procedure payloads', async () => {
    const dto = plainToInstance(CreateProcedureDto, {
      title: 'Validate request',
      utility: 'Ensure the request is complete',
      warranty: 'Consistent intake',
      outcome: 'Validated request',
      policy: 'Follow intake policy',
      activities: [
        {
          resource: 'Coordinator',
          serviceAction: 'Validate request',
          workInstruction: 'Check the submission fields',
        },
      ],
      inputs: ['Request form'],
      outputs: ['Validated request'],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});
