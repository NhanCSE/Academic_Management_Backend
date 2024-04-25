const { database: db } = require("../firebase/firebaseConnection");
const dbUtils = require("../lib/dbUtils");
const AdminsRef = db.collection("admins");


const checkExist = async (adminID) => {
    try {
        const query = AdminsRef.where("admin_id", "==", adminID);
        const querySnapshot = await query.get();
        
        if (querySnapshot.empty) {
            return {
                success: true,
                existed: false
            };
        } else {
            return {
                success: true,
                existed: true
            };
        }
    } catch (error) {
        //console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
};


const createNewAdmin = async (info) => {
    try {
        //console.log(info);
        const docRef = await AdminsRef.add(info);
        return {
            success: true,
        };
    } catch (error) {
        //console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

const getOneAdmin = async (info) => {
    try {
        const conditionFields = Object.keys(info);
        const conditionValues = Object.values(info);
        const result = await dbUtils.findIntersect("admins", conditionFields, conditionValues);
        return {
            success: true,
            data: result
        }
    } catch (error) {
        //console.log(error);
        return {
            success: false
        }
    } 
}

module.exports = {
    checkExist,
    createNewAdmin,
    getOneAdmin
}