import httpStatus from 'http-status';
import AppError from '../utils/AppError.js';

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return next(new AppError(httpStatus.BAD_REQUEST, errorMessage));
    }

    next();
};

export default validate;
