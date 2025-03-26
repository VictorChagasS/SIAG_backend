/**
 * Logger Middleware
 *
 * HTTP request logging middleware that logs information about
 * incoming requests and their responses including timing data.
 *
 * @module CommonMiddlewares
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * HTTP Request Logger Middleware
 *
 * Logs information about incoming HTTP requests and their responses, including:
 * - Request timestamp, method, URL, IP, and user agent
 * - Response status code and processing duration
 *
 * @implements {NestMiddleware}
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  /**
   * Middleware handler function
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   */
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - ${ip} - ${userAgent}`);

    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - ${res.statusCode} - ${duration}ms`);
    });

    next();
  }
}
