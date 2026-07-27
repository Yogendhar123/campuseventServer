import { body } from 'express-validator';

export const eventValidator = [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('category').isMongoId().withMessage('Valid category is required'),
  body('venue').isMongoId().withMessage('Valid venue is required'),
  body('capacity').optional().isInt({ min: 0 }).withMessage('Capacity must be a positive number'),
];
