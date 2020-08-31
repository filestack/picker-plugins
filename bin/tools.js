const glob = require('glob');
const path = require('path');

const PATH = path.join(__dirname, '..', 'packages', '*', 'package.json');

const getPackages = () => {
  const packages = glob.sync(PATH);
  const toReturn = [];

  for (const pkg of packages) {

    const dirName = path.dirname(pkg);
    const name = path.basename(dirName);

    toReturn.push({
      name: name,
      path: dirName,
    });
  }

  return toReturn;
};

module.exports = {
  getPackages,
};
