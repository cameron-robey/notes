const section = window.location.pathname.split('/')[1];

const toggleView = (id) => {
    console.log(id);
    let el = document.getElementById(id);
    console.log(el.classList);
    if (el.classList.contains('nav-small')) el.classList.remove('nav-small');
    else el.classList.add('nav-small');
}

window.onload = () => {
    toggleView(section)
}