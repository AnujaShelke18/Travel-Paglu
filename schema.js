const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.string().required(),
        country: Joi.string().required(),
        location: Joi.string().required().min(0),
        image: Joi.alternatives().try(
            Joi.string().uri().allow('', null), // If it's a valid URL or an empty string/null
            Joi.object({
                url: Joi.string().uri().required()
            }).allow(null) // If it's an object with the 'url' property
        )
    }).required()
});



module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
})