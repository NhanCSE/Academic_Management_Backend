const Classes = require("../database/Classes");
const Courses = require("../database/Courses");
const Students = require("../database/Students");
const Teachers = require("../database/Teachers");
const modelsError = require("../models/error");

//Kiểm tra trùng giờ học
const checkConflict = (class1, class2) => {
    let conflict = false;
    console.log(class1.day, class2.day);
    if(class1.day === class2.day) {
        if((class1.period[0] >= class2.period[0] && class1.period[0] <= class2.period[class2.period.length - 1])
            || (class1.period[class1.period.length - 1] >= class2.period[0] && class1.period[class1.period.length - 1] <= class2.period[class2.period.length - 1]))
        {
            conflict = true;
        }
    }
    return conflict;
}

const createClass = async (info) => {

    const course = await Courses.getOneCourse({ course_id: info.course_id });
    if(!course.data) {
        return modelsError.error(404, "Không tồn tại môn học!");
    }
    const classCollection = "courses/" + course.data.id + "/classes";


    let suffixClassID;
    if(info.program === "CQ") {
        suffixClassID = "CQ"; 
    } else if(info.program === "CLC") {
        suffixClassID = "CC";
    } else if(info.program === "VHVL") {
        suffixClassID = "NN";
    }
    const resultGettingAllClass = await Classes.getAllClasses(classCollection);
    if(resultGettingAllClass.length + 1 < 10) {
        info.class_id = info.course_id + "_" + suffixClassID + ('0' + (resultGettingAllClass.length + 1));
    } else {
        info.class_id = info.course_id + "_" + suffixClassID + ('' + (resultGettingAllClass.length + 1));
    }
    
    info.students = new Array();
    info.teacher = null;
    info.course_name = course.data.course_name;
    info.credits = course.data.credits;
    const resultCreating = await Classes.createClass(info, classCollection);
    if(!resultCreating.success) {
        return resultCreating;
    }

    return {
        success: true,
        message: `Tạo lớp có mã ${info.class_id} thành công!`
    }

}

const registerClassForStudent = async (info, student_id) => {
    const course = await Courses.getOneCourse({ course_id: info.course_id });
    if(!course.success || !course.data) {
        return modelsError.error(404, `Môn học ${info.course_id} không tồn tại!`);
    }
    const student = await Students.getOneStudent({ student_id });
    const registerClass = await Classes.getOneClass(`courses/${course.data.id}/classes`, { class_id: info.class_id });
    if(!registerClass.success || !registerClass.data) {
        return modelsError.error(404, `Lớp học ${info.class_id} không tồn tại!`);
    }
    const course_condition = course.data.course_condition; //Danh sách môn học tiên quyết
    var valid = true;
    // Check if student has enough standard credits to register
    // each year require 28 credits to upgrade higher year student
    // EX: First-year student have more than 28 credits will count as Second-year student
    if(student.data.credits < (course.data.student_condition - 1) * 14) {
        return modelsError.error(404, `Sinh viên không đủ tín chỉ để đăng kí lớp này`);
    }

    //Kiểm tra môn học tiên quyết
    const preSubject = Object.keys(student.data.subject);
    for(let courseID of course_condition) {
        if(!preSubject.includes(courseID)) {
            valid = false;
            break;
        } else if(student.data.subject[courseID].GPA < 4.0) {
            // Fail the passing grade
            valid = false;
            break;
        }
    }
    if(!valid) {
        return modelsError.error(409, `Môn học ${info.course_id} cần sinh viên qua tất cả môn tiên quyết!`);
    }
    var conflict = false;
    var registeredClasses = await Classes.getRegisteredClasses(student.data);
    //Kiểm tra có trùng lịch không
    if(registeredClasses.success) {
        for(let registeredClass of registeredClasses.data) {
            if(checkConflict(registerClass.data, registeredClass)) {
                conflict = true;
                break;
            }
        }
    }
    if(conflict) {
        return modelsError.error(409, `Lớp ${info.class_id} trùng lịch học`);
    }

    // Check maximum student in class
    if(registerClass.data.max_students <= registerClass.data.students.length) {
        return modelsError.error(409, `Lớp ${info.class_id} đã đủ số lượng sinh viên`);
    }

    // Check the program

    if(registerClass.data.program !== student.data.program) {
        return modelsError.error(409, `Lớp ${info.class_id} không dành khả dụng ở hệ đào tạo của bạn`);
    }

    const resultRegisterClass = await Classes.registerClassSuccessForStudent(course.data, student.data, registerClass.data);
    if(!resultRegisterClass.success) {
        return resultRegisterClass;
    } 

    return {
        success: true,
        message: resultRegisterClass.message
    }
}

const registerClassForTeacher = async (info, teacher_id) => {
    const course = await Courses.getOneCourse({ course_id: info.course_id });
    if(!course.success || !course.data) {
        return modelsError.error(404, `Môn học ${info.course_id} không tồn tại!`);
    }
    
    const teacher = await Teachers.getOneTeacher({ teacher_id });
    const registerClass = await Classes.getOneClass(`courses/${course.data.id}/classes`, { class_id: info.class_id });
    if(registerClass.data.teacher !== null) {
        return modelsError.error(409, `Lớp học đã có giảng viên giảng dạy!`);
    }
    // Check the subject
    console.log(teacher.data.subject, info.course_id);
    if(!teacher.data.subject.includes(info.course_id)) {
        return modelsError.error(409, `Lớp ${info.class_id} không dành khả dụng ở để đăng kí giảng dạy`);
    }

    let conflict = false;
    let registeredClasses = await Classes.getRegisteredClasses(teacher.data, true);
    //Kiểm tra có trùng lịch không
    if(registeredClasses.success) {
        for(let registeredClass of registeredClasses.data) {
            if(checkConflict(registerClass.data, registeredClass)) {
                conflict = true;
                break;
            }
        }
    }
    if(conflict) {
        return modelsError.error(409, `Lớp ${info.class_id} trùng lịch dạy`);
    }  

    const resultRegisterClass = await Classes.registerClassSuccessForTeacher(course.data, teacher.data, registerClass.data);
    if(!resultRegisterClass.success) {
        return resultRegisterClass;
    } 

    return {
        success: true,
        message: resultRegisterClass.message
    }
}

const updateScore = async (info, class_id, teacher_id) => {
    const student = await Students.getOneStudent({ student_id: info.student_id });
    const teacher = await Teachers.getOneTeacher({ teacher_id });
    const teacherClass = await Classes.getAllClasses(`teachers/${teacher.data.id}/classes`);
    
    const teacherClassID = teacherClass.map(ele => ele.class_id);
    if(!teacherClassID.includes(class_id)) {
        return modelsError.error(409, "Giảng viên không được cập nhật điểm cho lớp khác");
    }

    if(!student.data) {
        return modelsError.error(404, "Không tìm thấy sinh viên!");
    }
    const courseID = class_id.split("_")[0];

    const course = await Courses.getOneCourse({ course_id: courseID });
    if(!course.data) {
        return modelsError.error(404, "Không tìm thấy môn học!")
    }
    const GPA = info.midterm * 0.2 + info.final * 0.5 + info.lab * 0.2 + info.exercise * 0.1;
    
    let Subject = student.data.subject;

    // If studied subject before => check if now get higher point to update
    // else push the new one or return not to change anything
    let updatedFlag = false;
    for (let courseObj of Subject) {
        if(!courseObj[courseID]) continue;
        else {
            if(courseObj[courseID].GPA < GPA) {
                if(courseObj[courseID].GPA < 4 && GPA >= 4) {
                    student.data.credits += courseObj[courseID].credits;
                }
                courseObj[courseID].GPA = GPA;
                updatedFlag = true;
                
            } else return {
                success: true,
                message: `Điểm số hiện tại thấp hơn điểm số trước đây. Không thực hiện cập nhật!`
            }
        }
    }
    if(!updatedFlag) {
        if(Subject.length === 0) {
            Subject = [{
                [courseID]: {
                    GPA: GPA,
                    credits: course.data.credits
                }
            }];
        } else {
            Subject.push({
                [courseID]: {
                    GPA: GPA,
                    credits: course.data.credits
                }
            });
        }
        if(GPA >= 4) student.data.credits += course.data.credits;
    }
    // calculated GPA overall
    let sumGPA = 0;
    let countCredits = 0; 
    for (let courseObj of Subject) {
        for (let courseId in courseObj) {
            let course = courseObj[courseId];
            sumGPA += (course.GPA * course.credits);
            countCredits += course.credits;
        }
    }
    console.log(sumGPA, countCredits);
    const overallGPA = sumGPA / countCredits; 
    const updatedInfo = {
        subject: Subject,
        GPA: overallGPA,
        credits: student.data.credits
    };
    await Students.updateInfoStudent(info.student_id, updatedInfo);
    return {
        success: true,
        message: `Cập nhật điểm số cho sinh viên ${info.student_id} thành công!`
    }
}

const cancelRegisterForStudent = async (info, student_id) => {
    const course = await Courses.getOneCourse({ course_id: info.course_id });
    if(!course.success || !course.data) {
        return modelsError.error(404, `Môn học ${info.course_id} không tồn tại!`);
    }
    const student = await Students.getOneStudent({ student_id });
    const registerClass = await Classes.getOneClass(`courses/${course.data.id}/classes`, { class_id: info.class_id });
    if(!registerClass.success || !registerClass.data) {
        return modelsError.error(404, `Lớp học ${info.class_id} không tồn tại!`);
    }

    let index = registerClass.data.students.indexOf(student_id); // Find the index of the element to be deleted
    if (index !== -1) { // If the element exists in the array
        registerClass.data.students.splice(index, 1); // Remove 1 element at the found index
    } else {
        return modelsError(409, `Sinh viên không học lớp này!`);
    }
    const updatedInfo = {
        students: registerClass.data.students
    }
    await Classes.updateOneClass(`courses/${course.data.id}/classes`, info.class_id, updatedInfo);

    // Delete Class in Student
    await Classes.deleteOneClass(`students/${student.data.id}/classes`, info.class_id);

    return {
        success: true,
        message: `Hủy đăng kí lớp ${info.class_id} cho sinh viên thành công`
    }
}

const cancelRegisterForTeacher = async (info, teacher_id) => {
    const course = await Courses.getOneCourse({ course_id: info.course_id });
    if(!course.success || !course.data) {
        return modelsError.error(404, `Môn học ${info.course_id} không tồn tại!`);
    }
    const teacher = await Teachers.getOneTeacher({ teacher_id });
    const registerClass = await Classes.getOneClass(`courses/${course.data.id}/classes`, { class_id: info.class_id });
    if(!registerClass.success || !registerClass.data) {
        return modelsError.error(404, `Lớp học ${info.class_id} không tồn tại!`);
    }

    const updatedInfo = {
        teacher: null
    }
    await Classes.updateOneClass(`courses/${course.data.id}/classes`, info.class_id, updatedInfo);
    // Delete Class in Student
    await Classes.deleteOneClass(`teachers/${teacher.data.id}/classes`, info.class_id);

    return {
        success: true,
        message: `Hủy đăng kí lớp ${info.class_id} cho giảng viên thành công`
    }
}

module.exports = {
    createClass,
    registerClassForStudent,
    registerClassForTeacher,
    updateScore,
    cancelRegisterForStudent,
    cancelRegisterForTeacher
}