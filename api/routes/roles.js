const express = require('express');
const router = express.Router();
const config = require('../config');
const Roles = require('../db/models/Roles');
const RolePrivileges = require('../db/models/RolePrivileges');
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const role_privileges = require('../config/role_privileges');
const auth = require('../lib/auth')();
const i18n = new (require("../lib/i18n"))(config.DEFAULT_LANG);


router.all('*', auth.authenticate(), (req, res, next) => {
    next();
});


router.get('/', auth.checkRoles("role_view"), async (req, res) => {
    try {
        let roles = await Roles.find({}).lean(); //lean koyunca bu alanın artık burdan dönenn değerin model objesi değil de bir js objesi olmasını sağlıyor

        for (let i = 0; i < roles.length; i++) {
            let permissions = await RolePrivileges.find({ role_id: roles[i]._id });
            roles[i].permissions = permissions;
        }

        res.json(Response.successResponse(roles));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }


});


router.post('/add', auth.checkRoles("role_add"), async (req, res) => {
    let body = req.body;
    try {
        if (!body.role_name)
            throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["role_name"]));

        if (!body.permissions || !Array.isArray(body.permissions || body.permissions.length === 0))
        //permissions alanı yoksa ya da var ama dizi degilse
        {
            throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_TYPE", req.user?.language, ["permissions", "Array"]));
        }

        let role = new Roles({
            role_name: body.role_name,
            is_active: true,
            created_by: req.user?.id  //req.user varsa id yi al eğer yoksa id için null dön 
        });

        await role.save();

        for (let i = 0; i < body.permissions.length; i++) {
            let priv = new RolePrivileges({
                role_id: role._id,
                permission: body.permissions[i],
                created_by: req.user?.id
            });

            await priv.save();
        }

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }


});


router.put('/update', auth.checkRoles("role_update"), async (req, res) => {
    let body = req.body;
    try {
        if (!body._id)
            throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["_id"]));

        let userRole = await UserRoles.findOne({user_id: req.user.id, role_id: body._id});

        if (userRole) {
            throw new CustomError(Enum.HTTP_STATUS_CODES.FORBIDDEN, i18n.translate("COMMON.NEED_PERMISSIONS", req.user.language),i18n.translate("COMMON.NEED_PERMISSIONS", req.user.language));
        }


        let updates = {};
        if (body.role_name) updates.role_name = body.role_name;
        if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

        if (body.permissions || Array.isArray(body.permissions && body.permissions.length > 0)) {
            let permissions = await RolePrivileges.find({ role_id: body._id });


            let removedPermissions = permissions.filter(x => !body.permissions.includes(x.permission));  // Silinecek izinler
            let newPermissions = body.permissions.filter(x => !permissions.map(p => p.permission).includes(x));


            if (removedPermissions.length > 0) {
                await RolePrivileges.deleteMany({ _id: { $in: removedPermissions.map(x => x._id) } });
            }

            // Yeni İzinler Ekleniyor
            if (newPermissions.length > 0) {
                for (let i = 0; i < newPermissions.length; i++) {
                    let priv = new RolePrivileges({
                        role_id: body._id,
                        permission: typeof newPermissions[i] === "string" ? newPermissions[i] : null,
                        created_by: req.user?.id
                    });

                    await priv.save();
                }
            }
        }
        await Roles.updateOne({ _id: body._id }, updates);

        res.json(Response.successResponse({ success: true }));

    }
    catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});


router.delete('/delete', auth.checkRoles("role_delete"), async (req, res) => {
    let body = req.body;
    try {
        if (!body._id) throw new CustomError(Enum.HTTP_STATUS_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["_id"]));

        await Roles.deleteOne({ _id: body._id });
        res.json(Response.successResponse({ success: true }));
    }
    catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }

});


router.get('/role_privileges', async (req, res) => {
    res.json(role_privileges);
});




module.exports = router;

