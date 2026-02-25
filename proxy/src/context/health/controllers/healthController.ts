import { Request, Response } from 'express';

export const checkHealth = (req: Request, res: Response): void => {
  res.status(202).json({
    status: 'accepted',
    message: 'born to be alivee',
  });
};