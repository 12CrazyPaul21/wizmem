/**
 * wizmem web manager logical module
 */

const wizmem = (function() {

    function say_hello() {
        return 'hello, wizmem';
    }

    return {
        env: {
            total_memory_size: 0,
        },
        init: function() {
            console.log(say_hello());
        }
    }
})();