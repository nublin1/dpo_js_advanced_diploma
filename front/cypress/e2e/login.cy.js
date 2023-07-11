describe('template spec', () => {
  beforeEach(() => {
    cy.visit("http://localhost:8080");
    
  });
  it('login', () => {
    cy.get('button[id="signIn"]').click();
    cy.url().should('include', '#accounts') // Проверка хэша адресной строки
  })
})