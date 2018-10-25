// Imports
const fs = require('fs');
const rimraf = require('rimraf');
const chalk = require('chalk');
const compressor = require('node-minify');

// Modules
const convert = require('./convert');
const create = require('./create');

// Directories
const contentFolder = './data/content';
const imgFolder = './data/img';
const jsFolder = './lib/js';

console.log(chalk.yellow('Message: ') + 'Starting Build Script');

// Wipe current build folder 
rimraf.sync('build');
fs.mkdirSync('build');
console.log(chalk.yellow('Message: ') + 'Removed Build Folder');

// Get data from directories
const topics = fs.readdirSync(contentFolder);

const process = async () => {

    // Generate navbar template:
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
                });
                topicRtn.pages.push({ title: item.replace(/~/g, ': ').replace(/^0/, ''),data: itemRtn });
            } else {
                topicRtn.pages.push({
                    title: item.substring(0,item.length-3).replace(/~/g, ': ').replace(/^0/, ''),
                    url: '/' + topicPath + '/' + item.replace('.md', '').split('~')[1].toLowerCase().replace(/\s/g, '-')
                });
            }
        });
        return topicRtn;
    });
    nav = {topics: nav};
    console.log(chalk.yellow('Message: ') + 'Assembled Navbar');
    

    // Process images
    const images = fs.readdirSync(imgFolder);
    const imgProcess = images.map( async (image) => {
        console.log(chalk.bold.magenta('Starting to process image: ') + image)
        let success = convert.processImage(image);
        return success;
    });
    await Promise.all(imgProcess);
    console.log(chalk.yellow('Message: ') + 'Processed Images');
    
    // Create pages
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
    console.log(chalk.yellow('Message: ') + 'Created all pages' + '\n\n' + chalk.bold.red('Data is all parsed' + '\n'));

    // Minify javascript
    console.log(chalk.yellow('Message: ') + 'Minifying javascipt');

    // Get javascript files from directories
    const js = fs.readdirSync(jsFolder);
    console.log(chalk.blue('Javscript: ') + 'Found ' + js.length + ' files');
    js.map((file) => {
        console.log(chalk.blue('Javascript file: ') + file);
    });

    // Minify
    await compressor.minify({
        compressor: 'gcc',
        input: jsFolder + '/*.js',
        output: './build/resource/script.js'
    });

    console.log(chalk.yellow('Message: ') + 'Minifying javascipt done');
}

process();