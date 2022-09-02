describe("Calendar", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  describe("Date Grid", () => {
    it("Identifies the table element as a grid widget.", () => {
      cy.get("table[role=grid]");
    });
  });

  it("Identifies the element that provides the accessible name for the grid.");
});
