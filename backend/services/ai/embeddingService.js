/**
 * Embedding Service — Semantic Matching Engine
 * 
 * Generates and manages text embeddings for semantic similarity matching.
 * Uses Google's text-embedding-004 model via Gemini API.
 * Falls back to TF-IDF based local embeddings when API unavailable.
 * 
 * Stores embeddings in PostgreSQL (JSON column) with cosine similarity search.
 * For scale: migrate to pgvector extension or Pinecone/Qdrant.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../../config/prisma');

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

const EMBEDDING_MODEL = 'text-embedding-004';
const EMBEDDING_DIMENSIONS = 768;

// Entity types for embeddings
const ENTITY_TYPES = {
    CREATOR_BIO: 'CREATOR_BIO',
    CREATOR_CONTENT: 'CREATOR_CONTENT',
    BRAND_CAMPAIGN: 'BRAND_CAMPAIGN',
    BRAND_REQUIREMENTS: 'BRAND_REQUIREMENTS'
};

class EmbeddingService {

    /**
     * Generate embedding vector from text using Gemini API
     * Falls back to local TF-IDF if API unavailable
     */
    static async generateEmbedding(text) {
        if (!text || text.trim().length === 0) {
            return new Array(EMBEDDING_DIMENSIONS).fill(0);
        }

        // Truncate to ~8000 chars (API limit for embedding models)
        const truncated = text.slice(0, 8000);

        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
                const result = await model.embedContent(truncated);
                return result.embedding.values;
            } catch (error) {
                console.warn('Embedding API error, using local fallback:', error.message);
                return this._localEmbedding(truncated);
            }
        }

        return this._localEmbedding(truncated);
    }

    /**
     * Local TF-IDF-inspired embedding fallback
     * Produces a deterministic vector from text features
     */
    static _localEmbedding(text) {
        const vector = new Array(EMBEDDING_DIMENSIONS).fill(0);
        const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
        const uniqueWords = [...new Set(words)];

        for (let i = 0; i < uniqueWords.length; i++) {
            const word = uniqueWords[i];
            // Hash word to position in vector
            let hash = 0;
            for (let j = 0; j < word.length; j++) {
                hash = ((hash << 5) - hash) + word.charCodeAt(j);
                hash |= 0;
            }
            const pos = Math.abs(hash) % EMBEDDING_DIMENSIONS;
            // TF component: word frequency
            const tf = words.filter(w => w === word).length / words.length;
            // IDF approximation: shorter words are more common
            const idf = Math.log(1 + word.length / 3);
            vector[pos] += tf * idf;
        }

        // L2 normalize
        const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
        return vector.map(v => v / magnitude);
    }

    /**
     * Compute cosine similarity between two vectors
     */
    static cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

        let dot = 0, magA = 0, magB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dot += vecA[i] * vecB[i];
            magA += vecA[i] * vecA[i];
            magB += vecB[i] * vecB[i];
        }

        const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
        return magnitude === 0 ? 0 : dot / magnitude;
    }

    /**
     * Store or update an embedding for an entity
     */
    static async upsertEmbedding(entityType, entityId, text) {
        const vector = await this.generateEmbedding(text);

        return prisma.embedding.upsert({
            where: {
                entityType_entityId: { entityType, entityId }
            },
            update: {
                text,
                vector,
                model: genAI ? EMBEDDING_MODEL : 'local-tfidf',
                dimensions: EMBEDDING_DIMENSIONS,
                updatedAt: new Date()
            },
            create: {
                entityType,
                entityId,
                text,
                vector,
                model: genAI ? EMBEDDING_MODEL : 'local-tfidf',
                dimensions: EMBEDDING_DIMENSIONS
            }
        });
    }

    /**
     * Generate and store creator bio embedding
     */
    static async embedCreatorProfile(creatorProfile) {
        const textParts = [
            creatorProfile.category,
            creatorProfile.bio || '',
            (creatorProfile.strengths || []).join(', '),
            (creatorProfile.promotionTypes || []).join(', '),
            (creatorProfile.collaborationTypes || []).join(', '),
            creatorProfile.pastExperience || ''
        ];
        const text = textParts.filter(Boolean).join(' | ');

        return this.upsertEmbedding(ENTITY_TYPES.CREATOR_BIO, creatorProfile.id, text);
    }

    /**
     * Generate and store brand campaign embedding
     */
    static async embedCampaign(campaign) {
        const textParts = [
            campaign.title,
            campaign.description,
            campaign.targetCategory,
            campaign.promotionType,
            campaign.campaignGoal,
            campaign.locationType || 'REMOTE'
        ];
        const text = textParts.filter(Boolean).join(' | ');

        return this.upsertEmbedding(ENTITY_TYPES.BRAND_CAMPAIGN, campaign.id, text);
    }

    /**
     * Find semantically similar creators for a campaign
     * Returns creators sorted by embedding similarity
     */
    static async findSimilarCreators(campaignId, limit = 50) {
        // Get campaign embedding
        const campaignEmb = await prisma.embedding.findUnique({
            where: {
                entityType_entityId: {
                    entityType: ENTITY_TYPES.BRAND_CAMPAIGN,
                    entityId: campaignId
                }
            }
        });

        if (!campaignEmb) return [];

        // Get all creator embeddings
        const creatorEmbs = await prisma.embedding.findMany({
            where: { entityType: ENTITY_TYPES.CREATOR_BIO }
        });

        // Compute similarities
        const similarities = creatorEmbs.map(emb => ({
            creatorId: emb.entityId,
            similarity: this.cosineSimilarity(campaignEmb.vector, emb.vector)
        }));

        // Sort by similarity descending
        similarities.sort((a, b) => b.similarity - a.similarity);

        return similarities.slice(0, limit);
    }

    /**
     * Compute semantic similarity between a creator and a campaign
     */
    static async getCreatorCampaignSimilarity(creatorId, campaignId) {
        const [creatorEmb, campaignEmb] = await Promise.all([
            prisma.embedding.findUnique({
                where: {
                    entityType_entityId: {
                        entityType: ENTITY_TYPES.CREATOR_BIO,
                        entityId: creatorId
                    }
                }
            }),
            prisma.embedding.findUnique({
                where: {
                    entityType_entityId: {
                        entityType: ENTITY_TYPES.BRAND_CAMPAIGN,
                        entityId: campaignId
                    }
                }
            })
        ]);

        if (!creatorEmb || !campaignEmb) return 0;

        return this.cosineSimilarity(creatorEmb.vector, campaignEmb.vector);
    }

    /**
     * Batch embed all creators (for initial setup or reindex)
     */
    static async batchEmbedCreators(batchSize = 50) {
        let processed = 0;
        let skip = 0;

        while (true) {
            const creators = await prisma.creatorProfile.findMany({
                skip,
                take: batchSize,
                include: { user: { select: { name: true } } }
            });

            if (creators.length === 0) break;

            await Promise.all(
                creators.map(creator => this.embedCreatorProfile(creator))
            );

            processed += creators.length;
            skip += batchSize;
            console.log(`[EmbeddingService] Embedded ${processed} creators`);
        }

        return processed;
    }

    /**
     * Batch embed all campaigns
     */
    static async batchEmbedCampaigns(batchSize = 50) {
        let processed = 0;
        let skip = 0;

        while (true) {
            const campaigns = await prisma.promotionRequest.findMany({
                skip,
                take: batchSize
            });

            if (campaigns.length === 0) break;

            await Promise.all(
                campaigns.map(campaign => this.embedCampaign(campaign))
            );

            processed += campaigns.length;
            skip += batchSize;
            console.log(`[EmbeddingService] Embedded ${processed} campaigns`);
        }

        return processed;
    }
}

module.exports = EmbeddingService;
module.exports.ENTITY_TYPES = ENTITY_TYPES;
