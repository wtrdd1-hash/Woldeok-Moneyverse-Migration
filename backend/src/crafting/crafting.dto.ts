import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ExecuteCraftingDto {
  @ApiProperty({ description: '제작 레시피 ID', example: 'recipe_moonlight_tint' })
  @IsString()
  @IsNotEmpty()
  recipeId!: string;

  @ApiProperty({ description: '멱등성 키 (UUID)', example: '00000000-0000-0000-0000-000000000000' })
  @IsUUID()
  idempotencyKey!: string;
}
