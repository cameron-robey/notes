const fs = require('fs');
const handlebars = require('handlebars');

const constructPage = (content, navContent) => {
    const headSrc = fs.readFileSync('views/head.hbs', 'utf-8');
    const head = handlebars.compile(headSrc);
    const navbarSrc = fs.readFileSync('views/navbar.hbs', 'utf-8');
    const navbar = handlebars.compile(navbarSrc);
    const footerSrc = fs.readFileSync('views/footer.hbs', 'utf-8');
    const footer = handlebars.registerPartial('footer', footerSrc);


    let rtn = '<!doctype html><html>';
    rtn += head();
    rtn += '<body><div class="main">';
    rtn += navbar(navContent);
    rtn += '<div class="content">';
    rtn += content;
    rtn += '</div></div>';
    rtn += '</body></html>';

    return rtn;
}

module.exports = {
    constructPage
}