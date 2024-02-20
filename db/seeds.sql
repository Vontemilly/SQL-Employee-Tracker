

-- Insert departments
INSERT INTO department (name)
VALUES ("engineering"),
       ("finance"),
       ("legal"),
       ("sales");

-- Insert role
INSERT INTO role (department_id, title, salary)
VALUES (1, "software engineer", "120000"),
       (2, "accountant", "125000"),
       (1, "lead engineer", "150000"),
       (2, "account manager", "160000"),
       (3, "lawyer", "190000"),
       (4, "salesperson", "80000"),
       (3, "legal team lead", "250000"),
       (4, "sales lead", "100000");


INSERT INTO employee (first_name, last_name, role_id,  manager_id)
VALUES ("jay", "benjiman", 1,  3),
       ("ali", "clam", 2,  4),
       ("john", "linksi", 3, NULL),
       ("maria", "gomez", 4, NULL),
       ("jen", "kaufman", 5, 7),
       ("andrew", "pierson", 6, 8),
       ("johnny", "miller", 7, NULL),
       ("maximus", "milan", 8, NULL);

SET FOREIGN_KEY_CHECKS = 1;