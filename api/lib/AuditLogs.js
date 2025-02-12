const AuditLogsModel = require('../db/models/AuditLogs');
//AuditLogs sınıfı, uygulamanızdaki belirli işlemleri (loglama işlemlerini) takip edip veritabanına kaydetmek için tasarlanmıştır. 
// Audit log (denetim kaydı), bir sistemde gerçekleşen olayların kayıt altına alınmasını sağlayarak, 
// kim hangi işlemi ne zaman yapmış gibi bilgilerin saklanmasına yardımcı olur.


const Enum = require('../config/Enum');

let instance = null;
class AuditLogs {
    constructor() {
        if (!instance) {
            instance = this;
        }
        return instance;
    }

    info(email, location, proc_type, log) {
        this.#saveToDB({
            level: Enum.LOG_LEVELS.INFO,
            email, location, proc_type, log
        });
    }

    warning(email, location, proc_type, log) {
        this.#saveToDB({ 
            level: Enum.LOG_LEVELS.WARNING, 
            email, location, proc_type, log });
    }

  error(email, location, proc_type, log) {
        this.#saveToDB({ 
            level: Enum.LOG_LEVELS.ERROR, 
            email, location, proc_type, log });
    }


    debug(email, location, proc_type, log) {
        this.#saveToDB({ 
            level: Enum.LOG_LEVELS.DEBUG, 
            email, location, proc_type, log });
    }

    verbose(email, location, proc_type, log) {
        this.#saveToDB({ 
            level: Enum.LOG_LEVELS.VERBOSE,
            email, location, proc_type, log });
    }

    http(email, location, proc_type, log) {
        this.#saveToDB({ 
            level: Enum.LOG_LEVELS.HTTP, 
            email, location, proc_type, log });
    }


    //veritabanına kayıt metodu
    // bu metodu sadece bu classtan erişşim yap # işareti bu demek private yani
    #saveToDB({ level, email, location, proc_type, log }) {
        AuditLogsModel.create({
            level,
            email,
            location,
            proc_type,
            log
        })
    }


}

module.exports = new AuditLogs();