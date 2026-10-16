import ImageKit from '@imagekit/nodejs';
import { env } from './env.js';

export const imagekit = new ImageKit({
    privateKey: env.imagekitPrivateKey
});
