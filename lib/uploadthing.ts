import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const f = createUploadthing();

export const ourFileRouter = {
  productImageUploader: f({
    image: { maxFileSize: '16MB', maxFileCount: 10 },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session || session.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
