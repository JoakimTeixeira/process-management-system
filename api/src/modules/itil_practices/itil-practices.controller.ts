import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateItilPracticeDto } from './dto/create-itil-practice.dto';
import { ItilPracticeResponseDto } from './dto/itil-practice-response.dto';
import { ItilPracticesService } from './itil-practices.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('itil-practices')
export class ItilPracticesController {
  constructor(private readonly itilPracticesService: ItilPracticesService) {}

  @Roles(Role.EDITOR)
  @Post()
  async create(
    @Body() createItilPracticeDto: CreateItilPracticeDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ItilPracticeResponseDto> {
    const practice = await this.itilPracticesService.create(
      createItilPracticeDto,
      currentUser,
    );

    return this.toItilPracticeResponseDto(practice);
  }

  @Get()
  async list(): Promise<ItilPracticeResponseDto[]> {
    const practices = await this.itilPracticesService.list();

    return practices.map((practice) =>
      this.toItilPracticeResponseDto(practice),
    );
  }

  private toItilPracticeResponseDto(practice: {
    id: string;
    code: string;
    name: string;
    description: string | null;
  }): ItilPracticeResponseDto {
    return new ItilPracticeResponseDto(practice);
  }
}
