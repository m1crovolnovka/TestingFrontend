class FinePage {
    constructor(page) {
        this.page = page;
        this.idInput = page.locator('#bookId');
        this.submitBtn = page.locator('#calculateBtn');
        this.resultArea = page.locator('#result');
        this.fineValue = page.locator('#fineAmount');
        this.errorMsg = page.locator('#error');
    }

    async navigate() {
        await this.page.goto('/');
    }

    async calculate(id) {
        await this.idInput.fill(id.toString());
        await this.submitBtn.click();
    }
}
module.exports = { FinePage };