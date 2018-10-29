const fs = require('fs');
const handlebars = require('handlebars');

const viewsFolder = './lib/views';

const constructPage = (content, navContent, title) => {
    const headSrc = fs.readFileSync(viewsFolder + '/head.hbs', 'utf-8');
    const head = handlebars.compile(headSrc);
    const navbarSrc = fs.readFileSync(viewsFolder + '/navbar.hbs', 'utf-8');
    const navbar = handlebars.compile(navbarSrc);
    const footerSrc = fs.readFileSync(viewsFolder + '/footer.hbs', 'utf-8');
    const footer = handlebars.registerPartial('footer', footerSrc);

    let rtn = '<!doctype html><html>';
    rtn += head({title: title});
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