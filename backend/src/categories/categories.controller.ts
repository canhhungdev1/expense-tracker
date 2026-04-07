import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Request() req) {
    return this.categoriesService.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.categoriesService.create(data, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.categoriesService.update(id, req.user.userId, data);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.categoriesService.remove(id, req.user.userId);
  }
}
