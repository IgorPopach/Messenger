let scrolled = false;
(function updateScroll() {
    if (!scrolled) {
        var element = document.getElementById("chat");
        element.scrollTop = element.scrollHeight;
    }
})();

$("#chat").on('scroll', function () {
    scrolled = true;
});