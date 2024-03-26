const { Pool } = require('pg');
const inquirer = require('inquirer')

const pool = new Pool(
    {
      user: 'postgres',
      password: 'password',
      host: 'localhost',
      database: 'movie_db'
    },
    console.log(`Connected to the movie_db database.`)
  ) 

function initialMenu() {
    inquirer
        .prompt([
            {
                type: 'list',
                message: 'What would you like to do?',
                choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'],
                name: 'list'
            }
        ])
        .then((data)=>{
            if (data.list === 'View All Employees') {
                viewAllEmployees()
            } else if (data.list === 'Add Employee') {
                addEmployee()
            } else if (data.list === 'Update Employee Role') {
                updateEmployeeRole()
            } else if (data.list === 'View All Roles') {
                viewAllRoles()
            } else if (data.list === 'Add Role') {
                addRole()
            } else if (data.list === 'View All Departments') {
                viewAllDepartments()
            } else if (data.list === 'Add Department') {
                addDepartment()
            } else if (data.list === 'Quit') {
                return 'Have a nice day!'
            } 

        })

}

function viewAllEmployees() {}

function addEmployee() {}

function updateEmployeeRole() {}

function viewAllRoles() {}

function addRole() {}

function viewAllDepartments() {}

function addDepartment() {}