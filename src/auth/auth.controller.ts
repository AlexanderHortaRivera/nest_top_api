import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	Inject,
	Post,
	UsePipes,
	ValidationPipe
} from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import { AuthService } from "./auth.service";
import { ALREADY_REGISTERED_ERROR } from "./auth.constants";

@Controller('auth')
export class AuthController {

	constructor(@Inject(AuthService) private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe())
	@Post('register')
	async register(@Body() dto: AuthDto) {
		const oldUser = await this.authService.findUser(dto.login);
		if(oldUser) {
			throw new BadRequestException(ALREADY_REGISTERED_ERROR);
		}
		return this.authService.createUser(dto);
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(@Body() { login, password }: AuthDto) {

		// получаем пользователя
		const { email } = await this.authService.validateUser(login, password);

		// возвращаем его jwt
		return this.authService.login(email);
	}
}
