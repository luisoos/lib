// import { Pinecone, PineconeRecord, RecordMetadata } from '@pinecone-database/pinecone';
// import { env } from '~/env';

// export default async function run() {

//     const pc = new Pinecone({
//         apiKey: env.PINECONE_API_KEY
//     })

//     const indexName = 'quickstart';

//     // await pc.createIndex({
//     //     name: indexName,
//     //     dimension: 1024, // Replace with your model dimensions
//     //     metric: 'cosine', // Replace with your model metric
//     //     spec: {
//     //         serverless: {
//     //             cloud: 'aws',
//     //             region: 'us-east-1'
//     //         }
//     //     }
//     // });

//     const model = 'multilingual-e5-large';

//     // const data = [
//     //     { id: 'vec1', text: 'Apple is a popular fruit known for its sweetness and crisp texture.' },
//     //     { id: 'vec2', text: 'The tech company Apple is known for its innovative products like the iPhone.' },
//     //     { id: 'vec3', text: 'Many people enjoy eating apples as a healthy snack.' },
//     //     { id: 'vec4', text: 'Apple Inc. has revolutionized the tech industry with its sleek designs and user-friendly interfaces.' },
//     //     { id: 'vec5', text: 'An apple a day keeps the doctor away, as the saying goes.' },
//     //     { id: 'vec6', text: 'Apple Computer Company was founded on April 1, 1976, by Steve Jobs, Steve Wozniak, and Ronald Wayne as a partnership.' }
//     // ];

//     // const embeddings = await pc.inference.embed(
//     //   model,
//     //   data.map(d => d.text),
//     //   { inputType: 'passage', truncate: 'END' }
//     // );

//     // console.log(embeddings[0]);

//     const index = pc.index(indexName);

//     // const vectors: PineconeRecord<RecordMetadata>[] = data.map((d, i) => ({
//     //   id: d.id,
//     //   values: embeddings[i]!.values as number[],
//     //   metadata: { text: d.text }
//     // }));

//     // await index.namespace('ns1').upsert(vectors);

//     // const stats = await index.describeIndexStats();

//     // console.log(stats)

//     // const query = [
//     //     'Tell me about the tech company known as Apple.',
//     // ];

//     // const embedding = await pc.inference.embed(
//     //     model,
//     //     query,
//     //     { inputType: 'query' }
//     // );

//     //   // Usage:
//     //   const readableEmbeddings = formatEmbeddings(embedding);
//     //   console.log(JSON.stringify(readableEmbeddings, null, 2));

//     //   const queryResponse = await index.namespace("ns1").query({
//     //     topK: 3,
//     //     vector: embedding[0]!.values as number[],
//     //     includeValues: false,
//     //     includeMetadata: true
//     //   });

//     //   console.log(queryResponse);#

//     const results = await queryPinecone("What is the capital of france?");

//   // Process the results
//   const relevantTexts = results.map((match: { metadata: { text: any; }; }) => match.metadata.text);

//   // You can now use these relevant texts to generate a response
//   // For example, you might pass them to a language model like GPT-3

//   console.log('Relevant texts:', relevantTexts);
// }
// function formatEmbeddings(embeddingsList: any) {
//     return {
//       model: embeddingsList.model,
//       usage: embeddingsList.usage,
//       embeddings: embeddingsList[0].values.map((value: number, index: number) => {
//         return {
//           index,
//           value: value.toFixed(6) // Limit to 6 decimal places for readability
//         };
//       }).slice(0, 10) // Show only the first 10 values
//     };
//   }

//   async function queryPinecone(query: string, topK: number = 5) {
//     const queryEmbedding = await createEmbedding(query);

//     const queryResponse = await index.query({
//       vector: queryEmbedding,
//       topK: topK,
//       includeMetadata: true,
//     });

//     return queryResponse.matches;
//   }

//   async function createEmbedding(text: string): Promise<number[]> {
//     const result = await embedder.embedQuery(text);
//     return result;
//   }
