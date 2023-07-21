import { transferFunds, getUserAccounts, createNewAccount } from "../../src/js/api";

describe('transfer', () => {
    beforeEach(() => {
        cy.visit("http://localhost:8080");
        cy.get('button[id="signIn"]').click();
        cy.wait(1000);
    });
    it('get accounts', () => {
        // Выполняем функцию getUserAccounts
        cy.window().then((win) => {
            return getUserAccounts();
        }).as('accountsResponse');

        // Проверяем ответ на наличие списка счетов и транзакций
        cy.get('@accountsResponse').then((response) => {
            expect(response.payload).to.be.an('array');
            expect(response.payload.length).to.be.greaterThan(0);
        });
    });

    it('Sends transfer request and checks response', () => {
        // cy.get('.account-card').eq(0).find('button').click();
        // cy.get('.input-to').type('5555341244441115');
        // cy.get('.summa').type('100');

        // Подготовка мок-сервера или перехватчика HTTP-запросов
        cy.intercept('POST', 'http://localhost:3000/transfer-funds', (req) => {
            // Эмуляция успешного ответа сервера
            req.reply({
                status: 200,
                body: { success: true },
            });
        }).as('transferRequest');

        // Вызов функции transferFunds
        cy.window().then((win) => {
            const transfer = {
                from: '74213041477477406320783754',
                to: '5555341244441115',
                amount: 100,
            };
            return transferFunds(transfer);
        }).as('transferResponse');

        // Проверка успешного ответа
        cy.get('@transferResponse').should('deep.equal', { success: true });
    });
    it('create new account', () => {
        // Выполняем функцию createNewAccount
        cy.window().then((win) => {
            return createNewAccount();
        }).as('createNewAccountResponse');

        let newAccount;

        // Проверяем ответ 
        cy.get('@createNewAccountResponse').then((response) => {
            expect(response.payload).to.be.an('object');

            newAccount = response.payload;

            expect(newAccount).to.have.property('balance', 0);
            expect(newAccount.transactions).to.have.lengthOf(0);
        });

        // Вызов функции transferFunds
        cy.window().then((win) => {
            const transfer = {
                from: '74213041477477406320783754',
                to: newAccount.account,
                amount: 100,
            };
            return transferFunds(transfer);
        }).as('transferResponse');


        cy.get('@transferResponse').then((response) => {
            cy.log(response);
            expect(response.payload).to.be.an('object');
            expect(response.payload.transactions.length).to.be.greaterThan(0);
        });
    })

})