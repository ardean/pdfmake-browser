import PdfPrinter from "pdfmake";

const defaultFonts = {};

export default class Pdf {
  constructor(template, fonts) {
    this.template = template;
    this.fonts = fonts || defaultFonts;
    
    Object.keys(this.fonts).forEach((fontName) => {
      const font = this.fonts[fontName];
      Object.keys(font).forEach((typeName) => {
        let type = font[typeName];
        if (typeof type === "string") {
          type = new Buffer(type, "base64");
        }
        font[typeName] = type;
      });

      this.fonts[fontName] = font;
    });
  }

  getPdfKitDoc(options) {
    options = options || {};

    const printer = new PdfPrinter(this.fonts);
    return printer.createPdfKitDocument(this.template, options);
  }

  getBuffer(options, done) {
    options = options || {};

    const doc = this.getPdfKitDoc(options);
    const chunks = [];
    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      done(Buffer.concat(chunks));
    });

    doc.end();
  }

  getBase64(options, done) {
    options = options || {};

    this.getBuffer(options, (buffer) => {
      done(buffer.toString("base64"));
    });
  }

  getDataUrl(options, done) {
    options = options || {};

    this.getBase64(options, (data) => {
      done(`data:application/pdf;base64,${data}`);
    });
  }

  print(filename, options) {
    filename = filename || "download.pdf";
    options = options || {};

    if (window.cordova && window.plugins.PrintPDF) {
      this.getBase64(options, (data) => {
        window.plugins.PrintPDF.print({
          data: data
        });
      });
    } else {
      this.getBuffer(options, (data) => {
        const blob = new Blob([data], {
          type: "application/pdf"
        });

        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveBlob(blob, filename);
        } else {
          const element = window.document.createElement("a");
          element.href = window.URL.createObjectURL(blob);
          element.download = filename;
          element.style.display = "none";
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }
      });
    }
  }
}
