import { faker } from '@faker-js/faker';

/**
 * Test data utility powered by @faker-js/faker.
 * Generates dynamic, realistic, and collision-resistant test data sets
 * to guarantee test independence on shared and public instances.
 */

export interface EmployeeTestData {
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string;
  fullName: string;
  licenseNumber: string;
  nationality: string;
}

export interface UserTestData {
  username: string;
  password: string;
  role: 'Admin' | 'ESS';
  status: 'Enabled' | 'Disabled';
}

/**
 * Generates realistic employee test data with unique identifiers.
 */
export function generateEmployeeData(prefix = 'QA'): EmployeeTestData {
  const firstName = `${prefix}_${faker.person.firstName().replace(/[^a-zA-Z]/g, '')}`;
  const middleName = faker.person.middleName().replace(/[^a-zA-Z]/g, '') || 'Lee';
  const lastName = faker.person.lastName().replace(/[^a-zA-Z]/g, '');
  const employeeId = `E${faker.number.int({ min: 10000, max: 99999 })}`;
  const licenseNumber = `DL-${faker.string.alphanumeric(8).toUpperCase()}`;
  const nationality = faker.location.country();

  return {
    firstName,
    middleName,
    lastName,
    employeeId,
    fullName: `${firstName} ${middleName} ${lastName}`.trim(),
    licenseNumber,
    nationality,
  };
}

/**
 * Generates unique system user credentials meeting OrangeHRM complexity requirements:
 * - Username: 5-40 characters, alphanumeric with unique suffix
 * - Password: At least 8 characters with lowercase, uppercase, digit, and symbol
 */
export function generateUserData(role: 'Admin' | 'ESS' = 'Admin'): UserTestData {
  const baseName = faker.person.firstName().toLowerCase().replace(/[^a-z0-9]/g, '');
  const suffix = faker.number.int({ min: 1000, max: 9999 });
  const username = `usr_${baseName}_${suffix}`;
  const password = `P@ss${faker.string.alphanumeric({ length: 6, casing: 'mixed' })}${faker.string.numeric(1)}!`;


  return {
    username,
    password,
    role,
    status: 'Enabled',
  };
}
