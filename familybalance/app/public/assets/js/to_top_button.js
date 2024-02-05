// Button element
const toTopButton = document.getElementById("to_top_button");

// When scrolling, check if we scrolled down 20px; if yes, show button
window.onscroll = () => {
    if (document.documentElement.scrollTop > 20) {
        toTopButton.style.display = "";
    } else {
        toTopButton.style.display = "none";
    }
};

// On click, go back to the top of the document
toTopButton.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo(0, 0);
});
