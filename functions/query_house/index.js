// 云函数入口文件
const cloud = require('wx-server-sdk')
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'cdb-kvzkkqnb.gz.tencentcdb.com',
    user     : 'root',
    port: 10028,
    password : 'ysly2345',
    database : 'shenfangke'
});

connection.connect();

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext();

    return connection.query('SELECT * from house limit 1', function (error, results, fields) {
        console.log(results)
        return {"a": results}
    });
}