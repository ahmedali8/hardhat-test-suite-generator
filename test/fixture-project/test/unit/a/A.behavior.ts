import shouldBehaveLikeA from "./view/a";
import shouldBehaveLikeB from "./view/b";
import shouldBehaveLikeC from "./view/c";

export function shouldBehaveLikeAContract(): void {
  describe("View Functions", function () {
    describe("#a", function () {
      shouldBehaveLikeA();
    });
    describe("#b", function () {
      shouldBehaveLikeB();
    });
    describe("#c", function () {
      shouldBehaveLikeC();
    });
  });
}
