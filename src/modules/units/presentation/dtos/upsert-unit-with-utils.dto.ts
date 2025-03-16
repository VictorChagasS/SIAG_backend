import { IsOptionalFormula, IsValidName } from '../utils/validators';

export class UpsertUnitWithUtilsDto {
  @IsValidName()
    name: string;

  @IsOptionalFormula()
    averageFormula?: string;
}
