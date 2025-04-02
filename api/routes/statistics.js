const express = require('express');
const router = express.Router();

const User = require('../db/models/Users');
const mongoose = require('mongoose');
const auth = require("../lib/auth")();

router.all("*", auth.authenticate(), (req, res, next) => {
    next();
})


router.get("/", async (req, res) => {

    try {

        // NEW USERS

        const dailyUsers = await User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);


        // Users which were online in 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activeUsers = await User.aggregate([
            {
                $match: { last_login: { $gte: sevenDaysAgo } }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$last_login" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);


        // User Roles
        const userRoles = await User.aggregate([
            {
                $lookup: {
                    from: "user_roles",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "user_roles"
                }
            },
            {
                $unwind: "$user_roles"
            },
            {
                $lookup: {
                    from: "roles",
                    localField: "user_roles.role_id",
                    foreignField: "_id",
                    as: "role_data"
                }
            },
            {
                $unwind: "$role_data"
            },
            {
                $group: {
                    _id: "$role_data.role_name",
                    count: { $sum: 1 }
                }
            }
        ]);



        res.json({
            dailyUsers: {
                dates: dailyUsers.map(d => d._id),
                counts: dailyUsers.map(d => d.count)
            },
            activeUsers: {
                dates: activeUsers.map(d => d._id),
                counts: activeUsers.map(d => d.count)
            },
            userRoles: {
                labels: userRoles.map(r => r._id || "No role"),
                counts: userRoles.map(r => r.count)
            }
        });


    }
    catch (err) {

        console.error(err);
        res.status(500).json({ message: "İstatistiklerde hata" });

    }
});


module.exports = router;