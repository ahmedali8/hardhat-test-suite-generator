import { shouldBehaveLikeCContract } from "./C.behavior";
import { cFixture } from "./C.fixture";

export function testC(): void {
  describe("C", function () {
    beforeEach(async function () {
      const { c } = await this.loadFixture(cFixture);
      this.contracts.c = c;
    });

    shouldBehaveLikeCContract();
  });
}
