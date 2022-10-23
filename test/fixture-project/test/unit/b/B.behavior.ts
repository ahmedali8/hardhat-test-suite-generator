import shouldBehaveLikeB from "./view/b";
import shouldBehaveLikeC from "./view/c";

export function shouldBehaveLikeBContract(): void {
  describe("View Functions", function () {
    describe("#b", function () {
      shouldBehaveLikeB();
    });
    describe("#c", function () {
      shouldBehaveLikeC();
    });
  });
}
