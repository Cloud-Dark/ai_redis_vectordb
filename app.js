import { createClient } from 'redis';
import ollama from 'ollama';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();
// Konfigurasi Redis
const redisClient = createClient({
    url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  });

redisClient.on('error', (err) => console.log('Redis Client Error:', err));

// Fungsi untuk membersihkan key yang tidak valid
async function cleanInvalidKeys() {
  try {
    const keys = await redisClient.keys('embedding:*');
    for (const key of keys) {
      const embeddingData = await redisClient.hGet(key, 'embedding');

      // Validasi: jika embeddingData tidak valid, hapus key
      if (!embeddingData || !embeddingData.startsWith('[')) {
        console.warn(`Deleting invalid key: ${key}`);
        await redisClient.del(key); // Hapus key yang tidak valid
      }
    }
    console.log('Invalid keys cleaned successfully.');
  } catch (error) {
    console.error('Error while cleaning invalid keys:', error);
  }
}

// Fungsi untuk menyimpan embedding ke Redis
async function addEmbedding(key, text) {
    try {
      const embeddingResponse = await ollama.embeddings({
        model: 'snowflake-arctic-embed:22m',
        prompt: text,
      });
  
      const embedding = embeddingResponse.embedding;
  
      // Cetak panjang (dimensi) embedding
      console.log(`Embedding dimensions for "${text}":`, embedding.length);
  
      const redisKey = `embedding:${key}`;
      await redisClient.hSet(redisKey, {
        text,
        embedding: JSON.stringify(embedding),
      });
  
      console.log(`Added embedding for: ${text}`);
    } catch (error) {
      console.error(`Error in addEmbedding for key ${key}:`, error);
    }
  }
  
// Fungsi untuk mencari similarity
async function searchSimilarity(query) {
  try {
    const queryResponse = await ollama.embeddings({
      model: 'snowflake-arctic-embed:22m',
      prompt: query,
    });

    const queryEmbedding = queryResponse.embedding;
    const keys = await redisClient.keys('embedding:*');
    let results = [];

    for (const key of keys) {
      const embeddingData = await redisClient.hGet(key, 'embedding');

      if (!embeddingData || !embeddingData.startsWith('[')) {
        console.error(`Invalid embedding data for key: ${key}`);
        continue;
      }

      const embedding = JSON.parse(embeddingData);
      const dotProduct = embedding.reduce((sum, val, i) => sum + val * queryEmbedding[i], 0);
      const normA = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      const normB = Math.sqrt(queryEmbedding.reduce((sum, val) => sum + val * val, 0));
      const similarity = dotProduct / (normA * normB);

      results.push({ key, similarity });
    }

    results.sort((a, b) => b.similarity - a.similarity);

    return results;
  } catch (error) {
    console.error('Error in searchSimilarity:', error);
    return [];
  }
}

// Main function
(async () => {
  try {
    await redisClient.connect();

    // Bersihkan key yang tidak valid
    await cleanInvalidKeys();

    // Tambahkan embeddings ke Redis
    await addEmbedding('1', 'This is a text about cats.');
    await addEmbedding('2', 'This text is about dogs.');
    await addEmbedding('3', 'This text is about animals.');

    // Cari similarity
    const results = await searchSimilarity('pet');
    console.log('Similarity Results:', results);

    await redisClient.disconnect();
  } catch (error) {
    console.error('Error in main function:', error);
  }
})();
