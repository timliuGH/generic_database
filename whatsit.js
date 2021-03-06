module.exports = function() {
    var express = require('express');
    var router = express.Router();

    /* Remove entries with just spaces and no text */
    function cleanData(res, mysql, context, complete) {
        mysql.pool.query("DELETE FROM whatsit WHERE name LIKE ' %'", function(error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            //context.whatsit = results;
            //complete();
        });
    }

    /* SELECT Whatsits to populate table */
    function getWhatsits(res, mysql, context, complete) {
        mysql.pool.query("SELECT name, importance FROM whatsit ORDER BY name", function(error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.whatsit = results;
            complete();
        });
    }

    /* Display Whatsit info: Name, Importance */
    router.get('/', function(req, res) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        cleanData(res, mysql, context, complete);
        getWhatsits(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {  // Update for each asynchronous call
                res.render('whatsit', context);
            }
        }
    });

    /* Add a Whatsit; redirects to /whatsit after adding */
    router.post('/', function(req, res) {
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO whatsit (name, importance) VALUES (?, ?)";
        var inserts = [req.body.name, req.body.importance];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            } else if (!req.body.name.replace(/\s/g, '').length) {
                res.render('invalidWhatsit');
            }
            else {
                res.redirect('/whatsit');
            }
        });
    });

    return router;
}();
