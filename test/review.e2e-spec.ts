import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from "../src/app.module";
import { CreateReviewDto } from "../src/review/dto/create-review.dto";
import { Types, disconnect } from "mongoose";
import { REVIEW_NOT_FOUND } from "../src/review/review.constants";
import { AuthDto } from "../src/auth/dto/auth.dto";
import { USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR } from "../src/auth/auth.constants";

const productId = new Types.ObjectId().toHexString();
const loginDto: AuthDto = {
	login: 'a3@a.ru',
	password: '3'
}

const testDto: CreateReviewDto = {
	name: 'Тест',
	title: 'Заголовок',
	description: 'Описание тестовое',
	rating: 5,
	productId
}

describe('AppController (e2e)', () => {

	let app: INestApplication;
	let createdId: string;
	let productId: string;
	let token: string;

  beforeEach(async () => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	app = moduleFixture.createNestApplication();
	await app.init();

	const { body } = await request(app.getHttpServer())
						.post('/auth/login')
						.send(loginDto)
	  token = body.access_token;

  });

  it('/review/create (POST) - success', async () => {
	return request(app.getHttpServer())
	.post('/review/create')
	.send(testDto)
	.expect(201)
	.then( ({body}: request.Response) => {
		createdId = body._id;
		productId = body.productId;
		expect(createdId).toBeDefined();
	} );
  });

	it('/review/create (POST) - fail', async () => {
		return request(app.getHttpServer())
		.post('/review/create')
		.send({...testDto, rating:0})
		.expect(400)
		.then( ( {body}: request.Response ) => {
			console.log(body);
		})
	});


	it('/review/byProduct/:productId (GET) - success', async () => {
		return request(app.getHttpServer())
		.get('/review/byProduct/'+productId)
		.set('Authorization', 'Bearer '+token)
		.expect(200)
		.then( ( {body}: request.Response ) => {
			expect(body.length).toBe(1);
		});
	});

	it('/review/byProduct/:productId (GET) - fail', async () => {
		return request(app.getHttpServer())
		.get('/review/byProduct/'+ new Types.ObjectId().toHexString())
		.set('Authorization', 'Bearer '+token)
		.expect(200)
		.then( ( {body}: request.Response ) => {
			expect(body.length).toBe(0);
		});
	});


	it('/review/:id (DELETE) - success', async () => {
		return request(app.getHttpServer())
		.delete('/review/'+createdId)
		.set('Authorization', 'Bearer '+token)
		.expect(200)
	});

	it('/review/:id (DELETE) - fail', async () => {
		return request(app.getHttpServer())
		.delete('/review/'+new Types.ObjectId().toHexString())
		.set('Authorization', 'Bearer '+token)
		.expect(404, {
			statusCode:404,
			message: REVIEW_NOT_FOUND
		});
	});

	it('/auth/login (POST) - success', async () => {
		return request(app.getHttpServer())
		.post('/auth/login')
		.send(loginDto)
		.expect(200)
		.then( ( {body}: request.Response ) => {
			expect(body.access_token).toBeDefined()
		})
	});

	it('/auth/login (POST) - fail, wrong login', async () => {
		return request(app.getHttpServer())
		.post('/auth/login')
		.send({ ...loginDto, login:'2' })
		.expect(401, {
			statusCode:401,
			message: USER_NOT_FOUND_ERROR,
			error: 'Unauthorized'
		});
	});

	it('/auth/login (POST) - fail, wrong password', async () => {
		return request(app.getHttpServer())
		.post('/auth/login')
		.send({ ...loginDto, password:'1' })
		.expect(401, {
			statusCode:401,
			message: WRONG_PASSWORD_ERROR,
			error: 'Unauthorized'
		});
	});


  afterAll( () => {
	 disconnect();
  });

});
