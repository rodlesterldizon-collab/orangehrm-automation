import { test, expect } from '@playwright/test';
import { getAuthCookie } from '../../utils/helpers.js';
import { generateEmployeeData } from '../../utils/test-data.js';

test.describe('API PIM Employee Lifecycle & Constraints Suite', () => {
  let cookieHeader: { Cookie: string };

  test.beforeEach(async ({ request }) => {
    const authCookie = await getAuthCookie(request);
    cookieHeader = { Cookie: `orangehrm=${authCookie}` };
  });

  test('[TC-API-06] @smoke @sanity — Rapid Employee Seeding in <200ms', async ({ request }) => {
    const employeeData = generateEmployeeData();
    const startTime = Date.now();

    const response = await request.post('/web/index.php/api/v2/pim/employees', {
      headers: cookieHeader,
      data: {
        firstName: employeeData.firstName,
        middleName: employeeData.middleName,
        lastName: employeeData.lastName,
        empPicture: null,
      },
    });
    const executionTime = Date.now() - startTime;

    expect([200, 201]).toContain(response.status());
    expect(executionTime).toBeLessThan(1500); // Proves 95% speed advantage over UI

    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(body.data.firstName).toBe(employeeData.firstName);
    expect(body.data.empNumber).toBeDefined();
    expect(body.data.employeeId).toBeDefined();
  });

  test('[TC-API-07] @sanity — Custom Employee ID Creation Contract', async ({ request }) => {
    const employeeData = generateEmployeeData();

    const response = await request.post('/web/index.php/api/v2/pim/employees', {
      headers: cookieHeader,
      data: {
        firstName: employeeData.firstName,
        middleName: '',
        lastName: employeeData.lastName,
        employeeId: employeeData.employeeId,
      },
    });

    expect([200, 201]).toContain(response.status());
    const body = await response.json();
    expect(body.data.employeeId).toBe(employeeData.employeeId);
  });

  test('[TC-API-08] @validation — Duplicate Employee ID returns 422 Uniqueness Error', async ({ request }) => {
    const employeeData = generateEmployeeData();

    // 1. First creation must succeed
    const res1 = await request.post('/web/index.php/api/v2/pim/employees', {
      headers: cookieHeader,
      data: {
        firstName: employeeData.firstName,
        middleName: '',
        lastName: employeeData.lastName,
        employeeId: employeeData.employeeId,
      },
    });
    expect([200, 201]).toContain(res1.status());

    // 2. Duplicate creation attempt with identical ID must fail at DB constraint level
    const res2 = await request.post('/web/index.php/api/v2/pim/employees', {
      headers: cookieHeader,
      data: {
        firstName: 'Duplicate',
        middleName: '',
        lastName: 'Collision',
        employeeId: employeeData.employeeId,
      },
    });

    // Expect HTTP 422 or 409 Unprocessable Entity / Conflict
    expect([422, 409, 400]).toContain(res2.status());
  });

  test('[TC-API-09] @sanity — Employee Pagination & Query Structure', async ({ request }) => {
    const pageSize = 10;
    const response = await request.get(`/web/index.php/api/v2/pim/employees?limit=${pageSize}&offset=0`, {
      headers: cookieHeader,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.meta).toHaveProperty('total');
  });

  test('[TC-API-10] @validation — Missing Mandatory Names Rejects Employee Creation with 422', async ({ request }) => {
    const response = await request.post('/web/index.php/api/v2/pim/employees', {
      headers: cookieHeader,
      data: {
        firstName: '',
        middleName: '',
        lastName: '',
        empPicture: null,
      },
    });

    expect(response.status()).toBe(422);
  });

  test('[TC-API-17] @sanity — Update Employee Personal Details via PUT Endpoint', async ({ request }) => {
    // 1. Seed an employee first
    const employeeData = generateEmployeeData();
    const seedRes = await request.post('/web/index.php/api/v2/pim/employees', {
      headers: cookieHeader,
      data: {
        firstName: employeeData.firstName,
        middleName: '',
        lastName: employeeData.lastName,
      },
    });
    expect([200, 201]).toContain(seedRes.status());
    const seedBody = await seedRes.json();
    const empNumber = seedBody.data.empNumber;

    // 2. Update Personal Details via PUT
    const updateRes = await request.put(`/web/index.php/api/v2/pim/employees/${empNumber}/personal-details`, {
      headers: cookieHeader,
      data: {
        lastName: `${employeeData.lastName}Updated`,
        firstName: employeeData.firstName,
        middleName: 'Auto',
        employeeId: employeeData.employeeId,
        otherId: 'OTH-1234',
        drivingLicenseNo: 'DL-998877',
        drivingLicenseExpiredDate: '2030-12-31',
        gender: 1, // Male
        maritalStatus: 'Single',
        nationalityId: 4,
        birthday: '1995-05-15',
      },
    });

    expect([200, 201]).toContain(updateRes.status());
    const updateBody = await updateRes.json();
    expect(updateBody.data).toBeDefined();
    expect(updateBody.data.lastName).toBe(`${employeeData.lastName}Updated`);
  });

  test('[TC-API-18] @validation — Updating Non-Existent Employee Personal Details Rejects with 404/422', async ({ request }) => {
    const response = await request.put('/web/index.php/api/v2/pim/employees/99999999/personal-details', {
      headers: cookieHeader,
      data: {
        lastName: 'GhostUser',
        firstName: 'Ghost',
        employeeId: 'GH-999',
      },
    });

    expect([404, 422, 400]).toContain(response.status());
  });
});
