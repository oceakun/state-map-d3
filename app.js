const menuBar = document.getElementById("menuBar");
const navbarWrapper = document.getElementById("navbarWrapper");

window.addEventListener("resize", () => {
  const windowWidth = window.innerWidth;

  if (windowWidth > 692) {
    navbarWrapper.style.visibility = "visible";
  }
});

menuBar.addEventListener("click", () => {
  if (navbarWrapper.style.visibility == "hidden") {
    navbarWrapper.style.visibility = "visible";
    console.log("set to visible");
  } else {
    navbarWrapper.style.visibility = "hidden";
    console.log("set to hidden");
  }
});

if (window.innerWidth > "692px")
{
  navbarWrapper.addEventListener("click", () => {
    if (navbarWrapper.style.visibility == "visible") {
      navbarWrapper.style.visibility = "hidden";
      console.log("navbarWrapper - set to hidden");
    } 
  })
}