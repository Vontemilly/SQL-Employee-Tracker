const inquirer = require('inquirer');
const mysql = require('mysql2');
require('console.table');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'department_db'
    },
    console.log(
    `===================================================================
========= Welcome to Devonte's MySQL Employee Tracker Database! =========
===================================================================\n`)
);


const menuOptions = [
    {
        type: 'list',
        name: 'request',
        message: 'What would you like to do? ',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit'
        ],
        default: "View all departments"
    },
];


async function promptUser() {
    await inquirer.prompt(menuOptions)
    .then((answer) => {
        console.log('\n');
        switch (answer.request) {
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            case 'Exit':
                db.end();
                console.info('Closing connection with the database... Done! Goodbye.\n');
                break;
        }
    });
}


function viewDepartments() {
    const query = `SELECT * FROM department`;

    db.query(query, (err, data) => {
        if (err) throw err;

        console.table(data);
        promptUser();
    });
}

function viewRoles() {
    
    const query = 
    `
        SELECT r.id, r.title, d.name AS department, r.salary
        FROM role r 
        JOIN department d 
        ON r.department_id = d.id
    `;

    db.query(query, (err, data) => {
        if (err) throw err;
        console.table(data);
        promptUser();
    });
}


function viewEmployees() {
  
    const query = 
    `
        SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee e
        JOIN role r 
        ON e.role_id = r.id
        JOIN department d
        ON r.department_id = d.id
        LEFT JOIN employee m
        ON m.id = e.manager_id
    `;

    db.query(query, (err, data) => {
        if (err) throw err;
        console.table(data);
        promptUser();
    });
}


function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'What is the name of the department you would like to add?',
        }
    ]).then((answer) => {
        var deptName = answer.department;

        const query = 
        `
            INSERT INTO department (name)
            VALUES ('${deptName}')
        `;
        
        db.query(query, (err, data) => {
            if (err) throw err;
            console.log(`\nThe '${deptName}' department was added to the database!\n`);
            promptUser();
        });
    });
}


function addRole() {
    
    var deptQuery = `SELECT * FROM department`;
    
    db.query(deptQuery, (err, deptData) => {
        if (err) throw err;

        const deptChoices = deptData.map(dept => dept.name);
        
        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What is the name of the role you would like to add?',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Okay! What is the salary for this role?',
            },
            {
                type: 'list',
                name: 'department',
                message: 'Great! Now, which department does this role belong to?',
                choices: deptChoices
            },
        ]).then((answer) => {
            
            var { title, salary, department} = answer;
            
            const departmentObj = deptData.find(dept => {
                if (dept.name == department) {
                    return dept;
                }
            });
        
            const query = 
            `
                INSERT INTO role (title, salary, department_id)
                VALUES (
                    '${title}', 
                    '${salary}', 
                    '${departmentObj.id}'
                )
            `;
            
            db.query(query, (err, data) => {
                if (err) throw err;
                console.log(`\nThe '${title}' role was added to the database!\n`);
                promptUser();
            });
        });
    });
}


function addEmployee() {
    
    const roleQuery = `SELECT * FROM role`;
    const managerQuery = 
    `
        SELECT id, CONCAT(first_name, ' ', last_name) as name
        FROM employee
    `;

    db.query(roleQuery, (err, roleData) => {
        if (err) throw err;
        
        db.query(managerQuery, (err, managerData) => {
            if (err) throw err;
        
            const roleChoices = roleData.map((role => role.title));
            var managerChoices = managerData.map((manager => manager.name));
            managerChoices.push('None');
        
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'first',
                    message: 'What is the first name of the employee you want to add?',
                },
                {
                    type: 'input',
                    name: 'last',
                    message: 'And their last name?',
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'Great! Now, choose from the list below what their role will be!',
                    choices: roleChoices
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Sounds good. Does this employee have a manager? Choose from the list below.',
                    choices: managerChoices
                }
            ]).then((answer) => {
                
                var {first, last, role, manager} = answer;
        
                const targetRole = roleData.find(roleObj => {
                    if (roleObj.title == role) {
                        return roleObj;
                    }
                });
                
                if (manager == 'None') {
                    
                    manager = null;
                } else {

                    manager = managerData.find(employee => {
                        if (employee.name == manager) {
                            return employee;
                        }
                    });
                    manager = manager.id;
                }
        
                var query = 
                `
                    INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES (
                        '${first}',
                        '${last}',
                        ${targetRole.id},
                        ${manager}
                    )
                `;
        
                db.query(query, (err, data) => {
                    if (err) throw err;
                    console.log(`\nThe employee '${first} ${last}' was added to the database!\n`);
                    promptUser();
                });
            });
        });
    });
}


function updateEmployeeRole() {
    
    var empQuery = `SELECT * FROM employee`;
    var roleQuery = `SELECT * FROM role`;

    db.query(empQuery, (err, employeeData)=> {
        if (err) throw err;
        
        db.query(roleQuery, (err, roleData) => {
            if (err) throw err;
            
            var empChoices = employeeData.map((emp => emp.first_name + ' ' + emp.last_name));
            var roleChoices = roleData.map(role => role.title);

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    message: 'Which employee\'s role do you want to update?',
                    choices: empChoices
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'Okay! Which role do you want to assign to the selected employee?',
                    choices: roleChoices
                }
            ]).then(answer => {
                
                const targetEmp = employeeData.find(empObj => {
                    const empObjName = `${empObj.first_name} ${empObj.last_name}`;
                
                    if (empObjName == answer.employee) {
                        return empObj;
                    }
                });

                const targetRole = roleData.find(roleObj => {
                    if (roleObj.title == answer.role) {
                        return roleObj;
                    }
                });
                
                const query = 
                `
                    UPDATE employee
                    SET role_id = ${targetRole.id}
                    WHERE id = ${targetEmp.id}
                `;

                db.query(query, (err, data) => {
                    if (err) throw err;
                    console.log(`\nThe role for the employee '${answer.employee}' was changed to '${answer.role}'!\n`);
                    promptUser();
                });
            });
        });
    });
}

promptUser();