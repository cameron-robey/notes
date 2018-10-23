# Notes

A simple NodeJS tool to compile Markdown notes to static HTML

**To install:**
`npm install`
`npm install -g node-sass`

**To build:**
`npm run build`

**To add data:**

Data is stored inside a `/data` directory.

Inside that `/data/content` holds markdown files. Folders in the form `/data/content/*` form first level navigation and `.md` files in there appear in the navigation bar. Additionally, folders in the form `/data/content/*/*` form second level navigation - `.md` files will appear in the navigation.

Inside `/data/img` images can be placed and these will be processed and compressed. Images referenced in markdown should have the url `/img/*` where `*` is the file name inside `/data/content/img`.
