// Replaces '~' with colon and removes leading zeros
const title = (str) => str.replace(/~/g, ': ').replace(/^0/, '').replace('.md', '')

// Removes indexing before '~' and '.md'
const pageTitle = (str) => str.replace('.md', '').split('~')[1]

// Removes indexing before '~' and non-alphanumeric characters, replaces spaces with '-' and converts to lowercase
const path = (str) => str.split('~')[1].replace('.md', '').replace(/[^\w\s]/gi, '').replace(/\s/g, '-').toLowerCase()

module.exports = {
    title,
    pageTitle,
    path
}