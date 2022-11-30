const { checkForDuplicates } = require('./functions');

const duplicated = checkForDuplicates();
if (duplicated.length > 0) {
    console.log(duplicated);
    throw new Error('Some musics are duplicated');
}