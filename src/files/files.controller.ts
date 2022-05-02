import { Controller, HttpCode, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileElementResponse } from "./dto/file-element.response";
import { FilesService } from "./files.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";

@Controller('files')
export class FilesController {

	constructor(private readonly filesService: FilesService) {}

	@Post('upload')
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('files'))
	async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<FileElementResponse[]> {
		return this.filesService.saveFiles([file]);
	}


}
