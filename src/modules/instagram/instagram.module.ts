import { Module } from '@nestjs/common';
import { InstgramAPIWrapper } from './instagram.service';
import { InstagramController } from './instagram.controller';

@Module({
  controllers: [InstagramController],
  providers: [InstgramAPIWrapper],
})
export class InstagramModule {}