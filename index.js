const { Pool } = require('pg');
const inquirer = require('inquirer')

const pool = new Pool(
    {
        user: 'postgres',
        password: 'password',
        host: 'localhost',
        database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
)
console.log('==================================')

async function initialMenu() {
    const response = await inquirer
        .prompt([
            {
                type: 'list',
                message: 'What would you like to do?',
                choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'],
                name: 'list'
            }
        ])
        .then((data) => {
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
                console.log('Have a nice day!')
            }

        })

}

async function viewAllEmployees() {
    const response = await pool.query(`SELECT  e.id, e.first_name, e.last_name, title
    , department.name as department, salary, m.first_name || ' ' || m.last_name  AS manager FROM employee e
    JOIN role
    ON role_id = role.id
    JOIN department
    ON department_id = department.id
    LEFT JOIN employee m
    ON m.id = e.manager_id`, (err, { rows }) => {
        if (err) {
            throw err
        }
        console.log('success!')
        console.table(rows)
        initialMenu()
    })
    
}

async function addEmployee() {
    let currentRoles = [];
    const response1 = await pool.query(`SELECT title FROM role`, (err, { rows }) => {
        if (err) {
            throw err
        } else {
            for (let i = 0; i < rows.length; i++) {
                currentRoles.push(rows[i].title)
            }
        }

    })
    let currentManager = ['None'];
    const response2 = await pool.query(`SELECT first_name || ' ' || last_name as name FROM employee`, (err, {rows}) => {
        if (err) {
            throw err
        } else {
            for (let i = 0; i < rows.length; i++) {
                currentManager.push(rows[i])
            }
        }
    })

    let roles = {}
    const response3 = await pool.query(`SELECT r.id, r.title, d.name as department, r.salary
    FROM role r
    JOIN department d
    ON department_id = d.id`, (err, { rows }) => {
        if (err) {
            throw err;
        }
        for (let i = 0; i < rows.length; i++) {
            roles[rows[i].title] = parseInt(rows[i].id)
            
        }
    })

    let managerRoles = {}
    const response4 = await pool.query(`SELECT id, first_name || ' ' || last_name as name FROM employee`, (err, { rows }) => {
        if (err) {
            throw err;
        } 
        for (let i = 0; i < rows.length; i++) {
            managerRoles[rows[i].name] = parseInt(rows[i].id)
        }
        
    })

    const response5 = await inquirer.prompt([
        {
            type: "input",
            message: "What is the employee's first name?",
            name: "first_name"
        },
        {
            type: "input",
            message: "What is the employee's last name?",
            name: "last_name"
        },
        {
            type: "list",
            message: "What is the employee's role?",
            name: "role",
            choices: currentRoles
        },
        {
            type: "list",
            message: "Who is the employee's manager?",
            name: "manager",
            choices: currentManager
        }

    ]).then((data) => {
        if (data.manager === 'None') {
            pool.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, null)`, [data.first_name, data.last_name, roles[data.role]], (err, data) => {
                if (err) {throw err}
                console.log('Employee added!')
            })
            initialMenu()    
        } else {
            pool.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`, [data.first_name, data.last_name, roles[data.role], managerRoles[data.manager]], (err, data) => {
                if (err) {throw err}
                console.log('Employee added!')
            })
            initialMenu()
        }
    })
}

async function updateEmployeeRole() {
    let empList = []
    const response1 = await pool.query(`SELECT first_name || ' ' || last_name AS name FROM employee`, (err, { rows }) => {
        if (err) {
            throw err
        } else {
            for (let i = 0; i < rows.length; i++) {
                empList.push(rows[i].name)
            }
        }
        console.log(empList)
    })    

    let roleList = []
    const response2 = await pool.query(`SELECT title FROM role`, (err, { rows }) => {
        if (err) {
            throw err
        } else {
            for (let i = 0; i < rows.length; i++) {
                roleList.push(rows[i].title)
            }
        }
    })    

    let empId = {}
    const response3 = await pool.query(`SELECT id, first_name || ' ' || last_name AS name FROM employee`, (err, { rows }) => {
        if (err) {
            throw err;
        }
        for (let i = 0; i < rows.length; i++) {
            empId[rows[i].name] = parseInt(rows[i].id)
        }
    })

    let roleId = {}
    const response4 = await pool.query(`SELECT id, title FROM role`, (err, { rows }) => {
        if (err) {
            throw err;
        }
        for (let i = 0; i < rows.length; i++) {
            roleId[rows[i].title] = parseInt(rows[i].id)
        }
    })

    const response5 = await inquirer.prompt([
        {
            type: "list",
            message: "Which employee's role do you want to update?",
            name: "emp",
            choices: empList
        },
        {
            type: "list",
            message: "Which role do you want to assign the selected employee?",
            name: "newRole",
            choices: roleList
        }
    ]).then((data)=> {
        pool.query(`UPDATE employee SET role_id=$1 WHERE id=$2`, [roleId[data.newRole],empId[data.emp]], (err, data) => {
            if (err) {throw err}
            console.log(`Role was updated for ${data.emp} to ${data.newRole}`)
            initialMenu()
        })
    })
 }

async function viewAllRoles() {
    const response = await pool.query(`SELECT r.id, r.title, d.name as department, r.salary
    FROM role r
    JOIN department d
    ON department_id = d.id`, (err, { rows }) => {
        if (err) {
            throw err;
        }
        console.table(rows)
        initialMenu()
    })
}

async function addRole() {
    let departmentList  = []
    const response1 = await pool.query(`SELECT name FROM department`, (err, { rows }) => {
        if (err) {
            throw err
        } else {
            for (let i = 0; i < rows.length; i++) {
                departmentList.push(rows[i].name)
            }
        }
    })

    let departmentId = {}
    const response4 = await pool.query(`SELECT id, name FROM department`, (err, { rows }) => {
        if (err) {
            throw err;
        } 
        for (let i = 0; i < rows.length; i++) {
            departmentId[rows[i].name] = parseInt(rows[i].id)
        }
        
    })

    const response2 = await inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of this role?',
            name: 'role'
        },
        {
            type: 'input',
            message: 'What is the salary of the role?',
            name: 'salary'
        },
        {
            type: 'list',
            message: 'Which department does the role belong to?',
            name: 'department',
            choices: departmentList
        }
    ]).then((data)=>{
        console.log(departmentId[data.department])
        const salary = parseInt(data.salary)
        pool.query(`INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)`, [data.role, salary, departmentId[data.department]], (err, data) => {
            if (err) {
                throw err
            }
            console.log(`Role added`)
            initialMenu()
        })

    })
    
    
 }

async function viewAllDepartments() {
    const response = await pool.query(`SELECT * FROM department`, (err, { rows }) => {
        if (err) {
            throw err
        }
        console.table(rows)
        initialMenu()
        })

}

async function addDepartment() {
    const response = await inquirer.prompt([
        {
            type: "input",
            message: "What is the name of the department?",
            name: "department"
        }
    ]).then((data)=> {
        pool.query(`INSERT INTO department (name) VALUES ($1)`, [data.department], (err, data) => {
            if (err) {
                throw err
            } 
            console.log(`Added ${data.deparment} to the database.`)
            initialMenu()
        })
    })
 }

initialMenu()
