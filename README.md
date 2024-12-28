# Redis Embedding Similarity Example

This repository demonstrates how to work with **Redis** for storing and retrieving vector embeddings and how to compute similarity scores using embeddings generated from **Ollama's embedding API**.

## Features

1. **Store Embeddings**: Save text embeddings in Redis.
2. **Clean Invalid Keys**: Identify and remove invalid keys from Redis.
3. **Search Similarity**: Calculate similarity scores between a query and stored embeddings.

## Prerequisites

- Node.js (v16 or later)
- Redis instance
- `.env` file with the following variables:
  ```
  REDIS_USERNAME=<your_redis_username>
  REDIS_PASSWORD=<your_redis_password>
  REDIS_HOST=<your_redis_host>
  REDIS_PORT=<your_redis_port>
  ```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Cloud-Dark/ai_redis_vectordb/
   cd ai_redis_vectordb
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Redis configuration:
   ```bash
   REDIS_USERNAME=<your_redis_username>
   REDIS_PASSWORD=<your_redis_password>
   REDIS_HOST=<your_redis_host>
   REDIS_PORT=<your_redis_port>
   ```

## Usage

### 1. Run the script
Execute the script to clean invalid keys, store embeddings, and perform similarity search:
```bash
node index.js
```

### 2. Functionality Overview

- **`cleanInvalidKeys`**:  
  Iterates through all `embedding:*` keys in Redis and removes keys with invalid embedding data.

- **`addEmbedding(key, text)`**:  
  Generates an embedding for the provided text and stores it in Redis with the format:
  ```
  embedding:<key>
  {
    text: <original_text>,
    embedding: <vector_data>
  }
  ```

- **`searchSimilarity(query)`**:  
  Computes similarity between the query text's embedding and all stored embeddings in Redis, returning a sorted list of similarity scores.

### Example Output

```bash
Embedding dimensions for "This is a text about cats.": 512
Embedding dimensions for "This text is about dogs.": 512
Embedding dimensions for "This text is about animals.": 512
Similarity Results: [
  { key: 'embedding:3', similarity: 0.87 },
  { key: 'embedding:1', similarity: 0.75 },
  { key: 'embedding:2', similarity: 0.68 }
]
```

## Project Structure

- **`index.js`**: Main script containing all logic for interacting with Redis and the embedding API.
- **`.env`**: Environment configuration file.
- **Dependencies**:
  - `redis`: For connecting to Redis.
  - `ollama`: For generating text embeddings.
  - `dotenv`: For loading environment variables.

## Notes

- The embeddings are generated using the `snowflake-arctic-embed:22m` model via Ollama.
- Ensure your Redis server is accessible and correctly configured in the `.env` file.

## Contributing

Feel free to fork and submit pull requests if you have improvements or additional features to suggest.

## License

This project is licensed under the MIT License.

Enjoy using Redis embeddings, or don't. Either way, you're stuck with it. 🤷‍♂️
