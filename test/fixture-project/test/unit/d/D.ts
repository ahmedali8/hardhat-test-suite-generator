import { shouldBehaveLikeDContract } from "./D.behavior";
import { dFixture } from "./D.fixture";

export function testD(): void {
  describe("D", function () {
    beforeEach(async function () {
      const { d } = await this.loadFixture(dFixture);
      this.contracts.d = d;
    });

    shouldBehaveLikeDContract();
  });
}
