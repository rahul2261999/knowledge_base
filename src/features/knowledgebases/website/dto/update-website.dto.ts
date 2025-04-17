/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class UpdateWebsiteDto {
  @IsUrl()
  url: string;

  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: 0,
    },
    { message: 'depth must be a number' },
  )
  @Min(1, { message: 'depth must be greater than 0' })
  @Max(5, { message: 'depth must be less equal to 0' })
  depth: number;

  @IsOptional()
  @IsBoolean({ message: 'forceRefresh must be a true ort false' })
  @Transform(({ value }) => (value === undefined ? false : value))
  forceRefresh: boolean;
}
