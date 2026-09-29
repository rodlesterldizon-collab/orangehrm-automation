/**
 * Test data utility generating dynamic, collision-resistant data sets.
 * Guarantees test independence on shared public instances.
 */

export interface EmployeeTestData {
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string;
  fullName: string;
}

export interface UserTestData {
  username: string;
  password: string;
  role: 'Admin' | 'ESS';
  status: 'Enabled' | 'Disabled';
}

/**
 * Generates unique employee test data with timestamps.
 */
export function generateEmployeeData(prefix = 'QA'): EmployeeTestData {
  const timestamp = Date.now().toString().slice(-6);
  const random4 = Math.floor(1000 + Math.random() * 9000);
  const firstName = `${prefix}Auto`;
  const middleName = 'Test';
  const lastName = `Emp_${timestamp}`;
  const employeeId = `E${random4}`;

  return {
    firstName,
    middleName,
    lastName,
    employeeId,
    fullName: `${firstName} ${middleName} ${lastName}`.trim(),
  };
}

/**
 * Generates unique system user credentials with password meeting OrangeHRM policies.
 */
export function generateUserData(role: 'Admin' | 'ESS' = 'Admin'): UserTestData {
  const timestamp = Date.now().toString().slice(-5);
  return {
    username: `usr_${timestamp}`,
    password: `P@ssw0rd!${timestamp}`,
    role,
    status: 'Enabled',
  };
}
