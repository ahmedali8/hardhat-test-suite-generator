import shouldBehaveLikeC from "./view/c";

export function shouldBehaveLikeCContract(): void {
  describe("View Functions", function () {
    describe("#c", function () {
      shouldBehaveLikeC();
    });
  });
}
