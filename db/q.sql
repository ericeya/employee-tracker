SELECT  e.id, e.first_name, e.last_name, title
, department.name as department, salary, m.first_name || ' ' || m.last_name  AS manager FROM employee e
JOIN role
ON role_id = role.id
JOIN department
ON department_id = department.id
LEFT JOIN employee m
ON m.id = e.manager_id;

SELECT r.id, r.title, d.name as department, r.salary
FROM role r
JOIN department d
ON department_id = d.id;

SELECT MAX(id) FROM department;   
SELECT nextval(pg_get_serial_sequence(department, id));