var express = require('express');
var router = express.Router();
const Categories = require("../db/models/Categories");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const AuditLogs = require("../lib/AuditLogs");
const logger = require("../lib/logger/LoggerClass");


/* GET categories listing. */
router.get('/', async (req, res, next) =>  {
    
    try{
        let categories = await Categories.find({});
        res.json(Response.successResponse(categories));
    } catch(err){
        let errorResponse = Response.errorResponse(err); 
        res.status(errorResponse.code).json(Response.errorResponse(err));
    }

});


router.post("/add", async (req, res) => {
  let body = req.body;

  try {
    
    if(!body.name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Name fields must be filled!");
    
    let category = new Categories({
        name: body.name,
        is_active: true,
        created_by: req.user?.id
    })

    await category.save();
    
    // USER AUTHENTICATION IS REQUIRED. HOPEFULLY WILL WORK AFTER THAT 
    //AuditLogs.info(req.user?.email, "Categories", "Add", category);
    //logger.info(reg.user?.email, "Categories", "Add", category);
    res.json(Response.successResponse({success: true}));

  } catch(err){
    //logger.error(reg.user?.email, "Categories", "Add", err);
    let errorResponse = Response.errorResponse(err); 
    res.status(errorResponse.code).json(errorResponse);
  }

})

router.post("/update", async (req, res) => {
    let body = req.body;

    try {

        if(!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id fields must be filled!");
        
        let updates = {};

        if(body.name) updates.name = body.name;
        if(typeof body.is_active === "boolean") updates.is_active = body.is_active;

        await Categories.updateOne({_id: body._id}, updates);

        // WAITING ON USER AUTHENTICATION
        //AuditLogs.info(req.user?.email, "Categories", "Update", {_id: body._id, ...updates});

        res.json(Response.successResponse({success: true}));


    } catch(err){
        
        let errorResponse = Response.errorResponse(err); 
        res.status(errorResponse.code).json(errorResponse);

    }
})

router.post("/delete", async (req, res) => {
    let body = req.body;

    try {

        if(!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id fields must be filled!");
        
        await Categories.deleteOne({_id: body._id});

        // WAITING ON USER AUTHENTICATION
        //AuditLogs.info(req.user?.email, "Categories", "Delete", {_id: body._id});


        res.json(Response.successResponse({success: true}));


    } catch(err){

        let errorResponse = Response.errorResponse(err); 
        res.status(errorResponse.code).json(errorResponse);
    }

})


module.exports = router;
