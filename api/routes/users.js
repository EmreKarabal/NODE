var express = require('express');
const bcrypt = require("bcrypt-nodejs");
const is = require("is_js");
const jwt = require("jwt-simple");
const Users = require('../db/models/Users');
const Response = require("../lib/Response");
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const UserRoles = require('../db/models/UserRoles');
const Roles = require('../db/models/Roles');
const config = require('../config');
var router = express.Router();
const auth = require("../lib/auth")();
const i18n = new (require("../lib/i18n"))(config.DEFAULT_LANG);
const { rateLimit } = require("express-rate-limit");
const RateLimitMongo = require("rate-limit-mongo");


const limiter = rateLimit({
  store: new RateLimitMongo({
    uri: config.CONNECTION_STRING,
    collectionName: "rateLimits",
    expireTimeMs: 15 * 60 * 1000 // 15 dakika
  }),
  windowMs: 15 * 60 * 1000, // 15 dakika
  limit: 5, // 5 adet deneme hakkı
  legacyHeaders: false
});


router.post("/register", async (req, res) => {
  let body = req.body;
  try {

    let user = await Users.findOne({});

    if (user) {
      return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND);
    }

    if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", config.DEFAULT_LANG), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", config.DEFAULT_LANG, ["email"]));

    if (is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", config.DEFAULT_LANG), i18n.translate("USER.EMAIL_FORMAT_ERROR", config.DEFAULT_LANG));

    if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", config.DEFAULT_LANG), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", config.DEFAULT_LANG, ["password"]));

    if (body.password.length < Enum.PASS_LENGTH) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", config.DEFAULT_LANG), i18n.translate("USER.PASSWORD_LENGTH_ERROR", config.DEFAULT_LANG, [Enum.PASS_LENGTH.toString()]));
    }

    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

    let createdUser = await Users.create({
      email: body.email,
      password,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number
    });

    let role = await Roles.create({
      role_name: Enum.SUPER_ADMIN,
      is_active: true,
      created_by: createdUser._id
    });

    await UserRoles.create({
      role_id: role._id,
      user_id: createdUser._id
    });



    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
})

router.post("/auth", limiter, async (req, res) => {
  try {

    let { email, password } = req.body;

    Users.validateFieldsBeforeAuth(email, password);

    let user = await Users.findOne({ email });

    if (!user) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", config.DEFAULT_LANG), i18n.translate("USER.AUTH_ERROR", config.DEFAULT_LANG));

    if (!user.validPassword(password)) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", config.DEFAULT_LANG), i18n.translate("USER.AUTH_ERROR", config.DEFAULT_LANG));

    let payload = {
      id: user._id,
      exp: parseInt(Date.now() / 1000) * config.JWT.EXPIRE_TIME
    }

    let token = jwt.encode(payload, config.JWT.SECRET);

    let userRoles = await UserRoles.find({ user_id: user._id }).populate("role_id");
    let roles = userRoles.map(role => role.role_id.role_name);

    let userData = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      last_login: new Date(Date.now()),
      roles
    };

    res.json(Response.successResponse({ token, user: userData }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
})


router.post("/add", /*auth.checkRoles("user_add"),*/ async (req, res) => {
  let body = req.body;
  try {
    if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", config.DEFAULT_LANG), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", config.DEFAULT_LANG, ["email"]));

    if (is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON_VALIDATION_ERROR_TITLE", config.DEFAULT_LANG), i18n.translate("USER.EMAIL_FORMAT_ERROR", config.DEFAULT_LANG));

    if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", config.DEFAULT_LANG), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", config.DEFAULT_LANG, ["password"]));

    if (body.password.length < Enum.PASS_LENGTH) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", config.DEFAULT_LANG), i18n.translate("COMMON.PASSWORD_LENGTH_ERROR", config.DEFAULT_LANG));
    }


    if (!body.roles || !Array.isArray(body.roles) || body.roles.length == 0) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", config.DEFAULT_LANG), i18n.translate("COMMON.FIELD_MUST_BE_ARRAY", config.DEFAULT_LANG, ["roles"]));
    }

    let roles = await Roles.find({ _id: { $in: body.roles } });

    if (roles.length == 0) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", config.DEFAULT_LANG), i18n.translate("COMMON.FIELD_MUST_BE_ARRAY", config.DEFAULT_LANG, ["roles"]));
    }


    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

    let user = await Users.create({
      email: body.email,
      password,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number
    });


    for (let i = 0; i < roles.length; i++) {
      await UserRoles.create({
        role_id: roles[i]._id,
        user_id: user._id
      })
    }

    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));

  } catch (error) {
    res.status(Enum.HTTP_CODES.INT_SERVER_ERROR).json(Response.errorResponse({ success: false }, Enum.HTTP_CODES.CREATED));
  }



});

router.all("*", auth.authenticate(), (req, res, next) => {
  next();
});

/* GET users listing. */
router.get('/', /*auth.checkRoles("user_view"),*/ async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const skip = (page - 1) * perPage;

    const totalUsers = await Users.countDocuments({});

    let users = await Users.find({}, { password: 0 })
      .skip(skip)
      .limit(perPage)
      .lean();

    for (let i = 0; i < users.length; i++) {
      let roles = await UserRoles.find({user_id: users[i]._id}).populate("role_id");
      users[i].roles = roles;
    }

    res.json(Response.successResponse({
      data: users,
      pagination: {
        current_page: page,
        per_page: perPage,
        total: totalUsers,
        total_pages: Math.ceil(totalUsers / perPage)
      }
    }));


  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});


router.post("/update", auth.checkRoles("user_update"), async (req, res) => {
  try {
    let body = req.body;
    let updates = {};

    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", config.DEFAULT_LANG), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", config.DEFAULT_LANG, ["_id"]));

    if (body.password && body.password.length < Enum.PASS_LENGTH) {
      updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
    }

    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
    if (body.first_name) updates.first_name = body.first_name;
    if (body.last_name) updates.last_name = body.last_name;
    if (body.phone_number) updates.phone_number = body.phone_number;

    if (body._id == req.user.id) {
      //throw new CustomError(Enum.HTTP_CODES.FORBIDDEN, i18n.translate("COMMON.NEED_PERMISSIONS", config.DEFAULT_LANG), i18n.translate("COMMON.NEED_PERMISSIONS", config.DEFAULT_LANG, ["_id"]));
      body.roles = null;
    }

    if (Array.isArray(body.roles) && body.roles.length > 0) {

      let userRoles = await UserRoles.find({ user_id: body._id });

      let removedRoles = userRoles.filter(x => !body.roles.includes(x.role_id));
      let newRoles = body.roles.filter(x => !userRoles.map(r => r.role_id).includes(x));

      if (removedRoles.length > 0) {
        await UserRoles.deleteMany({ _id: { $in: removedRoles.map(x => x._id.toString()) } });
      }

      if (newRoles.length > 0) {
        for (let i = 0; i < newRoles.length; i++) {
          let userRole = new UserRoles({
            role_id: newRoles[i],
            user_id: body._id
          });

          await userRole.save();
        }
      }

    }

    await Users.updateOne({ _id: body._id }, updates);

    res.json(Response.successResponse({ success: true }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/delete", auth.checkRoles("user_delete"), async (req, res) => {
  try {
    let body = req.body;

    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", config.DEFAULT_LANG), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", config.DEFAULT_LANG, ["-id"]));

    await Users.deleteOne({ _id: body._id });

    await UserRoles.deleteMany({ user_id: body._id });

    res.json(Response.successResponse({ success: true }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;