declare module "pdf-parse" {
  interface PdfParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    text: string;
    version: string;
  }

  interface PdfParseOptions {
    pagerender?: (pageData: unknown) => Promise<string> | string;
    max?: number;
    version?: string;
  }

  function pdfParse(
    dataBuffer: Buffer | Uint8Array,
    options?: PdfParseOptions,
  ): Promise<PdfParseResult>;

  export default pdfParse;
}
