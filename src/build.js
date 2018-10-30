// Imports
const fs = require('fs');
const rimraf = require('rimraf');
const chalk = require('chalk');
const compressor = require('node-minify');
const sass = require('node-sass');

// Modules
const convert = require('./convert');
const create = require('./create');
const clean = require('./clean');

// Directories
const contentFolder = './data/content';
const imgFolder = './data/img';
const jsFolder = './lib/js';

console.log(chalk.magenta.bold('Starting Build Script') + '\n');

// Wipe current build folder 
rimraf.sync('build');
fs.mkdirSync('build');
console.log(chalk.yellow('Message: ') + 'Removed Previous Build' + '\n');

// Get data from directories
const topics = fs.readdirSync(contentFolder);

const process = async () => {
    // Generate navbar template:
    console.log(chalk.magenta('Section started: ') + 'Assembling Navbar');
    let navCount = 0;
    let nav = topics.map((topic) => {
        const topicPath = clean.path(topic);
        let topicRtn = { title: clean.title(topic), href: topicPath, pages: [] };

        // Loop through directories
        const dir = fs.readdirSync(contentFolder + '/' + topic);
        dir.map((item) => {
            if (fs.lstatSync(contentFolder+'/'+topic+'/'+item).isDirectory()) {
                // Subdirectory present
                const itemPath = clean.path(item);
                const subDir = fs.readdirSync(contentFolder+'/'+topic+'/'+item);
                let itemRtn = [];
                subDir.map((file) => itemRtn.push({ title: clean.title(file), url: '/' + topicPath + '/' + itemPath + '/' + clean.path(file) }) );
                topicRtn.pages.push({ title: clean.title(item), data: itemRtn });
                navCount += itemRtn.length;
            } else {
                topicRtn.pages.push({ title: clean.title(item), url: '/' + topicPath + '/' + clean.path(item) });
                navCount++;
            }
        });
        return topicRtn;
    });
    nav = {topics: nav};
    console.log(chalk.yellow('Message: ') + 'Assembling Navbar Done' + '\n');
    
    // Process images
    console.log(chalk.magenta('Section started: ') + 'Processing Images');
    const images = fs.readdirSync(imgFolder);
    await Promise.all(images.map( async (image) => convert.processImage(image)));
    console.log(chalk.yellow('Message: ') + 'Processing Images Done' + '\n');

    // Create pages
    console.log(chalk.magenta('Section started: ') + 'Creating pages');
    topics.map((topic) => {
        const dir = fs.readdirSync(contentFolder+'/' + topic);
        const topicPath = clean.path(topic);
        fs.mkdirSync('build/' + topicPath);

        dir.map((item) => {
            if (fs.lstatSync(contentFolder+'/'+topic+'/'+item).isDirectory()) {
                // There is a subdirectory - create directory page
                const itemPath = clean.path(item)
                fs.mkdirSync('build/' + topicPath + '/' + itemPath);

                // Get subpages
                const subDir = fs.readdirSync(contentFolder+'/'+topic+'/'+item);
                subDir.map((file) => {
                    // There is a file - create page
                    const data = convert.mdtohtml(contentFolder+'/'+topic+'/'+item+'/'+file);
                    const page = create.constructPage(data, nav, clean.pageTitle(file));
                    const path = 'build/' + topicPath + '/' + itemPath + '/' + clean.path(file) + '.html';
                    fs.writeFileSync(path, page);
                    console.log(chalk.green('Creating page: ') + clean.pageTitle(file));
                });
            } else {
                // There is a file - create page
                const data = convert.mdtohtml(contentFolder+'/'+topic+'/'+item);
                const page = create.constructPage(data, nav, clean.pageTitle(item));
                const path = 'build/' + topicPath + '/' + clean.path(item) + '.html';
                fs.writeFileSync(path, page);
                console.log(chalk.green('Creating page: ') + clean.pageTitle(item));
            }
        });
    });
    console.log(chalk.yellow('Message: ') + 'Creating pages done' + '\n');    

    // Minify javascript
    console.log(chalk.magenta('Section Started: ') + 'Processing Javascipt');
    // Get javascript files from directories
    const js = fs.readdirSync(jsFolder);
    js.map((file) => {
        console.log(chalk.green('Javascript file: ') + file);
    });
    await compressor.minify({
        compressor: 'gcc',
        input: jsFolder + '/*.js',
        output: './build/resource/script.js'
    });
    console.log(chalk.yellow('Message: ') + 'Processing Javascipt done' + '\n');

    // Process CSS
    console.log(chalk.magenta('Section started: ') + 'Processing CSS');
    const css = sass.renderSync({
        file: 'lib/scss/main.scss',
        outputStyle: 'compressed'
    });
    fs.writeFileSync('build/resource/style.css', css.css);
    console.log(chalk.yellow('Message: ') + 'Processing CSS done');
    
    console.log('\n\n' + chalk.bold.red('Data is all parsed') + '\n');
    console.log(chalk.blue('Pages: ') + navCount);
    console.log(chalk.blue('Images: ') + images.length);
    console.log(chalk.blue('Javascript files: ') + js.length)
    console.log(chalk.blue('CSS files: ') + css.stats.includedFiles.length + '\n');
}

process();