import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface Post {
  id: number;
  title: string;
  content: string;
  images: string[];
  created_at: Date;
  author: {
    id: number;
    name: string;
    avatar: string | null;
  };
  _count: {
    comments: number;
    likes: number;
  };
}

interface ForumPostListProps {
  posts: Post[];
}

export default function ForumPostList({ posts }: ForumPostListProps) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-brown-200 overflow-hidden">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brown-600">
                    {post.author.name[0]}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-brown-800">{post.author.name}</span>
                <span className="text-sm text-brown-500">
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: zhTW,
                  })}
                </span>
              </div>
              <Link href={`/forums/posts/${post.id}`}>
                <h2 className="text-lg font-semibold text-brown-900 hover:text-brown-700 mb-2">
                  {post.title}
                </h2>
              </Link>
              <p className="text-brown-600 mb-4 line-clamp-2">{post.content}</p>
              
              {/* Image Preview */}
              {post.images && post.images.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {post.images.slice(0, 3).map((image, index) => (
                    <div key={index} className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={image}
                        alt={`Post image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))}
                  {post.images.length > 3 && (
                    <div className="relative w-24 h-24 flex-shrink-0 bg-brown-100 rounded-lg flex items-center justify-center">
                      <span className="text-brown-600">+{post.images.length - 3}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-brown-500">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{post._count.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{post._count.comments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
