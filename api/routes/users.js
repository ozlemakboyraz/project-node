var express = require('express');
const bcrypt = require('bcryptjs');
const is = require('is_js');
const jwt = require('jwt-simple');

const Users = require('../db/models/Users');
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const UserRoles = require('../db/models/UserRoles');
const Roles = require('../db/models/Roles');
const config = require('../config');

var router = express.Router();


/* GET users listing. */
router.get('/', async (req, res) => {
  try {
    let users = await Users.find({});

    res.json(Response.successResponse(users));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});


router.post('/add', async (req, res) => {
  let body = req.body;
  try {

    if (!body.email) throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, "Validation Error", "email field must be fiiled");
    if (!is.email(body.email)) throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, "Validation Error", "email field must be an email");


    if (!body.password) throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, "Validation Error", "password field must be fiiled");
    if (body.password.length < Enum.PASS_LENGTH) {
      throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, "Validation Error", "password length must be greater than " + Enum.PASS_LENGTH);
    }

    if (!body.roles || !Array.isArray(body.roles) || body.roles.length == 0) {
      throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, "Validation Error", "roles field must be an array");
    }

    let roles = await Roles.find({ _id: { $in: body.roles } });

    if (roles.length == 0) {
      throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, "Validation Error", "roles field must be an array");
    }

    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null); // Sifreyi hashliyoruz

    let user = await Users.create({
      email: body.email,
      password: password,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number
    });

    for (let i = 0; i < roles.length; i++) {
      await UserRoles.create({
        role_id: roles[i]._id,
        user_id: user._id
      });
    }

    res.status(Enum.HTTP_STATUS_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_STATUS_CODES.CREATED));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }

});


router.put('/update', async (req, res) => {
  let body = req.body;
  let updates = {};
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, "Validation Error", "_id fields must be fieled");


    if (body.password && body.password.length < Enum.PASS_LENGTH) {
      updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null)
    }

    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
    if (body.first_name) updates.first_name = body.first_name;
    if (body.last_name) updates.last_name = body.last_name;
    if (body.phone_number) updates.phone_number = body.phone_number;


    if (Array.isArray(body.roles) && body.roles.length > 0) {
      let userRoles = await UserRoles.find({ user_id: body._id });


      let removedRoles = userRoles.filter(x => !body.roles.includes(x.role_id));  // Silinecek izinler
      let newRoles = body.roles.filter(x => !userRoles.map(r => r.role_id).includes(x));

      if (removedRoles.length > 0) {
        await UserRoles.deleteMany({ _id: { $in: removedRoles.map(x => x._id.toString()) } });
      }

      // Yeni İzinler Ekleniyor
      if (newRoles.length > 0) {
        for (let i = 0; i < newRoles.length; i++) {
          let userRole = new UserRoles({
            role_id: newRoles[i],
            user_id: body._id,
          });

          await userRole.save();
        }
      }
    }

    await Users.updateMany({ _id: body._id }, updates);

    res.json(Response.successResponse({ success: true }, Enum.HTTP_STATUS_CODES.CREATED));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
})

router.delete('/delete', async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, "Validation Error", "_id fields must be fieled");

    await Users.deleteOne({ _id: body._id });


    await UserRoles.deleteMany({ user_id: body._id });

    res.json(Response.successResponse({ success: true }));
  }

  catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }

});



router.post('/register', async (req, res) => {
  let body = req.body;
  try {

    let user = await Users.findOne({});
    //let user = await Users.findOne({ email: body.email }); // DOĞRU KULLANIM


    if (user) {
      return res.sendStatus(Enum.HTTP_STATUS_CODES.NOT_FOUND);
    }


    if (!body.email) throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, "Validation Error", "email field must be fiiled");
    if (!is.email(body.email)) throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, "Validation Error", "email field must be an email");


    if (!body.password) throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, "Validation Error", "password field must be fiiled");
    if (body.password.length < Enum.PASS_LENGTH) {
      throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, "Validation Error", "password length must be greater than " + Enum.PASS_LENGTH);
    }

    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null); // Sifreyi hashliyoruz


    let createdUser = await Users.create({
      email: body.email,
      password: password,
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


    res.status(Enum.HTTP_STATUS_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_STATUS_CODES.CREATED));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }

});


// Kullanıcı Giriş endpoint
router.post('/auth', async (req, res) => {

  try {

    let { email, password } = req.body;

    Users.validateFieldsBeforeAuth(email, password);


    let user = await Users.findOne({ email: email });

    if (!user) throw new CustomError(Enum.HTTP_STATUS_CODES.UNAUTHORIZED, "Validation Error", "email or password wrong");


    if (!user.validPassword(password)) throw new CustomError(Enum.HTTP_STATUS_CODES.UNAUTHORIZED, "Validation Error", "email or password wrong");

 
    let payload = {
      id: user._id,
      exp: parseInt(Date.now() / 1000) + config.JWT.EXPIRE_TIME
    }

   //jwt token oluştur
    let token = jwt.encode(payload, config.JWT.SECRET);


    let userData = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
    }
    res.json(Response.successResponse({ token:token ,user:userData }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
})



module.exports = router;
