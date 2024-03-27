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

function viewAllEmployees() {
    pool.query(`SELECT  e.id, e.first_name, e.last_name, title
    , department.name as department, salary, m.first_name || ' ' || m.last_name  AS manager FROM employee e
    JOIN role
    ON role_id = role.id
    JOIN department
    ON department_id = department.id
    LEFT JOIN employee m
    ON m.id = e.manager_id;`, (err, { rows }) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          message: 'success',
          data: rows
        });
      })
}

function addEmployee() {}

function updateEmployeeRole() {}

function viewAllRoles() {
    pool.query(`SELECT r.id, r.title, d.name as department, r.salary
    FROM role r
    JOIN department d
    ON department_id = d.id;`, (err, { rows }) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          message: 'success',
          data: rows
        });
      })
}

function addRole() {}

function viewAllDepartments() {
    pool.query(`SELECT * FROM department;`, (err, { rows }) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          message: 'success',
          data: rows
        });
      })
}

function addDepartment() {}