/**
 * Nexus Adaptive Compression Engine (NACE)
 * World-class optimization for P2P communication.
 */

export interface CompressedEnvelope {
  type: 'RAW' | 'COMPRESSED';
  payload: ArrayBuffer;
  originalSize: number;
  compressedSize: number;
}

const COMPRESSION_THRESHOLD = 128; // Bytes

export class NexusCompressionService {
  /**
   * Encodes and compresses data for network transmission.
   */
  static async compress(data: any): Promise<CompressedEnvelope> {
    const jsonStr = JSON.stringify(data);
    const textEncoder = new TextEncoder();
    const rawData = textEncoder.encode(jsonStr);
    
    if (rawData.length < COMPRESSION_THRESHOLD) {
      return { 
        type: 'RAW', 
        payload: rawData.buffer, 
        originalSize: rawData.length,
        compressedSize: rawData.length 
      };
    }

    try {
      // Using browser-native CompressionStream (Deflate-Raw)
      const stream = new Blob([rawData]).stream();
      const compressionStream = new CompressionStream('deflate-raw');
      const compressedStream = stream.pipeThrough(compressionStream);
      
      const response = new Response(compressedStream);
      const compressedBuffer = await response.arrayBuffer();

      console.log(`📦 NACE_COMPRESSION::SAVED ${rawData.length - compressedBuffer.byteLength} BYTES`);

      return {
        type: 'COMPRESSED',
        payload: compressedBuffer,
        originalSize: rawData.length,
        compressedSize: compressedBuffer.byteLength
      };
    } catch (error) {
      console.warn("NACE_COMPRESSION_FAULT::FALLBACK_TO_RAW", error);
      return { 
        type: 'RAW', 
        payload: rawData.buffer, 
        originalSize: rawData.length,
        compressedSize: rawData.length 
      };
    }
  }

  /**
   * Decompresses and decodes data received from the network.
   */
  static async decompress(envelope: CompressedEnvelope): Promise<any> {
    if (envelope.type === 'RAW') {
      const textDecoder = new TextDecoder();
      return JSON.parse(textDecoder.decode(envelope.payload));
    }

    try {
      const stream = new Blob([envelope.payload]).stream();
      const decompressionStream = new DecompressionStream('deflate-raw');
      const decompressedStream = stream.pipeThrough(decompressionStream);
      
      const response = new Response(decompressedStream);
      const decompressedBuffer = await response.arrayBuffer();
      
      const textDecoder = new TextDecoder();
      const decodedStr = textDecoder.decode(decompressedBuffer);
      return JSON.parse(decodedStr);
    } catch (error) {
      console.error("NACE_DECOMPRESSION_CRITICAL_FAILURE", error);
      throw new Error("Could not decompress payload. Integrity check failed.");
    }
  }
}
