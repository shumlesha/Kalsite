document.addEventListener('DOMContentLoaded', function() {
    var menuIcon = document.querySelector('.menu-icon');
    var menuPanel = document.querySelector('.menu-panel');

    if (menuIcon && menuPanel) {
        menuIcon.addEventListener('click', function() {
            menuPanel.classList.toggle('open');
        });

        document.addEventListener('mousemove', function(e) {
            if (e.clientX < 300) {
                menuIcon.classList.add('visible');
            } else {
                menuIcon.classList.remove('visible');
            }
        });

        document.addEventListener('click', function(event) {
            var clickedElement = event.target;
            var isClickInsideMenu = menuPanel.contains(event.target) || menuIcon.contains(event.target);

            if (!isClickInsideMenu && menuPanel.classList.contains('open')) {
                menuPanel.classList.remove('open');
            }
        });
    }
});
