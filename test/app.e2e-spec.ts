import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/games (POST) success', () => {
    const payload = {
      rows: 10,
      columns: 10
    }
    return request(app.getHttpServer())
      .post('/games')
      .send(payload)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201)
  })

  it('/games (POST) invalid request properties', () => {
    const badPayload = {
      rows: 'bad',
      columns: 'values'
    }
    return request(app.getHttpServer())
      .post('/games')
      .send(badPayload)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400)
      .expect(res => {
        const errors = res.body.message;
        expect(errors.length).toBe(2);
        expect(errors).toContain("rows must be a number conforming to the specified constraints");
        expect(errors).toContain("columns must be a number conforming to the specified constraints");
      });
  })

  it('/games (POST) missing info', () => {
    const badPayload = {
      rows: ''
    };
    return request(app.getHttpServer())
      .post('/games')
      .send(badPayload)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400)
      .expect(res => {
        const errors = res.body.message;
        expect(errors.length).toBe(4);
        expect(errors).toContain("rows must be a number conforming to the specified constraints");
        expect(errors).toContain("rows should not be empty");
        expect(errors).toContain("columns must be a number conforming to the specified constraints");
        expect(errors).toContain("columns should not be empty");
      });
  })

  it ('/games (GET) success', () => {
    return request(app.getHttpServer())
      .get('/games')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(res => {
        if (!res.body.hasOwnProperty('games')) throw new Error("Expected 'games' key in response");
        if (!res.body.hasOwnProperty('count')) throw new Error("Expected 'count' key in response");
      })
  });

  it ('/games/{id} (GET) success', async () => {
    const payload = {
      rows: 10,
      columns: 20
    }

    return request(app.getHttpServer())
      .post('/games')
      .send(payload)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201)
      .then(res => {
        const id = res.text;
        console.log(`ID value: ${id}`);
        return request(app.getHttpServer())
        .get(`/games/${id}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(res => {
          if (!res.body.hasOwnProperty('status')) throw new Error("Expected 'status' key in response");
          if (!res.body.hasOwnProperty('rows')) throw new Error("Expected 'rows' key in response");
          if (!res.body.hasOwnProperty('columns')) throw new Error("Expected 'columns' key in response");
          if (!res.body.hasOwnProperty('cells')) throw new Error("Expected 'cells' key in response");

          expect(res.body.id).toBe(id);
          expect(res.body.rows).toBe(10);
          expect(res.body.columns).toBe(20);
        })
      })
  });

  it ('/game/{id} (GET) id does not exist', () => {
    return request(app.getHttpServer())
      .get('/game/bad-id-value')
      .expect(404)
  });
});
