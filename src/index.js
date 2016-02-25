import PdfPrinter from "pdfmake";
import fs from "fs";

const defaultFonts = {
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-Italic.ttf"
  }
};

export default class Document {
  constructor(definition, vfs, fonts) {
    this.definition = definition;
    this.vfs = vfs;
    this.fonts = fonts || defaultFonts;
  }

  getPdfKitDoc(options) {
    const printer = new PdfPrinter(this.fonts);
    fs.applyVfs(this.vfs);
    return printer.createPdfKitDocument(this.definition, options);
  }

  getBuffer(options, done) {
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
    this.getBuffer(options, (buffer) => {
      done(buffer.toString("base64"));
    });
  }

  getDataUrl(options, done) {
    this.getBase64(options, (data) => {
      done(`data:application/pdf;base64,${data}`);
    });
  }

  print(filename) {
    filename = filename || "download.pdf";

    if (window.cordova && window.plugins.PrintPDF) {
      this.getBase64((data) => {
        window.plugins.PrintPDF.print({
          data: data
        });
      });
    } else {
      this.getBuffer((data) => {
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
