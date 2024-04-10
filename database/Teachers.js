const db = require("../firebase/firebaseConnection");
const teachersRef = db.collection("teachers");
const dbUtils = require("../lib/dbUtils");
//const studentsRef = db.collection("students");


const checkExist = async (teacherID) => {
    try {
        const query = teachersRef.where("teacher_id", "==", teacherID);
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
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

//CHỈ QUẢN TRỊ VIÊN TẠO MỚI ĐƯỢC GIẢNG VIÊN
const createNewTeacher = async (req) => {
    try {
        if(req.user.role == "Quản trị viên"){
            const docRef = await teachersRef.add(req.body);
            return {
                success: true,
            };
        }
        else{
            return{
                success: false,
                error: "Không phải quản trị viên!"
            }
        }
        
    } catch (error) {
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

//SINH VIÊN XEM ĐƯỢC MỘT SỐ THÔNG TIN, GV VÀ AD XEM ĐƯỢC TẤT CẢ
const getInfoTeacher = async (req) => {
    try{
        const query = await teachersRef.where("teacher_id", "==", req.body.teacher_id).get();
        if (query.empty) {
            return {
                success: false,
                error: `Không tìm thấy giảng viên có mã ${req.body.teacher_id}`
            };
        }

        const data = [];
        if(req.user.role == "Quản trị viên" || req.user.role == "Giảng viên"){
            query.forEach(doc => {
                data.push(doc.data());
            });
        }
        else{ //role == "Sinh viên"
            query.forEach(doc => {
                const { fullname, teacher_id, gender, date_of_birth, email, home_class, level, faculty, major } = doc.data();
                data.push({fullname, teacher_id, gender, date_of_birth, email, home_class, level, faculty, major});
            });
        }
        return {
            success: true,
            data: data
        };
    }
    catch{
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

const getOneTeacher = async(condition) => {
    try {
        const conditionFields = Object.keys(condition);
        const conditionValues = Object.values(condition);
        const result = await dbUtils.findIntersect("teachers", conditionFields, conditionValues);
        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error(error.message);
        return modelsError.error(500, error.message);
    }
}

//ADMIN LẤY ĐƯỢC TẤT CẢ THÔNG TIN GIẢNG VIÊN
const getAllTeacher = async(req)=>{
    try{
        if(req.user.role != "Quản trị viên"){
            return{
                success: false,
                error: "Không phải quản trị viên!"
            }
        }
        const querySnapshot = await teachersRef.get();
        const data = querySnapshot.docs.map(doc => doc.data());
        return {
            success: true,
            data: data
        };
    }
    catch{
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

//CẬP NHẬT THÔNG TIN
const updateInfoTeacher = async(req) => {
    try{
        const data = req.body;
        const updateData = {
            phone_number: data.phone_number,
            address: data.address

        }
        const query = await teachersRef.where("teacher_id", "==", req.body.teacher_id).get();
        if (query.empty) {
            return {
                success: false,
                error: `Không tìm thấy giảng viên có mã ${id}`
            };
        }
        if(req.user.role == "Quản trị viên"){
            query.forEach(async doc => {
                await teachersRef.doc(doc.id).update(data);
            });
        }
        else if(req.user.role == "Giảng viên"){
            query.forEach(async doc => {
                await teachersRef.doc(doc.id).update(updateData);
            });
        }
        else{
            return{
                success: false,
                error: "Sinh viên không được chỉnh sửa thông tin Giảng viên!"
            }
        }
        return {
            success: true
        };
    }
    catch{
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
}


//CHỈ ADMIN MỚI ĐƯỢC XÓA
const deleteTeacher = async(req) => {
    try{
        if(req.user.role != "Quản trị viên"){
            return{
                success: false,
                error: "Không phải quản trị viên!"
            }
        }
        const query = await teachersRef.where("teacher_id", "==", req.body.teacher_id).get();
        if (query.empty) {
            return {
                success: false,
                error: `Không tìm thấy giảng viên có mã ${req.body.id}`
            };
        }
        //XÓA
        query.forEach(async doc => {
            await doc.ref.delete();
        });
        return {
            success: true
        };
    }
    catch{
        console.error(error.message);
        return {
            success: false,
            error: error.message
        };
    }
}


module.exports = {
    checkExist,
    createNewTeacher,
    getInfoTeacher,
    updateInfoTeacher,
    deleteTeacher,
    getOneTeacher
}