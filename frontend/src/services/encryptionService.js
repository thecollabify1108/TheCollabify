import * as openpgp from 'openpgp';

/**
 * Guardian Elite: Frontend Encryption Service
 * Handles PGP key generation, encryption, and decryption on the client side.
 */

class EncryptionService {
    /**
     * Generate a new PGP key pair for the user
     */
    async generateKeyPair(name, email) {
        const { privateKey, publicKey } = await openpgp.generateKey({
            type: 'rsa',
            rsaBits: 2048,
            userIDs: [{ name, email }],
        });

        return { privateKey, publicKey };
    }

    /**
     * Encrypt a message using the recipient's public key
     */
    async encryptMessage(content, recipientPublicKeyArmored) {
        const publicKey = await openpgp.readKey({ armoredKey: recipientPublicKeyArmored });

        const encrypted = await openpgp.encrypt({
            message: await openpgp.createMessage({ text: content }),
            encryptionKeys: publicKey
        });

        return encrypted;
    }

    /**
     * Decrypt a message using the user's private key
     */
    async decryptMessage(encryptedContent, privateKeyArmored, passphrase) {
        try {
            const privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });

            // If the key is encrypted with a passphrase
            // const unlockedKey = await openpgp.decryptKey({ privateKey, passphrase });

            const message = await openpgp.readMessage({
                armoredMessage: encryptedContent
            });

            const { data: decrypted } = await openpgp.decrypt({
                message,
                decryptionKeys: privateKey
            });

            return decrypted;
        } catch (error) {
            console.error('Decryption failed:', error);
            return '[This message is encrypted and could not be decrypted]';
        }
    }

    /**
     * Key Storage Helpers (using localStorage for simplicity in this build)
     * In a high-security production app, we might use more advanced browser storage.
     */
    savePrivateKey(userId, privateKey) {
        localStorage.setItem(`pgp_private_key_${userId}`, privateKey);
    }

    getPrivateKey(userId) {
        return localStorage.getItem(`pgp_private_key_${userId}`);
    }

    hasPrivateKey(userId) {
        return !!this.getPrivateKey(userId);
    }
}

export default new EncryptionService();
