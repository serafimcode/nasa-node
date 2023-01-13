
describe('Dummy test suit', () => {
    function sum(a, b) {
        return a + b;
    }
    test('dummy test', () => {
        expect(sum(1, 2)).toBe(3);
    })
})