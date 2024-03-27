const { Pool } = require('pg');
const inquirer = require('inquirer')

// create a connection to the database created via postgres sq
const pool = new Pool(
    {
        user: 'postgres',
        password: 'password',
        host: 'localhost',
        database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
)

// ASCI ART for the app
console.log(`
                                                                               

 /$$$$$$$$                         /$$                                        
| $$_____/                        | $$                                        
| $$       /$$$$$$/$$$$   /$$$$$$ | $$  /$$$$$$  /$$   /$$  /$$$$$$   /$$$$$$ 
| $$$$$   | $$_  $$_  $$ /$$__  $$| $$ /$$__  $$| $$  | $$ /$$__  $$ /$$__  $$
| $$__/   | $$ \ $$ \ $$| $$  \ $$| $$| $$  \ $$| $$  | $$| $$$$$$$$| $$$$$$$$
| $$      | $$ | $$ | $$| $$  | $$| $$| $$  | $$| $$  | $$| $$_____/| $$_____/
| $$$$$$$$| $$ | $$ | $$| $$$$$$$/| $$|  $$$$$$/|  $$$$$$$|  $$$$$$$|  $$$$$$$
|________/|__/ |__/ |__/| $$____/ |__/ \______/  \____  $$ \_______/ \_______/
                        | $$                     /$$  | $$                    
                        | $$                    |  $$$$$$/                    
                        |__/                     \______/                     
 /$$$$$$$$                           /$$                                      
|__  $$__/                          | $$                                      
   | $$  /$$$$$$  /$$$$$$   /$$$$$$$| $$   /$$  /$$$$$$   /$$$$$$             
   | $$ /$$__  $$|____  $$ /$$_____/| $$  /$$/ /$$__  $$ /$$__  $$            
   | $$| $$  \__/ /$$$$$$$| $$      | $$$$$$/ | $$$$$$$$| $$  \__/            
   | $$| $$      /$$__  $$| $$      | $$_  $$ | $$_____/| $$                  
   | $$| $$     |  $$$$$$$|  $$$$$$$| $$ \  $$|  $$$$$$$| $$                  
   |__/|__/      \_______/ \_______/|__/  \__/ \_______/|__/                  
                                                                              

`)

// All functions have been created with async and await in order to have the functions wait for the response from the database for pulling data.
// This function is the main menu which the selection will lead to if/else statements that will check for the list chosen and run the corresponding function.
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

// This function joins all three tables and appropriately place all the columns properly with correct data.
async function viewAllEmployees() {
    // this select from function had to call employee table twice to do a self reference key for manager_id that should display the name of the person instead of their id number.
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
        console.table(rows)
        initialMenu()
    })
    // runs the main menu function again at the end of the function
    
}

async function addEmployee() {
    // In order to add employee, 2 arrays and 2 objects had to be created from the query functions.
    // This array establishes currently available roles by getting the most up to date roles information. This array will be used as a list in the inquirer prompt below.
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

    // This array finds managers and their names and lists them in an array. Starting point is "None" for when there's no manager to the new employee being added.
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

    // This object is to create several key value pairs where key is the title and the value is the role_id. This is to achieve proper formatting of the INSERT INTO query that will be needed below.
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

    // This object with key value pair also is needed to present user with the names of the employee instead of employee's id #. Key is first and last name of the employee and the value is the id of the employee.
    let managerRoles = {}
    const response4 = await pool.query(`SELECT id, first_name || ' ' || last_name as name FROM employee`, (err, { rows }) => {
        if (err) {
            throw err;
        } 
        for (let i = 0; i < rows.length; i++) {
            managerRoles[rows[i].name] = parseInt(rows[i].id)
        }
        
    })

    // this is where the user is prompted to answer the questions for data.
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
        // when there is no manager assigned, below query is ran with value of null
        if (data.manager === 'None') {
            pool.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, null)`, [data.first_name, data.last_name, roles[data.role]], (err, data) => {
                if (err) {throw err}
                console.log('Employee added!')
            })
            // return to main menu with below function
            console.log(`${data.first_name} ${data.last_name} was added with a role of ${data.role}!`)
            initialMenu()    
        } else {
            // When there is a manager, it will grab value of the keys for the 3rd and 4th interpolations from the objects created above.
            pool.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`, [data.first_name, data.last_name, roles[data.role], managerRoles[data.manager]], (err, data) => {
                if (err) {throw err}
                console.log('Employee added!')
            })
            console.log(`${data.first_name} ${data.last_name} was added with a role of ${data.role} reporting to ${data.manager}!`)
            initialMenu()
        }
    })
}


async function updateEmployeeRole() {
    // 2 arrays and 2 objects created to acheive similar concept as the one above.
    let empList = []
    const response1 = await pool.query(`SELECT first_name || ' ' || last_name AS name FROM employee`, (err, { rows }) => {
        if (err) {
            throw err
        } else {
            for (let i = 0; i < rows.length; i++) {
                empList.push(rows[i].name)
            }
        }
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
            type: "confirmation",
            message: "Are you sure (Y/N)?",
            name: "confirmation"
            
        },
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
        })
        console.log(`Role was updated for ${data.emp} to ${data.newRole}`)
        initialMenu()
    })
 }

//  simple function to just view all current roles.
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
    // adding a role requires one array for entering the list from most up-to-date list of departments from the database
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

    // This object is to assign a department with a department_id, but again, presenting user with user-friendly options that states names of the departments to choose from.
    let departmentId = {}
    const response4 = await pool.query(`SELECT id, name FROM department`, (err, { rows }) => {
        if (err) {
            throw err;
        } 
        for (let i = 0; i < rows.length; i++) {
            // ensure the value of the key is integer with parseInt()
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
        // Salary input is converted to integer
        const salary = parseInt(data.salary)
        // departmentId[data.department] will place 3rd interpolation as an integer
        pool.query(`INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)`, [data.role, salary, departmentId[data.department]], (err, data) => {
            if (err) {
                throw err
            }
        })
        console.log(`The role, ${data.role}, was added to list of roles!`)
        initialMenu()
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
            
        })
        console.log(`Added ${data.deparment} to the database.`)
        initialMenu()
    })
 }

//  initialize the main menu when the file is ran.
initialMenu()
