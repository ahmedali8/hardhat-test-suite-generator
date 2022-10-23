import { shouldBehaveLikeAContract } from "./A.behavior";
import { aFixture } from "./A.fixture";

export function testA(): void {
  describe("A", function () {
    beforeEach(async function () {
      const { a } = await this.loadFixture(aFixture);
      this.contracts.a = a;
    });

    shouldBehaveLikeAContract();
  });
}
