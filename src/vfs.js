function fixFilename(filename) {
	if (filename.indexOf(__dirname) === 0) {
		filename = filename.substring(__dirname.length);
	}

	if (filename.indexOf("/") === 0) {
		filename = filename.substring(1);
	}

	return filename;
}

class VirtualFileSystem {
  constructor() {
  	this.fileSystem = {};
  	this.base64System = {};
  }

  readFileSync(filename) {
  	filename = fixFilename(filename);

  	const base64content = this.base64System[filename];
  	if (base64content) {
  		return new Buffer(base64content, "base64");
  	}

  	return this.fileSystem[filename];
  }

  writeFileSync(filename, content) {
  	this.fileSystem[fixFilename(filename)] = content;
  }

  applyVfs(data) {
  	this.base64System = data;
  }
}

module.exports = new VirtualFileSystem();
