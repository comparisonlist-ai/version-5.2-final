// ======================================================
// Students Homework AI
// Version 5.2 Final
// script.js
// Part 1 of 4
// Configuration, App State & Navigation
// ======================================================

// ------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------

const CONFIG = {

    APP_NAME:
        "Students Homework AI",

    VERSION:
        "5.2 Final",

    FREE_TRIAL_DAYS:
        7,

    MAX_FREE_QUESTIONS:
        100,

    DEFAULT_LANGUAGE:
        "English"

};

// ------------------------------------------------------
// APPLICATION STATE
// ------------------------------------------------------

const App = {

    student:
        null,

    currentClass:
        "",

    currentSubject:
        "",

    questionCount:
        0

};

// ------------------------------------------------------
// DOM HELPER
// ------------------------------------------------------

function $(id) {

    return document.getElementById(id);

}

// ------------------------------------------------------
// SCREEN MANAGEMENT
// ------------------------------------------------------

function hideAllScreens() {

    document

        .querySelectorAll(".screen")

        .forEach(

            screen =>

                screen.classList.remove(

                    "active"

                )

        );

}

function showScreen(id) {

    hideAllScreens();

    const screen = $(id);

    if (screen) {

        screen.classList.add(

            "active"

        );

    }

}

// ------------------------------------------------------
// NAVIGATION
// ------------------------------------------------------

function showWelcome() {

    showScreen(

        "welcomeScreen"

    );

}

function showRegistration() {

    showScreen(

        "registrationScreen"

    );

}

function showLogin() {

    showScreen(

        "loginScreen"

    );

}

function showDashboard() {

    if (

        App.student &&

        $("studentDisplayName")

    ) {

        $("studentDisplayName")

            .textContent =

            App.student.name;

    }

    showScreen(

        "dashboardScreen"

    );

}

function showSubject(studentClass) {

    App.currentClass =

        studentClass ||

        App.student.studentClass;

    if (

        $("selectedClassTitle")

    ) {

        $("selectedClassTitle")

            .textContent =

            App.currentClass;

    }

    showScreen(

        "subjectScreen"

    );

}

function selectSubject(subject) {

    App.currentSubject =

        subject;

    if (

        $("selectedSubject")

    ) {

        $("selectedSubject")

            .textContent =

            App.currentClass +

            " • " +

            subject;

    }

    showScreen(

        "aiScreen"

    );

}

// ------------------------------------------------------
// SESSION MANAGEMENT
// ------------------------------------------------------

function saveSession() {

    localStorage.setItem(

        "cbseStudent",

        JSON.stringify(

            App.student

        )

    );

    localStorage.setItem(

        "questionCount",

        App.questionCount

    );

}

function loadSession() {

    const student =

        localStorage.getItem(

            "cbseStudent"

        );

    const questions =

        localStorage.getItem(

            "questionCount"

        );

    if (student) {

        App.student =

            JSON.parse(

                student

            );

    }

    if (questions) {

        App.questionCount =

            Number(

                questions

            );

    }

}

function clearSession() {

    localStorage.removeItem(

        "cbseStudent"

    );

    localStorage.removeItem(

        "questionCount"

    );

    App.student = null;

    App.questionCount = 0;

}

// ------------------------------------------------------
// UTILITY FUNCTIONS
// ------------------------------------------------------

function generateStudentId() {

    return (

        "SHAI" +

        Math.floor(

            100000 +

            Math.random() *

            900000

        )

    );

}
// ------------------------------------------------------
// REGISTRATION
// ------------------------------------------------------

async function registerStudent() {

    const name =
        $("studentName").value.trim();

    const studentClass =
        $("studentClass").value;

    const mobile =
        $("studentMobile").value.trim();

    const parentMobile =
        $("parentMobile").value.trim();

    const email =
        $("studentEmail").value.trim();

    // ----------------------------------
    // VALIDATION
    // ----------------------------------

    if (
        !name ||
        !studentClass ||
        !mobile ||
        !email
    ) {

        alert(
            "Please fill all required fields."
        );

        return;

    }

    if (
        !/^\d{10}$/.test(mobile)
    ) {

        alert(
            "Please enter a valid 10-digit mobile number."
        );

        return;

    }

    // ----------------------------------
    // CHECK EXISTING STUDENT
    // ----------------------------------

    const {

        data: existingStudent,

        error: checkError

    } = await supabase

        .from("students_5.2")

        .select("student_id")

        .eq(
            "mobile_number",
            mobile
        )

        .maybeSingle();

    if (checkError) {

        console.error(checkError);

        alert(
            "Unable to verify registration."
        );

        return;

    }

    if (existingStudent) {

        alert(
            "This mobile number is already registered."
        );

        return;

    }

    // ----------------------------------
    // CREATE STUDENT OBJECT
    // ----------------------------------

    const studentId =
        generateStudentId();

    App.student = {

        studentId:
            studentId,

        name:
            name,

        studentClass:
            studentClass,

        mobile:
            mobile,

        parentMobile:
            parentMobile,

        email:
            email,

        membership:
            "FREE",

        trial:
            true

    };

    // ----------------------------------
    // SAVE TO SUPABASE
    // ----------------------------------

    const {

        error: insertError

    } = await supabase

        .from("students_5.2")

        .insert([{

            student_id:
                studentId,

            name:
                name,

            student_class:
                studentClass,

            mobile_number:
                mobile,

            parent_mobile:
                parentMobile || null,

            email:
                email,

            membership:
                "FREE",

            trial:
                true

        }]);

    if (insertError) {

        console.error(insertError);

        alert(
            "Registration failed."
        );

        return;

    }

    App.questionCount = 0;

    saveSession();

    alert(
        "Registration Successful!"
    );

    showDashboard();

}

// ------------------------------------------------------
// LOGIN
// ------------------------------------------------------

async function loginStudent() {

    const mobile =
        $("loginMobile").value.trim();

    if (
        !/^\d{10}$/.test(mobile)
    ) {

        alert(
            "Please enter a valid mobile number."
        );

        return;

    }

    const {

        data,

        error

    } = await supabase

        .from("students_5.2")

        .select("*")

        .eq(
            "mobile_number",
            mobile
        )

        .maybeSingle();

    if (error) {

        console.error(error);

        alert(
            "Login failed."
        );

        return;

    }

    if (!data) {

        alert(
            "Student not found."
        );

        return;

    }

    App.student = {

        studentId:
            data.student_id,

        name:
            data.name,

        studentClass:
            data.student_class,

        mobile:
            data.mobile_number,

        parentMobile:
            data.parent_mobile,

        email:
            data.email,

        membership:
            data.membership,

        trial:
            data.trial

    };

    saveSession();

    showDashboard();

}
// ------------------------------------------------------
// AI HOMEWORK
// ------------------------------------------------------

async function askAI() {

    const question =
        $("questionInput").value.trim();

    if (!question) {

        alert(
            "Please enter your homework question."
        );

        return;

    }

    $("loadingBox").style.display =
        "block";

    $("answerBox").innerHTML = "";

    try {

        const response =
            await fetch(

                "/api/chat",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        studentId:
                            App.student.studentId,

                        studentClass:
                            App.currentClass,

                        subject:
                            App.currentSubject,

                        question:
                            question,

                        language:
                            CONFIG.DEFAULT_LANGUAGE

                    })

                }

            );

        const result =
            await response.json();

        $("loadingBox").style.display =
            "none";

        if (!response.ok) {

            throw new Error(

                result.error ||

                "Unable to get AI response."

            );

        }

        $("answerBox").innerHTML =
            result.answer;

        App.questionCount++;

        saveSession();

    }

    catch (error) {

        $("loadingBox").style.display =
            "none";

        console.error(error);

        $("answerBox").innerHTML =

            "<p><strong>Error:</strong> " +

            error.message +

            "</p>";

    }

}

// ------------------------------------------------------
// NAVIGATION HELPERS
// ------------------------------------------------------

function backToSubjects() {

    showSubject(

        App.currentClass

    );

}

function logoutStudent() {

    clearSession();

    showWelcome();

}

function clearQuestion() {

    $("questionInput").value = "";

    $("answerBox").innerHTML = "";

}

// ------------------------------------------------------
// QUESTION LIMIT
// ------------------------------------------------------

function canAskQuestion() {

    return (

        App.questionCount <

        CONFIG.MAX_FREE_QUESTIONS

    );

}

function checkQuestionLimit() {

    if (

        !canAskQuestion()

    ) {

        alert(

            "You have reached your free question limit."

        );

        return false;

    }

    return true;

}
// ------------------------------------------------------
// APPLICATION INITIALIZATION
// ------------------------------------------------------

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadSession();

        if (App.student) {

            showDashboard();

        }

        else {

            showWelcome();

        }

        console.log(

            CONFIG.APP_NAME +
            " " +
            CONFIG.VERSION +
            " Loaded Successfully."

        );

    }

);

// ------------------------------------------------------
// GLOBAL ERROR HANDLER
// ------------------------------------------------------

window.addEventListener(

    "error",

    event => {

        console.error(

            "JavaScript Error:",

            event.error

        );

    }

);

// ------------------------------------------------------
// UNHANDLED PROMISE REJECTION
// ------------------------------------------------------

window.addEventListener(

    "unhandledrejection",

    event => {

        console.error(

            "Unhandled Promise:",

            event.reason

        );

    }

);

// ------------------------------------------------------
// VERSION INFORMATION
// ------------------------------------------------------

console.log(

    "===================================="

);

console.log(

    "Students Homework AI"

);

console.log(

    "Repository Version : 5.2 Final"

);

console.log(

    "Supabase Table : students_5.2"

);

console.log(

    "Application Ready"

);

console.log(

    "===================================="

);

// ======================================================
// END OF FILE
// ======================================================
