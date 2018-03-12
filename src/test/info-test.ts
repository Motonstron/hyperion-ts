import { assert } from "chai";
import * as Config from "config";
import { InjectedResponseObject } from "hapi";
import { suite, test } from "mocha-typescript";
import * as sinon from "sinon";
import { HyperionServer } from "../main/hyperion-server";

@suite("Hyperion")
export class HyperionTest {

  private hyperion: HyperionServer;

  public before(): void {
    this.hyperion = new HyperionServer();
  }

  @test("endpoint | GET /hyperion-info | 200 ")
  public should_return_success(): void {
    const request = {
      method: "GET",
      url: Config.get("hyperion.routes.info") as string
    };

    const messageStub = sinon.stub(this.hyperion.core, "getServerInfo" as any);
    messageStub.resolves({ success: true });

    this.hyperion.hapi.inject(request).then((response: InjectedResponseObject) => {
      assert.equal(response.statusCode, 200);
    });
  }

  @test("endpoint | GET /hyperion-on | 404")
  public should_return_error_on_invalid_route(): void {
    const request = {
      method: "GET",
      url: "/info"
    };

    this.hyperion.hapi.inject(request).then((response: InjectedResponseObject) => {
      assert.equal(response.statusCode, 404);
    });
  }

}
