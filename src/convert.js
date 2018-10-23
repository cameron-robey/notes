const fs = require('fs');
const showdown = require('showdown');
const converter = new showdown.Converter({tables: true});
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const chalk = require('chalk');


const mdtohtml = (src) => {
    let page = fs.readFileSync(src, 'utf-8');
    return converter.makeHtml(page);
}

const processImage =  async (name) => {
    const inputPath = 'data/img/' + name;
    const outputPath = 'build/img';

    const files = await imagemin([inputPath], outputPath, {
        plugins: [
            imageminJpegtran(),
            imageminPngquant({quality: '65-80'})
        ]
    });

    console.log(chalk.bold.magenta('Succesfully processed image: ') + files[0].path);
    return files[0].path;
}


module.exports = {
    mdtohtml,
    processImage
}