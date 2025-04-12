import { IsNumber, IsUrl, Max, Min } from "class-validator";

export class CreateWebsiteDto {
  @IsUrl()
  url: string;

  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: 0,
    },
    { message: 'depth must be a number' }
  )
  @Min(1, { message: 'depth must be greater than 0' })
  @Max(5, { message: 'depth must be less equal to 0' })
  depth: number;
}