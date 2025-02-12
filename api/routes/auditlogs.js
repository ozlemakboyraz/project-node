var express = require('express');
var router = express.Router();
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const AuditLogs = require('../db/models/AuditLogs');
const moment = require('moment');


router.post("/", async (req, res, next) => {
   try {

      let body = req.body;
      let query = {};
      let skip = body.skip;
      let limit = body.limit;

      if (typeof body.skip !== "numeric") {
         skip = 0;
      }
      if (typeof body.limit !== "numeric" || body.limit > 500) {
         limit = 500;
      }



      if (body.begin_date && body.end_date) {
         query.created_at = {
            $gte: moment(body.begin_date),
            $lte: moment(body.end_date)
         }
      }
      else {
         query.created_at = {
            $gte: moment().subtract(1, 'day').startOf('day'),
            $lte: moment()
            // 1 gün öncesinden itibaren bugüne kadar olan verileri çek
         }

      }


      //sıralamamız için ve filtreleme amacıyla  (son eklenen bize ilk dönecek created_at: -1 )
    //  let auditlogs = await AuditLogs.find(query, { limit: 500, skip: body.skip, sort: { created_at: -1 } }.sort({ created_at: -1 })).skip(skip).limit(limit);

      let auditlogs = await AuditLogs.find(query)
      .limit(limit) 
      .skip(skip) 
      .sort({ created_at: -1 });
   

      
      res.json(Response.successResponse(auditlogs));

   } catch (err) {
      let errorResponse = Response.errorResponse(err);
      res.status(errorResponse.code).json(errorResponse);
   }
});




module.exports = router;
