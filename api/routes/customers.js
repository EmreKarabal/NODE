const express = require('express');
const router = express.Router();

const Customer = require('../db/models/Customer');
const bcrypt = require('bcryptjs');
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');


router.get('/', async (req, res) => {
    try {
        
        let customers = await Customer.find().select('-password');

        res.json(Response.successResponse({
            data: customers
        }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.get('/:id', async (req, res) => {

    try {

        const customerId = req.params.id;

        if(!customerId) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, 'id parameter required', 'customer._id required');

        const customer = await Customer.find({ _id: customerId}).select('-password');

        if(!customer) throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, 'Customer not found', 'Customer could not be found in db');

        res.json(Response.successResponse({
            data: customer
        }));

    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }

});


router.post('/add', async (req, res) => {
    try {

        let body = req.body;

        if(!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "email field must be filled", "email field must be filled");
        if(!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "password field must be filled", "password field must be filled");
        if(body.password.length < Enum.PASS_LENGTH) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "password must be at least 8 characters", "password must be at least 8 characters");

        let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

        let customer = await Customer.create({
            email: body.email,
            password,
            is_active: true,
            first_name: body.first_name,
            last_name: body.last_name,
            phone_number: body.phone_number
        });

        res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true, _id: customer._id}, Enum.HTTP_CODES.CREATED));

    } catch(err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});


router.post('/update', async (req, res) => {

    try {

        let body = req.body;
        let updates = {};

        if(!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "id field required", "_id field required to make updates");

        if(typeof body.is_active === 'boolean') updates.is_active = body.is_active;
        if(body.first_name) updates.first_name = body.first_name;
        if(body.last_name) updates.last_name = body.last_name;
        if(body.phone_number) updates.phone_number = body.phone_number;


        await Customer.updateOne({ _id: body._id}, updates);
        res.json(Response.successResponse({ success: true}));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
    
});


router.post('/delete', async (req, res) => {

    try {

        let body = req.body;
        if(!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, '_id field is required', '_id field is required in order to delete customer');

        await Customer.deleteOne({ _id: body._id });
        res.json(Response.successResponse({ success: true }));
    } catch (err) {

        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }

});




module.exports = router;