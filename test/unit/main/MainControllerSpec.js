/// <reference path="../../../typings/tsd.d.ts"/>
/// <reference path="../../../app/main/my.service.ts"/>
describe('MyService', function () {
    beforeEach(module('app'));
    it('サービスを呼んでみる', inject(function (myService) {
        expect(myService.add(1, 2)).toEqual(3);
    }));
});
//# sourceMappingURL=MainControllerSpec.js.map