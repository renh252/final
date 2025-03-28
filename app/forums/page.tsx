import { prisma } from '@/lib/prisma';
import ForumPostList from '@/components/forum/ForumPostList';

export default async function ForumPage() {
  const posts = await prisma.forum_posts.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      category: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-brown-800 rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">「毛孩之家」寵物討論區</h1>
        <p className="text-brown-200">分享您的寵物故事、照片和經驗，與其他寵物愛好者交流。</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-4 text-brown-200">
            <span>{posts.length} 文章</span>
            <span>1 用戶</span>
            <span>5 分類</span>
          </div>
          <a
            href="/forums/publish"
            className="bg-brown-600 hover:bg-brown-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            發布新文章
          </a>
        </div>
      </div>
      <ForumPostList posts={posts} />
    </div>
  );
}
