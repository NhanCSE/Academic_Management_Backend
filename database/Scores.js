const db = require("../firebase/firebaseConnection");
const dbUtils = require("../lib/dbUtils");
const modelsError = require("../models/error");



const createScore = async (info, scoreCollection) => {
    try {
        const scoreRef = db.collection(scoreCollection);
        await scoreRef.add(info);
        return {
            success: true
        }

    } catch (error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    }
}

const updateOneScore = async (dbCollection, course_id, updatedInfo) => {
    return await dbUtils.updateOne(dbCollection, ["course_id"], [course_id], updatedInfo);
}

const deleteOneScore = async(dbCollection, course_id) =>{
    return await dbUtils.deleteOne(dbCollection, ["course_id"], [course_id]);
}

const getAllScores = async (scoreCollection) => {
    return await dbUtils.findAll(scoreCollection);
}

const getOneScore = async (scoreCollection, condition) => {
    try {
        const conditionFields = Object.keys(condition);
        const conditionValues = Object.values(condition);
        const result = await dbUtils.findIntersect(scoreCollection, conditionFields, conditionValues);
        return {
            success: true,
            data: result
        }
    } catch(error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    }
}

module.exports = {
    createScore,
    updateOneScore,
    deleteOneScore,
    getAllScores,
    getOneScore
}