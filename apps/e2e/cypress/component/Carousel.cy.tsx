import { Carousel } from "carousel";

describe("Carousel.cy.ts", () => {
  it("mount", () => {
    cy.mount(
      <Carousel aria-label="Highlighted television shows" interval={10_000}>
        <Carousel.Button action="toggle">
          {(auto_rotation) =>
            auto_rotation ? "pause auto-rotation" : "start auto-rotation"
          }
        </Carousel.Button>
        <Carousel.Button action="next">next slide</Carousel.Button>
        <Carousel.Button action="prev">previous slide</Carousel.Button>
        <Carousel.Items>
          <Carousel.Item>
            Dynamic Europe: Amsterdam, Prague, Berlin
          </Carousel.Item>
          <Carousel.Item>Travel to Southwest England and Paris</Carousel.Item>
          <Carousel.Item>
            Great Children's Programming on Public TV
          </Carousel.Item>
          <Carousel.Item>Foyle’s War Revisited</Carousel.Item>
          <Carousel.Item>Great Britain Vote: 7 pm Sat.</Carousel.Item>
          <Carousel.Item>
            Mid-American Gardener: Thursdays at 7 pm
          </Carousel.Item>
        </Carousel.Items>
      </Carousel>
    );
  });
});
