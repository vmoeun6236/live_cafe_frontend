import { test, expect } from '@playwright/test';

// Helper to login as admin
async function login(page) {
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', '12341234');
  await page.click('button:has-text("Sign in")');
  await expect(page).toURL(/dashboard/);
}

// Helper to create a table on Floor 2
async function createTableOnFloor2(page) {
  await page.goto('http://localhost:3000/dashboard/tables');
  await page.click('button:has-text("Add Table")');
  await page.fill('#number', 'T-202');
  await page.fill('#capacity', '4');
  await page.selectOption('#floor', '2'); // assumes <select id="floor">
  await page.click('button:has-text("Create Table")');
  // Verify that the table appears in the Floor 2 tab
  await page.click('button:has-text("Second Floor (Floor 2)")');
  await expect(page.locator('text=Table T-202')).toBeVisible();
}

// Helper to place a mixed order (drink + food) via public client
async function placeMixedOrder(page) {
  await page.goto('http://localhost:3000/table/1');
  // Add a drink – locate by product name containing "ice late" or a Khmer variant
  await page.click('text=ice late');
  // Add a food – e.g., Croissant
  await page.click('text=Croissant');
  // Open cart drawer
  await page.click('button:has-text("View Order Cart")');
  // Submit order
  await page.click('button:has-text("Submit Order to Kitchen")');
  // Wait for receipt / tracking screen
  await expect(page.locator('text=Order #')).toBeVisible();
}

// Helper to verify KDS behavior (drink excluded, food present)
async function verifyKDS(page) {
  await page.goto('http://localhost:3000/dashboard/kitchen');
  // Ensure a ticket appears (food item present)
  const ticket = page.locator('text=Ticket #');
  await expect(ticket).toBeVisible();
  // Drink should NOT be listed in the checklist
  await expect(ticket.locator('text=ice late')).toHaveCount(0);
  // The cash‑bar footnote should be present
  await expect(ticket.locator('text=Drink')).toBeVisible();
  // Interact with food checklist
  const foodItem = ticket.locator('li:has-text("Croissant")');
  await foodItem.click(); // toggle check
  // Start cooking & mark ready
  await ticket.locator('button:has-text("Start Cooking")').click();
  await ticket.locator('button:has-text("Mark Ready")').click();
  // Ticket should disappear from active view
  await expect(ticket).toHaveCount(0);
}

test('Full end‑to‑end system walk‑through', async ({ page }) => {
  await login(page);
  await createTableOnFloor2(page);
  await placeMixedOrder(page);
  await verifyKDS(page);
});
