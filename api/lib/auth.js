const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const Users = require('../db/models/Users');
const UserRoles = require('../db/models/UserRoles');
const RolePrivileges = require('../db/models/RolePrivileges');

const config = require('../config');

// secretOrKey: Token'ı doğrulamak için kullanılan gizli anahtar (config.JWT.SECRET).
// jwtFromRequest: JWT'nin hangi kaynaktan alınacağını belirtiyor. Burada Bearer Token başlığından (Authorization: Bearer <TOKEN>) alınıyor.
// Callback fonksiyonu (async (payload, done) => {}), token doğrulandıktan sonra çalışacak fonksiyon.
module.exports = function () {
    let strategy = new Strategy({
        secretOrKey: config.JWT.SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }, async (payload, done) => {

        try {


            let user = await Users.findOne({ _id: payload.id });
            if (user) {

                let userRoles = await UserRoles.find({ user_id: payload.id });

                let rolePrivileges = await RolePrivileges.find({ role_id: { $in: userRoles.map(x => x.role_id) } });

                done(null,
                    {
                        id: user._id,
                        email: user.email,
                        roles: rolePrivileges,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        exp: parseInt(Date.now() / 1000) + config.JWT.EXPIRE_TIME
                    });

            } else {
                done(new Error('User not found'), null);
            }
        } catch (err) {
            done(err, null);
        }
    });

    passport.use(strategy);

    return {
        initialize: function(){
            return passport.initialize();
        },
        authenticate: function() {
            return passport.authenticate('jwt', {session: false});
        }
    }

}