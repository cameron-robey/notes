// Imports
const fs = require('fs');
const rimraf = require('rimraf');
const chalk = require('chalk');
const compressor = require('node-minify');
const sass = require('node-sass');

// Modules
const convert = require('./convert');
const create = require('./create');

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
        const topicPath = topic.split('~')[1].replace(/\s/g, '-').toLowerCase(); // <- regex removes number and replaces spaces with dash
        let topicRtn = { title: topic.replace(/~/g, ': ').replace(/^0/, ''), href: topic.split('~')[1].replace(/\s/g, '-').toLowerCase(), pages: [] }; // <- regex replaces ~ with colon and removes leading 0

        // Loop through directories
        const dir = fs.readdirSync(contentFolder + '/' + topic);
        dir.map((item) => {
            if (fs.lstatSync(contentFolder+'/'+topic+'/'+item).isDirectory()) {
                // Subdirectory present
                const itemPath = item.split('~')[1].replace(/\s/g, '-').toLowerCase();
                const subDir = fs.readdirSync(contentFolder+'/'+topic+'/'+item);
                let itemRtn = [];
                subDir.map((file) => {
                    itemRtn.push({
                            title: file.substring(0,file.length-3).replace(/~/g, ': ').replace(/^0/, ''),
                            url: '/' + topicPath + '/' + itemPath + '/' + file.replace('.md', '').split('~')[1].replace(/\s/g, '-').toLowerCase()
                    });
                    navCount++;
                });
                topicRtn.pages.push({ title: item.replace(/~/g, ': ').replace(/^0/, ''),data: itemRtn });
            } else {
                topicRtn.pages.push({
                    title: item.substring(0,item.length-3).replace(/~/g, ': ').replace(/^0/, ''),
                    url: '/' + topicPath + '/' + item.replace('.md', '').split('~')[1].toLowerCase().replace(/\s/g, '-')
                });
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
    const imgProcess = images.map( async (image) => {
        let success = convert.processImage(image);
        return success;
    });
    await Promise.all(imgProcess);
    console.log(chalk.yellow('Message: ') + 'Processing Images Done' + '\n');

    // Create pages
    console.log(chalk.magenta('Section started: ') + 'Creating pages');
    topics.map((topic) => {
        const topicPath = topic.split('~')[1].replace(/\s/g, '-').toLowerCase(); // <- Regex removes number and replaces spaces
        fs.mkdirSync('build/' + topicPath);
        const dir = fs.readdirSync(contentFolder+'/' + topic);

        dir.map((item) => {
            if (fs.lstatSync(contentFolder+'/'+topic+'/'+item).isDirectory()) {
                // There is a subdirectory - create directory page
                const itemPath = item.split('~')[1].replace(/\s/g, '-').toLowerCase();
                fs.mkdirSync('build/' + topicPath + '/' + itemPath);

                // Get subpages
                const subDir = fs.readdirSync(contentFolder+'/'+topic+'/'+item);
                subDir.map((file) => {
                    // There is a file - create page
                    const data = convert.mdtohtml(contentFolder+'/'+topic+'/'+item+'/'+file);
                    const page = create.constructPage(data, nav, file.replace('.md', '').split('~')[1]);
                    const path = 'build/' + topicPath + '/' + itemPath + '/' + file.replace('.md', '').split('~')[1].replace(/\s/g, '-').toLowerCase() + '.html';
                    fs.writeFileSync(path, page);
                    console.log(chalk.green('Creating page: ') + file.replace('.md', '').split('~')[1]);
                });
            } else {
                // There is a file - create page
                const data = convert.mdtohtml(contentFolder+'/'+topic+'/'+item);
                const page = create.constructPage(data, nav, item.replace('.md', '').split('~')[1])
                const path = 'build/' + topicPath + '/' + item.replace('.md', '').split('~')[1].toLowerCase().replace(/\s/g, '-') + '.html';
                fs.writeFileSync(path, page);
                console.log(chalk.green('Creating page: ') + item.replace('.md', '').split('~')[1]);
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
    console.log(chalk.blue('Images: ') + imgProcess.length);
    console.log(chalk.blue('Javascript files: ') + js.length)
    console.log(chalk.blue('CSS files: ') + css.stats.includedFiles.length + '\n');
}

process();