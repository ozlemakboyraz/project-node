//destructuring assignment  yapısı - Parçalama Ataması
//Normalde winston'u şu şekilde de kullanabilirriz
// const winston = require("winston");

// const logger = winston.createLogger({
//    level: "info",
//    format: winston.format.json(),
//    transports: [new winston.transports.Console()]
// });
//Ancak, destructuring kullanarak gereksiz winston. yazmaktan kurtuluyoruz.
//createLogger : Bu fonksiyon, yeni bir logger (kayıt tutucu) oluşturur.
//format: logların nasıl görüneceğini belirleyen bir modüldür. 
//transports: logların nereye yazılacağını,nasıl gönderileceğini belirleyen bir modüldür.

const {format, createLogger, transports} = require("winston");

const {LOG_LEVEL} = require("../../config");

const formats = format.combine(
    format.timestamp({   format: "YYYY-MM-DD HH:mm:ss"}),
    format.simple(),
    format.splat(),
    format.printf(info => `${info.timestamp} ${info.level.toUpperCase()}: [email: ${info.email}] [location: ${info.location}] [proc_type: ${info.proc_type}] [log: ${info.message}`),
)

const logger = createLogger({
    level: LOG_LEVEL,
    transports: [ new transports.Console({ format: formats }) ]

});


module.exports = logger;