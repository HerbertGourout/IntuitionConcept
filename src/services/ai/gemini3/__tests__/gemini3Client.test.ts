/**
 * Tests unitaires pour Gemini3Client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Gemini3Client } from '../gemini3Client';
import type { GenerateContentRequest, GenerateContentResponse } from '../gemini3Types';

// Mock fetch global
global.fetch = vi.fn();

describe('Gemini3Client', () => {
  let client: Gemini3Client;

  beforeEach(() => {
    client = new Gemini3Client({
      apiKey: 'test-api-key',
      apiVersion: 'v1alpha'
    });
    vi.clearAllMocks();
  });

  describe('generateContent', () => {
    it('should make successful API call', async () => {
      const mockResponse: GenerateContentResponse = {
        candidates: [{
          content: {
            role: 'model',
            parts: [{ text: 'Test response' }]
          },
          finishReason: 'STOP'
        }],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const request: GenerateContentRequest = {
        model: 'gemini-3-pro-preview',
        contents: {
          role: 'user',
          parts: [{ text: 'Hello' }]
        }
      };

      const response = await client.generateContent(request);

      expect(response).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const mockResponse: GenerateContentResponse = {
        candidates: [{
          content: {
            role: 'model',
            parts: [{ text: 'Success after retry' }]
          },
          finishReason: 'STOP'
        }],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15
        }
      };

      // First call fails, second succeeds
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

      const request: GenerateContentRequest = {
        model: 'gemini-3-pro-preview',
        contents: {
          role: 'user',
          parts: [{ text: 'Hello' }]
        }
      };

      const response = await client.generateContent(request);

      expect(response).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const request: GenerateContentRequest = {
        model: 'gemini-3-pro-preview',
        contents: {
          role: 'user',
          parts: [{ text: 'Hello' }]
        }
      };

      await expect(client.generateContent(request)).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('extractText', () => {
    it('should extract text from response', () => {
      const response: GenerateContentResponse = {
        candidates: [{
          content: {
            role: 'model',
            parts: [
              { text: 'Hello ' },
              { text: 'World' }
            ]
          },
          finishReason: 'STOP'
        }],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15
        }
      };

      const text = client.extractText(response);
      expect(text).toBe('Hello World');
    });

    it('should return empty string for no text', () => {
      const response: GenerateContentResponse = {
        candidates: [{
          content: {
            role: 'model',
            parts: []
          },
          finishReason: 'STOP'
        }],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 0,
          totalTokenCount: 10
        }
      };

      const text = client.extractText(response);
      expect(text).toBe('');
    });
  });

  describe('extractThoughtSignature', () => {
    it('should extract thought signature from response', () => {
      const response: GenerateContentResponse = {
        candidates: [{
          content: {
            role: 'model',
            parts: [
              { thought_signature: 'test-signature-123' }
            ]
          },
          finishReason: 'STOP'
        }],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15
        }
      };

      const signature = client.extractThoughtSignature(response);
      expect(signature).toBe('test-signature-123');
    });

    it('should return undefined for no signature', () => {
      const response: GenerateContentResponse = {
        candidates: [{
          content: {
            role: 'model',
            parts: [{ text: 'No signature' }]
          },
          finishReason: 'STOP'
        }],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15
        }
      };

      const signature = client.extractThoughtSignature(response);
      expect(signature).toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('should track usage statistics', async () => {
      const mockResponse: GenerateContentResponse = {
        candidates: [{
          content: {
            role: 'model',
            parts: [{ text: 'Test' }]
          },
          finishReason: 'STOP'
        }],
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 50,
          totalTokenCount: 150
        }
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const request: GenerateContentRequest = {
        model: 'gemini-3-pro-preview',
        contents: {
          role: 'user',
          parts: [{ text: 'Hello' }]
        },
        config: {
          thinking_level: 'high'
        }
      };

      await client.generateContent(request);

      const stats = client.getStats();

      expect(stats.total_requests).toBe(1);
      expect(stats.successful_requests).toBe(1);
      expect(stats.failed_requests).toBe(0);
      expect(stats.total_tokens).toBe(150);
      expect(stats.by_thinking_level.high.requests).toBe(1);
    });
  });
});
