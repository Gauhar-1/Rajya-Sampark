import Joi from 'joi';

const sendOtpSchema = Joi.object({
    data: Joi.object({
        phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
            'string.pattern.base': 'Phone number must be 10 digits',
            'any.required': 'Phone number is required'
        })
    }).required(),
    locationData: Joi.object({
        latitude: Joi.number().required().messages({
            'any.required': 'Latitude is required'
        }),
        longitude: Joi.number().required().messages({
            'any.required': 'Longitude is required'
        })
    }).required()
});

const verifyOtpSchema = Joi.object({
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Phone number must be 10 digits',
        'any.required': 'Phone number is required'
    }),
    otp: Joi.string().length(6).required().messages({
        'string.length': 'OTP must be 6 digits',
        'any.required': 'OTP is required'
    })
});

export default {
    sendOtpSchema,
    verifyOtpSchema
};
