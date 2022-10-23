import { shouldBehaveLikeBContract } from "./B.behavior";
import { bFixture } from "./B.fixture";

export function testB(): void {
  describe("B", function () {
    beforeEach(async function () {
      const { b } = await this.loadFixture(bFixture);
      this.contracts.b = b;
    });

    shouldBehaveLikeBContract();
  });
}
