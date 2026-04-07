const { test, expect } = require('@playwright/test');
const { FinePage } = require('../pages/FinePage');

test.describe('Library Fine UI Tests', () => {
    let finePage;

    test.beforeEach(async ({ page }) => {
        finePage = new FinePage(page);
        await finePage.navigate();
    });

    test('Расчет для книги с просрочкой в 5 дней (ID 101)', async () => {
        await finePage.calculate('101');
        await expect(finePage.resultArea).toBeVisible();
        await expect(finePage.fineValue).toHaveText('10.00'); 
    });

    const dayCases = [
        { id: '102', expected: '0.00', desc: '0 дней' },
        { id: '104', expected: '2.00', desc: '1 день' },
        { id: '103', expected: '20.00', desc: '10 дней' }
    ];

    for (const c of dayCases) {
        test(`Data-Driven позитивный: ${c.desc}`, async () => {
            await finePage.calculate(c.id);
            await expect(finePage.resultArea).toBeVisible();
            await expect(finePage.fineValue).toHaveText(c.expected);
        });
    }

    test('Проверка корректности вычисления даты выдачи', async () => {
        await finePage.calculate('101');
        await expect(finePage.resultArea).toBeVisible();

        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - 5);
        const expectedStr = expectedDate.toLocaleDateString('ru-RU');

        await expect(finePage.page.locator('#issuedDate')).toHaveText(expectedStr);
    });

    const errorCases = [
        { input: '909', msg: 'Книга с таким ID не найдена', desc: 'несуществующий ID' },
        { input: '-5', msg: 'ID не может быть отрицательным', desc: 'отрицательный ID' }
        ];

    for (const ec of errorCases) {
        test(`Негативный сценарий: ${ec.desc}`, async () => {
            await finePage.calculate(ec.input);
            await expect(finePage.resultArea).toBeHidden();
            await expect(finePage.page.locator('#error')).toBeVisible();
            await expect(finePage.page.locator('#error')).toContainText(ec.msg);
        });
    }
});