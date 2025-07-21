import "reflect-metadata";

jest.mock("axios");

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.PORT = "3002";
});

afterAll(() => {});
