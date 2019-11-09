// 云函数入口文件
const cloud = require('wx-server-sdk');
const mysql = require('mysql2/promise');

cloud.init();

const get_full_location_by_id = async function (connection, location_id) {
    const [locations, _] = await connection.execute(`SELECT 
        *
        FROM location 
        WHERE locationId = ${location_id}
    `);

    if (!locations) {
        return '';
    }

    const [parentLocations, _no_use] = await connection.execute(`SELECT 
        *
        FROM location 
        WHERE locationId = ${locations[0].parentLocationId}
    `);

    if (!parentLocations) {
        return locations[0].name;
    }

    return `${parentLocations[0].name} ${locations[0].name}`;
};

const get_schools_by_department_id = async function (connection, department_id) {
    const [schools, _] = await connection.execute(`SELECT 
        *
        FROM schooldepartmentrelation
        LEFT JOIN school
        ON schooldepartmentrelation.schoolId = school.schoolId
        WHERE schooldepartmentrelation.departmentId = ${department_id}
    `);

    return schools.map(ele => ele.name).join(" | ");
}

// 云函数入口函数
exports.main = async (event, context) => {
    const connection = await mysql.createConnection({
        host: 'cdb-kvzkkqnb.gz.tencentcdb.com',
        user: 'root',
        port: 10028,
        password: 'ysly2345',
        database: 'shenfangke'
    });

    cond = [];
    const limit = event.pageSize || 20;
    const offset = ((event.page || 1) - 1) * limit;

    if (event.locationIds && event.locationIds.length) {
        cond.push(`bargain.locationId IN (${event.locationIds.join(',')})`)
    }

    if (event.rooms && event.rooms.length) {
        if (event.rooms.includes(0)) {
            cond.push(`bargain.room IN (${event.rooms.join(',')}) OR (ting=0 AND room IN (1, 0))`)
        } else {
            cond.push(`bargain.room IN (${event.rooms.join(',')})`)
        }
    }

    if (event.q) {
        cond.push(`department.name like "%${event.q}%"`)
    }

    const whereSQL = cond.length ? "where " + cond.join(" and ") : "";

    const [houses, fields] = await connection.execute(`SELECT 
        bargain.houseId, bargain.houseType, bargain.area, bargain.bargainPrice, bargain.room, bargain.ting, 
        department.name, department.locationId, bargain.departmentId, bargain.listedPrice, DATE_FORMAT(bargain.listedDate,'%Y-%m-%d') AS listedDate,
        bargain.bargainDuration, DATE_FORMAT(bargain.bargainDate,'%Y-%m-%d') AS bargainDate
        FROM bargain
        left join department 
        on bargain.departmentId = department.departmentId
        ${whereSQL}
        order by bargainDate desc 
        limit ${offset}, ${limit}`);

    for (i = 0; i < houses.length; i++) {
        houses[i].location = await get_full_location_by_id(connection, houses[i].locationId);
        houses[i].schools = await get_schools_by_department_id(connection, houses[i].departmentId);
    }

    return houses;
};