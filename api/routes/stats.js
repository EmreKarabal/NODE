const express = require("express");
const router = express.Router();
const Response = require("../lib/Response");
const auth = require("../lib/auth")();
const AuditLogs = require("../db/models/AuditLogs");
const Categories = require("../db/models/Categories");
const Users = require("../db/models/Users");


router.all("*", auth.authenticate(), (req, res, next) => {
    next();
});

router.post("/auditlogs/categories", async (req, res) => {

    try {

        let result = await AuditLogs.aggregate([
            {$match: {location: "Categories"}},
            {$group: {_id: {email: "$email", proc_type: "$proc_type"}, count: {$sum: 1}}},
            {$sort: {coun: -1}}
        ]);

        res.json(Response.successResponse(result));

    }  catch (err) {

        let errorResponse = Response.errorResponse(err, req.user?.language);
        res.status(errorResponse.code).json(errorResponse);

    }
})

router.post("/categories/unique", async (req, res) => {

    try {

        let result = await Categories.distinct("name", {is_active: true});

        res.json(Response.successResponse({result, count: result.length}));

    } catch (err) {

        let errorResponse = Response.errorResponse(err, req.user?.language);
        res.status(errorResponse.code).json(errorResponse);

    }


});

router.post("/users/count", async (req, res) => {

    try {            
        
        let result = await Users.countDocuments({is_active: true});

        res.json(Response.successResponse({result}));

    } catch (err) {

        let errorResponse = Response.errorResponse(err, req.user?.language);
        res.status(errorResponse.code).json(errorResponse);

    }

});


module.exports = router;