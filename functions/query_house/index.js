// 云函数入口文件
const cloud = require('wx-server-sdk');
const mysql = require('mysql2/promise');

cloud.init();

const get_full_location_by_id = async function(connection, location_id) {
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
}

const get_schools_by_department_id = async function(connection, department_id) {
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
        cond.push(`house.locationId IN (${event.locationIds.join(',')})`)
    }

    if (event.rooms && event.rooms.length) {
        if (event.rooms.includes(0)) {
            cond.push(`house.room IN (${event.rooms.join(',')}) OR (ting=0 AND room IN (1, 0))`)
        } else {
            cond.push(`house.room IN (${event.rooms.join(',')})`)
        }
    }

    if (event.q) {
        cond.push(`department.name like "%${event.q}%"`)
    }

    if (event.areas && event.areas.length) {
        const temp = [];
        event.areas.map(area => {
            if (area.min == 0) {
                temp.push(`(house.area <= ${area.max})`)
            } else if (area.max == 0) {
                temp.push(`(house.area >= ${area.min}`)
            } else {
                temp.push(`(house.price BETWEEN ${area.min} AND ${area.max})`)
            }
        });
        cond.push(temp.join(' OR '));
    }

    if (event.prices && event.prices.length) {
        const temp = [];
        event.prices.map(price => {
            if (price.min == 0) {
                temp.push(`(house.price <= ${price.max})`)
            } else if (price.max == 0) {
                temp.push(`(house.price >= ${price.min}`)
            } else {
                temp.push(`(house.price BETWEEN ${price.min} AND ${price.max})`)
            }
        });
        cond.push(temp.join(' OR '));
    }

    if (event.towards && event.towards.length) {
        const temp = [];
        event.towards.map(toward => {
            temp.push(`(house.orientation like "%${toward}%")`);
        });
        cond.push(temp.join(' OR '));
    }

    const whereSQL = cond.length ? "where " + cond.join(" and ") : "";

    console.log(whereSQL)

    const [houses, fields] = await connection.execute(`SELECT 
        house.houseId, house.houseType, house.orientation, house.area, house.price, house.room, house.ting, house.loan, house.isUnique, 
        house.registerTime, house.monthlyMortgage, department.name, department.locationId, house.departmentId, house.floor, house.rentPrice, house.ladderPerHouseholds
        FROM house 
        left join department 
        on house.departmentId = department.departmentId
        ${whereSQL}
        order by house.houseId desc 
        limit ${offset}, ${limit}`);
    
    for (i=0; i<houses.length;i++) {
        houses[i].location = await get_full_location_by_id(connection, houses[i].locationId);
        houses[i].schools = await get_schools_by_department_id(connection, houses[i].departmentId);
    }

    return houses;
};