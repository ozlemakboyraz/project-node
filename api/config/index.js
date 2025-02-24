module.exports = {
    "PORT": process.env.PORT || "3000",
    "LOG_LEVEL": process.env.LOG_LEVEL || 'debug',
    "CONNECTION_STRING": process.env.CONNECTION_STRING || 'mongodb://localhost:27017/project-node,',
    "JWT": {
        "SECRET": process.env.JWT_SECRET || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OWM3N2RkNWZhNGRkMDkwNGVlOWNkYyIsImV4cCI6MTc0MDMzNjgzNywiZXh0cmFfZGF0YSI6InRoaXNfaXNfYWRkZWRfdG9faW5jcmVhc2VfbGVuZ3RoX29mX2p3dF90b2tlbl8xMjM0NTY3ODkwIn0.P2x82Tqswtvhg7yIz4fHR5FSyBAgdJwWMOwfThaYEWY",
        "EXPIRE_TIME": !isNaN(parseInt(process.env.JWT_EXPIRE_TIME)) ? parseInt(process.env.JWT_EXPIRE_TIME) : 24 * 60 * 60
    },
    "FILE_UPLOAD_PATH": process.env.FILE_UPLOAD_PATH,
    "DEFAULT_LANG": process.env.DEFAULT_LANG || "EN"
}

//Ortam değişkenleri ve yapılandırma dosyaları