// // FILEPATH: c:/Users/Martin/Desktop/final/app/forum/_components/PostList.js

// "use client"

// import React, { useState, useEffect } from "react"
// import Link from "next/link"
// import Image from "next/image"
// import { Card, Row, Col, Badge } from 'react-bootstrap'
// import { Heart, ChatDots, Eye } from "react-bootstrap-icons"
// //import { useArticleContext } from "@/context/ArticleContext"
// //import { formatDistanceToNow } from "date-fns"

// const PostList = () => {
//   const [posts, setPosts] = useState([])
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalItems: 0,
//   })
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState(null)
//   //const { readArticles, markArticleAsRead } = useArticleContext()

//   const fetchPosts = async (page) => {
//     try {
//       setIsLoading(true)
//       const res = await fetch(`/api/forum/list?page=${page}`)

//       if (!res.ok) {
//         throw new Error("Failed to fetch posts")
//       }

//       const data = await res.json()
//       setPosts(data.articles)
//       setPagination(data.pagination)
//     } catch (err) {
//       setError("Failed to load posts")
//       console.error(err)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchPosts(1)
//   }, [])

//   const handlePageChange = (page) => {
//     fetchPosts(page)
//     window.scrollTo({ top: 0, behavior: "smooth" })
//   }

//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         {[1, 2, 3, 4, 5].map((i) => (
//           <Card key={i} className="mb-3 animate-pulse">
//             <Card.Body>
//               <Row>
//                 <Col md={9}>
//                   <div className="h-6 bg-gray-200 rounded mb-4" />
//                   <div className="h-4 bg-gray-200 rounded mb-2" />
//                   <div className="h-4 bg-gray-200 rounded mb-4 w-2/3" />
//                   <div className="d-flex justify-content-between">
//                     <div className="h-4 bg-gray-200 rounded w-25" />
//                     <div className="h-4 bg-gray-200 rounded w-25" />
//                     <div className="h-4 bg-gray-200 rounded w-25" />
//                   </div>
//                 </Col>
//                 <Col md={3}>
//                   <div className="h-24 w-24 bg-gray-200 rounded" />
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//         ))}
//       </div>
//     )
//   }

//   if (error) {
//     return <div className="text-danger">{error}</div>
//   }

//   return (
//     <div>
//       <div className="space-y-6">
//         {posts.map((post) => (
//           <Link key={post.id} href={`/article/${post.id}`} onClick={() => markArticleAsRead(post.id)}>
//             <Card className={`mb-3 ${readArticles.includes(post.id) ? "bg-light" : ""}`}>
//               <Card.Body>
//                 <Row>
//                   <Col md={post.image ? 9 : 12}>
//                     <Card.Title>{post.title}</Card.Title>
//                     <div className="d-flex align-items-center mb-3">
//                       <div className="position-relative h-6 w-6 rounded-circle overflow-hidden mr-2">
//                         <Image
//                           src={post.author.avatar || "/placeholder.svg"}
//                           alt={post.author.name}
//                           layout="fill"
//                           objectFit="cover"
//                         />
//                       </div>
//                       <span className="text-muted mr-3">{post.author.name}</span>
//                       <small className="text-muted">
//                         {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
//                       </small>
//                     </div>
//                     <Card.Text className="text-truncate">{post.summary}</Card.Text>
//                     <div className="d-flex align-items-center text-muted">
//                       <Badge bg="light" text="dark" className="mr-2">
//                         <Heart className="mr-1" /> {post.likes}
//                       </Badge>
//                       <Badge bg="light" text="dark" className="mr-2">
//                         <ChatDots className="mr-1" /> {post.comments}
//                       </Badge>
//                       <Badge bg="light" text="dark">
//                         <Eye className="mr-1" /> {post.views}
//                       </Badge>
//                     </div>
//                   </Col>
//                   {post.image && (
//                     <Col md={3}>
//                       <div className="position-relative h-24 w-24 rounded overflow-hidden">
//                         <Image
//                           src={post.image || "/placeholder.svg"}
//                           alt={post.title}
//                           layout="fill"
//                           objectFit="cover"
//                         />
//                       </div>
//                     </Col>
//                   )}
//                 </Row>
//               </Card.Body>
//             </Card>
//           </Link>
//         ))}
//       </div>

//       {pagination.totalPages > 1 && (
//         <div className="mt-4 d-flex justify-content-center">
//           {/* 這裡應該放置分頁組件，但由於我們沒有確認 Pagination 組件的存在，所以暫時註釋掉 */}
//           {/* <Pagination
//             currentPage={pagination.currentPage}
//             totalPages={pagination.totalPages}
//             onPageChange={handlePageChange}
//           /> */}
//         </div>
//       )}
//     </div>
//   )
// }

// export default PostList