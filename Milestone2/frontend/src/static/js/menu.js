 /*
  * Open the drawer when the menu ison is clicked.
  */
let menuToggle = document.querySelector('#menuToggle');
let mobileMenuBtn = document.querySelector('#mobile-menu-btn');
let drawer = document.querySelector('#drawer');

// function to toggle drawer open/close
function toggleDrawer(e) {
  drawer.classList.toggle('open');
  e.stopPropagation();
}

// desktop menu toggle
menuToggle?.addEventListener('click', toggleDrawer);

// mobile menu toggle
mobileMenuBtn?.addEventListener('click', toggleDrawer);

// close drawer when clicking outside of it
document.addEventListener('click', function(e){
  if (!drawer.contains(e.target) && !menuToggle.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
    drawer.classList.remove('open');
  }
});