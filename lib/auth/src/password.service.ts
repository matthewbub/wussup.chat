const passwordService = {
	hashPassword: async (password: string, providedSalt?: Uint8Array): Promise<string> => {
		try {
			const encoder = new TextEncoder();
			// use provided salt if available, otherwise generate a new one
			const salt = providedSalt || crypto.getRandomValues(new Uint8Array(16));

			// import the password as a key material
			const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, [
				'deriveBits',
				'deriveKey',
			]);

			// derive a key using PBKDF2 with the specified salt and iterations
			const key = await crypto.subtle.deriveKey(
				{
					name: 'PBKDF2',
					salt: salt,
					iterations: 100000,
					hash: 'SHA-256',
				},
				keyMaterial,
				{ name: 'AES-GCM', length: 256 },
				true,
				['encrypt', 'decrypt']
			);

			// export the derived key to a raw format
			const exportedKey = (await crypto.subtle.exportKey('raw', key)) as ArrayBuffer;
			const hashBuffer = new Uint8Array(exportedKey);

			// convert the hash buffer to a hex string
			const hashArray = Array.from(hashBuffer);
			const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

			// convert the salt to a hex string
			const saltHex = Array.from(salt)
				.map((b) => b.toString(16).padStart(2, '0'))
				.join('');

			// return the salt and hash as a combined string
			return `${saltHex}:${hashHex}`;
		} catch (error) {
			// handle any errors that occur during the hashing process
			throw new Error(`Failed to hash password: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	},
	verifyPassword: async (storedHash: string, passwordAttempt: string): Promise<boolean> => {
		try {
			// extract the salt and original hash from the stored hash
			const [saltHex, originalHash] = storedHash.split(':');

			// match the salt hex string to pairs of characters
			const matchResult = saltHex.match(/.{1,2}/g);
			if (!matchResult) {
				throw new Error('Invalid salt format');
			}

			// convert the matched result to a Uint8Array
			const salt = new Uint8Array(matchResult.map((byte) => parseInt(byte, 16)));

			// hash the password attempt using the extracted salt
			const attemptHashWithSalt = await passwordService.hashPassword(passwordAttempt, salt);

			// extract the hash from the result
			const [, attemptHash] = attemptHashWithSalt.split(':');

			// return true if the attempt hash matches the original hash
			return attemptHash === originalHash;
		} catch (error) {
			throw new Error(`Failed to verify password: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	},
};

export default passwordService;
