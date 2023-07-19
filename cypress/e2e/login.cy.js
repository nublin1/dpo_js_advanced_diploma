describe('template spec', () => {
  beforeEach(() => {
    cy.visit("http://localhost:8080");
    
  });
  it('login', () => {
    cy.get('button[id="signIn"]').click();
    cy.get('h1').should('contain', 'Ваши счета');
    cy.url().should('include', '#accounts') // Проверка хэша адресной строки
  })
})