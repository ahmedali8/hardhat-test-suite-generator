import shouldBehaveLikeD from "./view/d";

export function shouldBehaveLikeDContract(): void {
  describe("View Functions", function () {
    describe("#d", function () {
      shouldBehaveLikeD();
    });
  });
}
