import { Request, Response } from "express";

async function HelloWorld(req: Request, res: Response) {
  try {
    res.status(200).json({
      message: "Hello World!",
      json: {
        parameter_1: "1",
        parameter_2: "2",
        parameter_3: "3",
      },
    });
  } catch (error) {
    console.log(error);
  }
}

async function GoodMorning(req: Request, res: Response) {
  try {
    res.send("Good Morning!!!");
  } catch (error) {
    console.log(error);
  }
}

export { HelloWorld, GoodMorning };
