import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract text content from a PDF file
 */
export async function extractContentFromPDF(
  fileBuffer: Buffer
): Promise<{ content: string; metadata: any }> {
  try {
    // Use Gemini to extract content from PDF directly
    // This handles both text-based and scanned PDFs
    return await extractWithGeminiVision(fileBuffer, "application/pdf");
  } catch (error) {
    console.error("Error extracting PDF content:", error);
    throw new Error(`Failed to extract PDF content: ${error}`);
  }
}

/**
 * Extract text content from a PowerPoint file
 */
export async function extractContentFromPPTX(
  fileBuffer: Buffer
): Promise<{ content: string; metadata: any }> {
  try {
    // Use Gemini to extract content from PPTX
    return await extractWithGeminiVision(
      fileBuffer,
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
  } catch (error) {
    console.error("Error extracting PPTX content:", error);
    throw new Error(`Failed to extract PPTX content: ${error}`);
  }
}

/**
 * Extract text content from an image file
 */
export async function extractContentFromImage(
  fileBuffer: Buffer,
  mimeType: string
): Promise<{ content: string; metadata: any }> {
  try {
    return await extractWithGeminiVision(fileBuffer, mimeType);
  } catch (error) {
    console.error("Error extracting image content:", error);
    throw new Error(`Failed to extract image content: ${error}`);
  }
}

/**
 * Use Gemini Vision to extract text from files
 */
async function extractWithGeminiVision(
  fileBuffer: Buffer,
  mimeType: string
): Promise<{ content: string; metadata: any }> {
  try {
    // Use gemini-2.0-flash or gemini-1.5-flash-latest for multimodal content
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Extract all text content from this document. 
    
Instructions:
- Extract ALL text, including headings, paragraphs, bullet points, captions, etc.
- Preserve the structure and formatting as much as possible
- If there are multiple pages/slides, clearly separate them
- For diagrams or images with text, extract any visible text
- If there are tables, preserve their structure
- Return ONLY the extracted text, no additional commentary

Extracted text:`;

    const imagePart = {
      inlineData: {
        data: fileBuffer.toString("base64"),
        mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    return {
      content: text,
      metadata: {
        extractionMethod: "gemini-vision",
        model: "gemini-2.0-flash",
        mimeType,
      },
    };
  } catch (error) {
    console.error("Error with Gemini Vision extraction:", error);
    throw error;
  }
}

/**
 * Main extraction function that routes to the appropriate extractor
 */
export async function extractContent(
  fileBuffer: Buffer,
  fileType: string,
  mimeType?: string
): Promise<{ content: string; metadata: any }> {
  const type = fileType.toLowerCase();

  switch (type) {
    case "pdf":
      return extractContentFromPDF(fileBuffer);
    case "pptx":
      return extractContentFromPPTX(fileBuffer);
    case "image":
      if (!mimeType) {
        throw new Error("mimeType is required for image extraction");
      }
      return extractContentFromImage(fileBuffer, mimeType);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}
