//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fs = require("fs");
const users=require("./db");
const mentors=require("./db1");
const tasksModule=require("./tasks");
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.render("home");
});
app.get("/mentorlogin",function(req,res){
    res.render("mentorlogin");
});
const tasks = tasksModule.getTasks();
app.get("/mentor", function (req, res) {
    
    res.render("mentor", { tasks: tasks });
  });
app.get("/login", function (req, res) {
    res.render("login");
});
app.post("/login", async (req, res) => {
    const mail = req.body.username;
    const pass = req.body.password;
    let authenticated = false;
    let selectedUser = null;
    for (let i = 0; i < users.length; i++) {
        if (mail === users[i]._mail && pass === users[i]._pass) {
            authenticated = true;
            selectedUser=users[i];
            break;
        }
    }
    if (authenticated) {
        const userToken = selectedUser._token;
const userTask = tasks[userToken];
    if (userTask) {
    res.render("secrets", { user:users, token: userTask });
    } else {
    res.send("Tasks not found for this user");
        }
    } else {
        res.send("Invalid username or password"); // Handle authentication failure
    }
});

app.post("/mentorlogin", async (req, res) => {
    const mail = req.body.username;
    const pass = req.body.password;
    let authenticated = false;
    //let selectedUser = null;
    for (let i = 0; i < mentors.length; i++) {
        if (mail === mentors[i]._mail && pass === mentors[i]._pass) {
            authenticated = true;
            //selectedUser=users[i];
            break;
        }
    }
    if (authenticated) {
        //const userToken = selectedUser._token;

    res.render("mentor");
    
    } else {
        res.send("Invalid username or password"); // Handle authentication failure
    }
});

app.post("/create-tasks", function (req, res) {
    // Handle creating tasks logic here
    const teamName = req.body.teamName;
    const taskCount = parseInt(req.body.taskCount);
    const teamTasks = {};
    for (let i = 1; i <= taskCount; i++) {
      teamTasks[`task${i}`] = req.body[`task${i}`];
    }
    const tasks = tasksModule.getTasks();
    tasks[teamName] = teamTasks;
    tasksModule.setTasks(tasks);
    writeToTasksFile(tasks);
    res.redirect("/mentor");
  });
  
  app.post("/clear-tasks", function (req, res) {
    tasksModule.setTasks({}); // Clear tasks data
    writeToTasksFile({});
    res.redirect("/mentor");
  });
  function writeToTasksFile(tasks) {
    const tasksString = `module.exports = {
      getTasks: function() {
        return ${JSON.stringify(tasks, null, 2)};
      },
      setTasks: function(newTasks) {
        tasks = newTasks;
      }
    };`;
  
    fs.writeFileSync("./tasks.js", tasksString, "utf-8");
  }


app.listen(3000, function () {
    console.log("Server started on port 3000.");
});

